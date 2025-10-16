import { GoogleGenerativeAI } from '@google/generative-ai'
import { Request, Response, Router } from 'express'
import { config } from '../config/env.js'
import type { AIMessage } from '../types/api'

const router: Router = Router()

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey)

// POST /api/ai/stream - Google Gemini AI streaming chat with Server-Sent Events
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { messages }: { messages: AIMessage[] } = req.body

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('Invalid message format')
    }

    // Set up Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control')

    console.log('� Gemini AI Query:', lastMessage.content)

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    
    // Create comprehensive POLySeal context prompt
    const prompt = `You are POLySeal AI Assistant, an expert in Ethereum Attestation Service (EAS) and Polygon blockchain.

CONTEXT: POLySeal is a blockchain attestation platform that uses EAS (Ethereum Attestation Service) on Polygon to create verifiable, on-chain credentials and claims.

KEY TOPICS YOU HELP WITH:
- EAS (Ethereum Attestation Service) concepts and implementation
- Blockchain attestations and verifiable credentials
- Polygon blockchain and POL token ecosystem
- Smart contracts and Web3 development
- POLySeal platform features and usage
- Blockchain verification and trust mechanisms

USER QUESTION: ${lastMessage.content}

Provide helpful, accurate, and technical answers about attestations, blockchain verification, and the POLySeal platform. Be conversational but informative.`

    try {
      // Generate streaming response from Gemini
      const result = await model.generateContentStream(prompt)
      
      // Stream the response chunks
      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          const responseChunk = {
            content: text,
            role: 'assistant' as const,
            index: 0
          }
          
          res.write(`data: ${JSON.stringify(responseChunk)}\n\n`)
        }
      }
      
      // Send completion signal
      res.write('data: [DONE]\n\n')
      res.end()

      console.log('✨ Gemini AI response completed successfully')

    } catch (geminiError) {
      console.error('Gemini AI error:', geminiError)
      throw geminiError
    }

  } catch (error) {
    console.error('AI service error:', error)
    
    const errorResponse = {
      content: "I'm experiencing some technical difficulties with the AI service. Please try asking your question again. I can help you with POLySeal features, EAS attestations, and blockchain concepts.",
      role: 'assistant' as const,
      index: 0
    }
    
    res.write(`data: ${JSON.stringify(errorResponse)}\n\n`)
    res.write('data: [DONE]\n\n')
    res.end()
  }
})

export default router