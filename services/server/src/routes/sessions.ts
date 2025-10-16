import express, { type Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { AIService } from '../services/ai.js'
import { BlockchainService } from '../services/blockchain.js'
import { CacheService } from '../services/cache.js'
import type { ApiResponse, SessionResponse } from '../types/api.js'
import { logger } from '../utils/logger.js'

const router: Router = express.Router()

// Service instances
const blockchain = new BlockchainService()
const ai = new AIService()
const cache = new CacheService()

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      data: errors.array(),
      timestamp: Date.now(),
      version: '1.0.0'
    }
    return res.status(400).json(response)
  }
  next()
}

// POST /api/sessions - Create new session
router.post('/',
  [
    body('provider').isEthereumAddress().withMessage('Invalid provider address'),
    body('amount').isNumeric().withMessage('Amount must be numeric'),
    body('model').isString().isLength({ min: 1, max: 50 }),
    body('prompt').isString().isLength({ min: 1, max: 4000 }),
    body('maxTokens').optional().isInt({ min: 10, max: 4000 }),
    body('temperature').optional().isFloat({ min: 0, max: 2 }),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    try {
      const { provider, amount, model, prompt, maxTokens, temperature } = req.body
      
      // Generate session identifiers
      const requestId = blockchain.generateRequestId()
      const inputHash = blockchain.generateInputHash(prompt, model)
      
      // Estimate AI costs
      const costEstimate = await ai.estimateCost(prompt, maxTokens)
      
      // Create session data
      const sessionData: SessionResponse = {
        requestId,
        status: 'pending',
        provider,
        model,
        amount,
        amountUSD: blockchain.calculateUSDCost(amount).toString(),
        inputHash,
        prompt,
        createdAt: Date.now(),
        txHashes: {},
        explorerLinks: {},
        usage: {
          promptTokens: costEstimate.estimatedInputTokens,
          completionTokens: costEstimate.estimatedOutputTokens,
          totalTokens: costEstimate.estimatedInputTokens + costEstimate.estimatedOutputTokens,
          cost: costEstimate.estimatedCost
        }
      }
      
      // Cache the session
      try {
        await cache.cacheSession(requestId, sessionData, 3600) // 1 hour TTL
      } catch (error) {
        logger.warn('Failed to cache session', { error: error instanceof Error ? error.message : String(error) })
      }
      
      logger.info('Session created successfully', { requestId, inputHash })
      
      const response: ApiResponse = {
        success: true,
        data: sessionData,
        timestamp: Date.now(),
        version: '1.0.0'
      }
      
      res.status(201).json(response)
    } catch (error) {
      logger.error('Session creation failed', { error })
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create session',
        code: 'SESSION_CREATION_ERROR',
        timestamp: Date.now(),
        version: '1.0.0'
      }
      res.status(500).json(response)
    }
  }
)

// POST /api/sessions/:requestId/process - Process AI inference for existing session
router.post('/:requestId/process',
  [
    body('requestId').matches(/^0x[a-fA-F0-9]{64}$/),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    const { requestId } = req.body
    
    try {
      logger.info('Processing session', { requestId })
      
      // Get session from blockchain
      const session = await blockchain.getSession(requestId as `0x${string}`)
      
      if (session.settled) {
        return res.status(400).json({
          success: false,
          error: 'Session already settled',
          code: 'SESSION_SETTLED',
          timestamp: Date.now(),
          version: '1.0.0'
        } as ApiResponse)
      }
      
      // Check if session is being processed
      const cachedSession = await cache.getSession(requestId)
      if (cachedSession?.status === 'processing') {
        return res.json({
          success: true,
          data: cachedSession,
          timestamp: Date.now(),
          version: '1.0.0'
        } as ApiResponse<SessionResponse>)
      }
      
      // Mark as processing
      const processingSession: Partial<SessionResponse> = {
        requestId,
        status: 'processing',
        provider: session.provider,
        model: session.model,
        amount: blockchain.formatUSDC(session.amount),
        amountUSD: blockchain.calculateUSDCost(blockchain.formatUSDC(session.amount)).toString(),
        inputHash: session.inputHash,
        createdAt: Number(session.createdAt),
        processing: {
          startedAt: Date.now(),
          progress: 'Generating AI response...'
        }
      }
      
      await cache.cacheSession(requestId, processingSession, 3600)
      
      // Start processing in background
      processSessionAsync(requestId as `0x${string}`, session)
        .catch(error => {
          logger.error('Background processing failed', { requestId, error })
        })
      
      const response: ApiResponse<SessionResponse> = {
        success: true,
        data: processingSession as SessionResponse,
        timestamp: Date.now(),
        version: '1.0.0'
      }
      
      res.json(response)
    } catch (error) {
      logger.error('Session processing failed', { requestId, error })
      const response: ApiResponse = {
        success: false,
        error: 'Failed to process session',
        code: 'PROCESSING_ERROR',
        timestamp: Date.now(),
        version: '1.0.0'
      }
      res.status(500).json(response)
    }
  }
)

