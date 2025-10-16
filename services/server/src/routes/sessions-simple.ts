import { Router } from 'express'
import OpenAI from 'openai'
import { config } from '../config/env.js'
import type { ApiResponse } from '../types/api.js'
import { logger } from '../utils/logger.js'

const router: Router = Router()

// Initialize OpenAI client with timeout
const openai = new OpenAI({
  apiKey: config.ai.apiKey,
  baseURL: config.ai.baseUrl,
  timeout: config.timeouts.upstream
})

// In-memory session storage (replace with Redis/DB in production)
const sessions = new Map<string, any>()

// POST /api/sessions - Create new session and process AI request
router.post('/', async (req, res) => {
  try {
    const { provider, amount, model, prompt, metadata } = req.body
    
    // Basic validation
    if (!provider || !amount || !model || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: provider, amount, model, prompt',
        code: 'VALIDATION_ERROR',
        timestamp: Date.now(),
        version: '1.0.0'
      })
    }
    
    // Generate request ID
    const requestId = '0x' + Math.random().toString(16).substr(2, 64).padEnd(64, '0')
    
    // Create initial session data
    const sessionData = {
      requestId,
      status: 'pending',
      provider,
      model,
      amount,
      prompt,
      metadata,
      createdAt: Date.now(),
      output: null,
      error: null,
      usage: null,
      explorerLinks: {}
    }
    
    // Store session
    sessions.set(requestId, sessionData)
    
    // Return immediately with requestId
    const response: ApiResponse = {
      success: true,
      data: { requestId },
      timestamp: Date.now(),
      version: '1.0.0'
    }
    
    res.status(201).json(response)
    
    // Process AI request asynchronously
    processAIRequest(requestId, prompt, model).catch(error => {
      logger.error('AI processing error', { requestId, error: error.message })
      const session = sessions.get(requestId)
      if (session) {
        session.status = 'error'
        session.error = error.message
        sessions.set(requestId, session)
      }
    })
    
  } catch (error) {
    logger.error('Session creation error', { error })
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: Date.now(),
      version: '1.0.0'
    })
  }
})

// Process AI request asynchronously with AbortController
async function processAIRequest(requestId: string, prompt: string, model: string) {
  const abortController = new AbortController()
  const timeoutId = setTimeout(() => abortController.abort(), config.timeouts.upstream)
  
  try {
    logger.info('Processing AI request', { requestId, model, timeout: config.timeouts.upstream })
    
    // Call OpenAI API with abort signal
    const completion = await openai.chat.completions.create({
      model: model || config.ai.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for POLySeal, specializing in blockchain, Ethereum Attestation Service, and smart contracts. Provide clear, accurate, and helpful responses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.ai.maxTokens,
      temperature: config.ai.temperature
    }, {
      signal: abortController.signal
    })
    
    clearTimeout(timeoutId)
    
    const aiResponse = completion.choices[0]?.message?.content || 'No response generated'
    const usage = completion.usage
    
    // Calculate cost using config pricing
    const inputCost = (usage?.prompt_tokens || 0) * config.ai.pricing.inputTokens
    const outputCost = (usage?.completion_tokens || 0) * config.ai.pricing.outputTokens
    const totalCost = (inputCost + outputCost).toFixed(6)
    
    // Update session with result
    const session = sessions.get(requestId)
    if (session) {
      session.status = 'completed'
      session.output = aiResponse
      session.usage = {
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
        cost: parseFloat(totalCost)
      }
      session.completedAt = Date.now()
      sessions.set(requestId, session)
      
      logger.info('AI request completed', { 
        requestId, 
        tokens: usage?.total_tokens,
        cost: totalCost 
      })
    }
    
  } catch (error: any) {
    clearTimeout(timeoutId)
    
    // Handle different error types
    let errorCode = 'INTERNAL_ERROR'
    let errorMessage = error.message || 'AI processing failed'
    
    if (abortController.signal.aborted) {
      errorCode = 'UPSTREAM_TIMEOUT'
      errorMessage = `AI request timed out after ${config.timeouts.upstream}ms`
    } else if (error.status === 429 || /quota|limit/i.test(errorMessage)) {
      errorCode = 'OPENAI_QUOTA_EXCEEDED'
      errorMessage = 'OpenAI API quota exceeded'
    } else if (error.status === 401 || /auth/i.test(errorMessage)) {
      errorCode = 'UPSTREAM_AUTH'
      errorMessage = 'OpenAI API authentication failed'
    }
    
    logger.error('AI processing failed', { 
      requestId, 
      error: errorMessage, 
      code: errorCode,
      status: error.status 
    })
    
    const session = sessions.get(requestId)
    if (session) {
      session.status = 'failed'
      session.error = errorMessage
      session.errorCode = errorCode
      sessions.set(requestId, session)
    }
    
    throw Object.assign(error, { code: errorCode })
  }
}

