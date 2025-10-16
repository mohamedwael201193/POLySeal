import OpenAI from 'openai'
import { config } from '../config/env.js'
import type { AIResponse } from '../types/api.js'
import { logger } from '../utils/logger.js'

export class AIService {
  private openai: OpenAI
  private model: string
  private maxTokens: number

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.ai.apiKey,
      baseURL: config.ai.baseUrl
    })
    this.model = config.ai.model
    this.maxTokens = config.ai.maxTokens

    logger.info('AI service initialized', { 
      model: this.model,
      maxTokens: this.maxTokens,
      pricing: config.ai.pricing
    })
  }

  async generateResponse(prompt: string, options: {
    model?: string
    maxTokens?: number
    temperature?: number
  } = {}): Promise<AIResponse> {
    const startTime = Date.now()
    
    try {
      logger.info('Generating AI response', { 
        model: options.model || this.model,
        promptLength: prompt.length,
        maxTokens: options.maxTokens || this.maxTokens
      })
      
      const response = await this.openai.chat.completions.create({
        model: options.model || this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant integrated with POLySeal, a decentralized AI inference payment system. Provide accurate, helpful, and well-structured responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature ?? 0.7,
        stream: false
      })

      const choice = response.choices[0]
      if (!choice?.message?.content) {
        throw new Error('Invalid AI response: no content generated')
      }

      const usage = response.usage
      if (!usage) {
        throw new Error('Invalid AI response: no usage data')
      }

      // Calculate real cost based on current OpenAI pricing
      const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens)
      
      const responseTime = Date.now() - startTime
      
      logger.info('AI response generated successfully', {
        model: response.model,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          cost
        },
        responseTime,
        contentLength: choice.message.content.length
      })

      return {
        content: choice.message.content,
        usage: {
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens
        },
        model: response.model,
        created: response.created,
        cost
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      logger.error('AI service error', { 
        error: error instanceof Error ? error.message : error,
        model: options.model || this.model,
        promptLength: prompt.length,
        responseTime
      })
      
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API error: ${error.message} (${error.status})`)
      }
      
      throw new Error(`AI generation failed: ${error}`)
    }
  }

  private calculateCost(promptTokens: number, completionTokens: number): number {
    const inputCost = promptTokens * config.ai.pricing.inputTokens
    const outputCost = completionTokens * config.ai.pricing.outputTokens
    return parseFloat((inputCost + outputCost).toFixed(6))
  }

  generateOutputUrl(requestId: string): string {
    // In production, this would store output in IPFS or decentralized storage
    return `https://api.polyseal.com/outputs/${requestId}`
  }

  async estimateCost(prompt: string, maxTokens: number = this.maxTokens): Promise<{
    estimatedInputTokens: number
    estimatedOutputTokens: number
    estimatedCost: number
    usdcAmount: string // Amount in USDC (6 decimals)
  }> {
    // Rough estimation: ~1 token per 4 characters for input
    const estimatedInputTokens = Math.ceil(prompt.length / 4)
    const estimatedOutputTokens = maxTokens
    
    const estimatedCost = this.calculateCost(estimatedInputTokens, estimatedOutputTokens)
    
    // Add 20% margin and convert to USDC (6 decimals)
    const costWithMargin = estimatedCost * 1.2
    const usdcAmount = Math.ceil(costWithMargin * 1000000).toString()
    
    return {
      estimatedInputTokens,
      estimatedOutputTokens,
      estimatedCost: costWithMargin,
      usdcAmount
    }
  }
}