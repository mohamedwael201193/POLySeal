#!/usr/bin/env node

/**
 * POLySeal Server API Test Script
 * Tests the main API endpoints to verify functionality
 */

const BASE_URL = 'http://localhost:3001'

// Test data
const testSession = {
  provider: '0xDE84a47a744165B5123D428321F541fD524c4435', // Same as our provider address
  amount: '100', // 100 USDC
  model: 'gpt-4o-mini',
  prompt: 'What is the capital of France?',
  maxTokens: 100,
  temperature: 0.7
}

async function testHealthEndpoint() {
  console.log('🔍 Testing Health Endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/health`)
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log('✅ Health endpoint working')
      console.log(`   Status: ${data.data.status}`)
      console.log(`   Uptime: ${data.data.uptime.toFixed(2)}s`)
      console.log(`   Environment: ${data.data.environment}`)
      return true
    } else {
      console.log('❌ Health endpoint failed')
      return false
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message)
    return false
  }
}

async function testCreateSession() {
  console.log('🔍 Testing Create Session Endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSession)
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log('✅ Create session working')
      console.log(`   Request ID: ${data.data.requestId}`)
      console.log(`   Status: ${data.data.status}`)
      console.log(`   Amount: ${data.data.amount} USDC ($${data.data.amountUSD})`)
      console.log(`   Model: ${data.data.model}`)
      return data.data.requestId
    } else {
      console.log('❌ Create session failed')
      console.log('   Response:', data)
      return null
    }
  } catch (error) {
    console.log('❌ Create session error:', error.message)
    return null
  }
}

async function testGetSession(requestId) {
  console.log('🔍 Testing Get Session Endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/api/sessions/${requestId}`)
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log('✅ Get session working')
      console.log(`   Request ID: ${data.data.requestId}`)
      console.log(`   Status: ${data.data.status}`)
      console.log(`   Created: ${new Date(data.data.createdAt).toISOString()}`)
      return true
    } else {
      console.log('❌ Get session failed')
      console.log('   Response:', data)
      return false
    }
  } catch (error) {
    console.log('❌ Get session error:', error.message)
    return false
  }
}

async function testInvalidEndpoint() {
  console.log('🔍 Testing 404 Handling...')
  try {
    const response = await fetch(`${BASE_URL}/api/nonexistent`)
    const data = await response.json()
    
    if (response.status === 404 && !data.success && data.code === 'NOT_FOUND') {
      console.log('✅ 404 handling working correctly')
      return true
    } else {
      console.log('❌ 404 handling failed')
      return false
    }
  } catch (error) {
    console.log('❌ 404 test error:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 POLySeal Server API Integration Tests')
  console.log('=====================================')
  
  const results = {
    health: false,
    createSession: false,
    getSession: false,
    notFound: false
  }
  
  // Test 1: Health Check
  results.health = await testHealthEndpoint()
  console.log()
  
  // Test 2: Create Session
  const requestId = await testCreateSession()
  results.createSession = !!requestId
  console.log()
  
  // Test 3: Get Session (if create worked)
  if (requestId) {
    results.getSession = await testGetSession(requestId)
    console.log()
  }
  
  // Test 4: 404 Handling
  results.notFound = await testInvalidEndpoint()
  console.log()
  
  // Summary
  console.log('📊 Test Results Summary')
  console.log('======================')
  const passed = Object.values(results).filter(Boolean).length
  const total = Object.keys(results).length
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`)
  })
  
  console.log()
  console.log(`Overall: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('🎉 All tests passed! POLySeal server is working correctly.')
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.')
  }
  
  return passed === total
}

// Run the tests
runTests().catch(console.error)