// GET /api/sessions/:requestId - Get session status
router.get('/:requestId',
  [
    param('requestId').matches(/^0x[a-fA-F0-9]{64}$/),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    const { requestId } = req.params
    
    try {
      // Check cache first
      let sessionData = await cache.getSession(requestId)
      
      if (!sessionData) {
        // Get from blockchain
        const session = await blockchain.getSession(requestId as `0x${string}`)
        
        sessionData = {
          requestId,
          status: session.settled ? 'completed' : 'pending',
          provider: session.provider,
          model: session.model,
          amount: blockchain.formatUSDC(session.amount),
          amountUSD: blockchain.calculateUSDCost(blockchain.formatUSDC(session.amount)).toString(),
          inputHash: session.inputHash,
          createdAt: Number(session.createdAt),
          outputRef: session.outputRef || undefined,
          explorerLinks: blockchain.generateExplorerLinks()
        }
      }
      
      const response: ApiResponse<SessionResponse> = {
        success: true,
        data: sessionData,
        timestamp: Date.now(),
        version: '1.0.0'
      }
      
      res.json(response)
    } catch (error) {
      logger.error('Failed to get session', { requestId, error })
      const response: ApiResponse = {
        success: false,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND',
        timestamp: Date.now(),
        version: '1.0.0'
      }
      res.status(404).json(response)
    }
  }
)

// Background processing function
async function processSessionAsync(requestId: `0x${string}`, session: any) {
  try {
    logger.info('Starting background AI processing', { requestId })
    
    // Get the prompt from cache or reconstruct from input hash
    let prompt = 'Generate a helpful AI response'
    const cachedData = await cache.getSession(requestId)
    if (cachedData?.prompt) {
      prompt = cachedData.prompt
    }
    
    // Generate AI response
    const aiResponse = await ai.generateResponse(prompt, {
      model: session.model,
      maxTokens: 2000,
      temperature: 0.7
    })
    
    // Generate output reference
    const outputRef = ai.generateOutputUrl(requestId)
    
    // Confirm success on blockchain
    const txHash = await blockchain.confirmSuccess(requestId, outputRef)
    
    // Create EAS attestation
    const attestationUID = await blockchain.createAttestation({
      payer: session.payer,
      provider: session.provider,
      requestId,
      model: session.model,
      priceUSDC: session.amount,
      inputHash: session.inputHash,
      outputRef,
      status: 1, // Completed
      txHash
    })
    
    // Update cached session
    const completedSession: SessionResponse = {
      requestId,
      status: 'completed',
      payer: session.payer,
      provider: session.provider,
      model: session.model,
      amount: blockchain.formatUSDC(session.amount),
      amountUSD: blockchain.calculateUSDCost(blockchain.formatUSDC(session.amount)).toString(),
      inputHash: session.inputHash,
      output: aiResponse.content,
      outputRef,
      createdAt: Number(session.createdAt),
      completedAt: Date.now(),
      txHashes: {
        confirmSuccess: txHash
      },
      attestationUID,
      explorerLinks: blockchain.generateExplorerLinks(txHash, attestationUID),
      usage: {
        promptTokens: aiResponse.usage.prompt_tokens,
        completionTokens: aiResponse.usage.completion_tokens,
        totalTokens: aiResponse.usage.total_tokens,
        cost: aiResponse.cost
      }
    }
    
    await cache.cacheSession(requestId, completedSession, 86400) // Cache for 24 hours
    
    logger.info('Session processing completed successfully', { 
      requestId, 
      txHash, 
      attestationUID,
      usage: aiResponse.usage
    })
    
  } catch (error) {
    logger.error('Background processing failed', { requestId, error })
    
    // Update session as failed
    const failedSession = {
      requestId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: Date.now()
    }
    
    await cache.cacheSession(requestId, failedSession, 3600)
  }
}

export default router