// POST /api/sessions/:requestId/process - Start processing an existing session
router.post('/:requestId/process', async (req, res) => {
  try {
    const { requestId } = req.params
    
    // Basic validation
    if (!requestId.match(/^0x[a-fA-F0-9]{64}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request ID format',
        code: 'VALIDATION_ERROR',
        timestamp: Date.now(),
        version: '1.0.0'
      })
    }
    
    // Get session from storage
    const sessionData = sessions.get(requestId)
    
    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        code: 'NOT_FOUND',
        timestamp: Date.now(),
        version: '1.0.0'
      })
    }
    
    if (sessionData.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Session already processed or processing',
        code: 'INVALID_STATE',
        timestamp: Date.now(),
        version: '1.0.0'
      })
    }
    
    // Update status to processing
    sessionData.status = 'processing'
    sessions.set(requestId, sessionData)
    
    const response: ApiResponse = {
      success: true,
      data: sessionData,
      timestamp: Date.now(),
      version: '1.0.0'
    }
    
    res.json(response)
    
    // Process AI request asynchronously
    processAIRequest(requestId, sessionData.prompt, sessionData.model).catch(error => {
      logger.error('AI processing error', { requestId, error: error.message })
      const session = sessions.get(requestId)
      if (session) {
        session.status = 'failed'
        session.error = error.message
        sessions.set(requestId, session)
      }
    })
    
  } catch (error) {
    logger.error('Process session error', { error })
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: Date.now(),
      version: '1.0.0'
    })
  }
})

// GET /api/sessions/:requestId - Get session status and results
router.get('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params
    
    // Basic validation
    if (!requestId.match(/^0x[a-fA-F0-9]{64}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request ID format',
        code: 'VALIDATION_ERROR',
        timestamp: Date.now(),
        version: '1.0.0'
      })
    }
    
    // Get session from storage
    const sessionData = sessions.get(requestId)
    
    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        code: 'NOT_FOUND',
        timestamp: Date.now(),
        version: '1.0.0'
      })
    }
    
    const response: ApiResponse = {
      success: true,
      data: sessionData,
      timestamp: Date.now(),
      version: '1.0.0'
    }
    
    res.json(response)
  } catch (error) {
    logger.error('Get session error', { error })
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: Date.now(),
      version: '1.0.0'
    })
  }
})

// POST /api/sessions/:requestId/process - Trigger processing
router.post('/:requestId/process', async (req, res) => {
  try {
    const { requestId } = req.params
    
    const session = sessions.get(requestId)
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        code: 'NOT_FOUND',
        timestamp: Date.now(),
        version: '1.0.0'
      })
    }
    
    if (session.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Session already processing or completed',
        code: 'INVALID_STATE',
        timestamp: Date.now(),
        version: '1.0.0'
      })
    }
    
    // Update to processing
    session.status = 'processing'
    session.processingStartedAt = Date.now()
    sessions.set(requestId, session)
    
    // Start processing asynchronously
    processAIRequest(requestId, session.prompt, session.model).catch(error => {
      logger.error('Processing trigger error', { requestId, error: error.message })
    })
    
    const response: ApiResponse = {
      success: true,
      data: session,
      timestamp: Date.now(),
      version: '1.0.0'
    }
    
    res.json(response)
  } catch (error) {
    logger.error('Process endpoint error', { error })
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: Date.now(),
      version: '1.0.0'
    })
  }
})

export default router