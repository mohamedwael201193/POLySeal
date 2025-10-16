// Local AI Assistant for POLySeal
// Provides intelligent responses about EAS, attestations, and blockchain concepts

interface AIResponse {
  content: string
  type: 'info' | 'help' | 'technical' | 'error'
}

export class POLySealAI {
  private knowledge: Record<string, string> = {
    // EAS and Attestations
    'attestation': 'An attestation is a verifiable statement about something. In EAS (Ethereum Attestation Service), attestations are on-chain records that prove claims about entities, events, or relationships.',
    'eas': 'EAS (Ethereum Attestation Service) is a public infrastructure for making attestations on-chain or off-chain. It provides a universal layer for attestations on Ethereum and compatible chains like Polygon.',
    'schema': 'A schema in EAS defines the structure of attestation data. It specifies what fields are included in an attestation and their data types.',
    'polygon': 'Polygon is a Layer 2 scaling solution for Ethereum. POLySeal runs on Polygon Amoy testnet, providing fast and low-cost attestations.',
    
    // POLySeal specific
    'polyseal': 'POLySeal is an AI-powered attestation platform built on Polygon using EAS. It helps create, verify, and manage attestations with intelligent assistance.',
    'pol token': 'POL is the native token of Polygon network, formerly known as MATIC. It is used for transaction fees and network security.',
    
    // Technical concepts
    'smart contract': 'Smart contracts are self-executing contracts with terms directly written into code. They run on blockchain networks like Ethereum and Polygon.',
    'blockchain': 'A blockchain is a distributed, immutable ledger that records transactions across many computers. It ensures transparency and security without a central authority.',
    'web3': 'Web3 represents the decentralized internet built on blockchain technology, where users own their data and digital assets.',
    
    // Practical help
    'create attestation': 'To create an attestation: 1) Connect your wallet, 2) Go to Create page, 3) Select a schema, 4) Fill in the data, 5) Submit the transaction.',
    'wallet connect': 'POLySeal supports Web3 wallets like MetaMask. Make sure you are on Polygon Amoy testnet (Chain ID: 80002).',
    'gas fees': 'Transaction fees on Polygon are very low, typically less than $0.01. Make sure you have some POL tokens for gas.',
  }

  private patterns: Array<{pattern: RegExp, handler: (match: RegExpMatchArray) => string}> = [
    {pattern: /how to (.*)/i, handler: (match) => this.getHowTo(match[1])},
    {pattern: /what is (.*)/i, handler: (match) => this.getDefinition(match[1])},
    {pattern: /help.*create/i, handler: () => this.knowledge['create attestation']},
    {pattern: /help.*wallet/i, handler: () => this.knowledge['wallet connect']},
    {pattern: /price.*pol/i, handler: () => 'You can see real-time POL prices on our Market page. POL is currently trading with live price updates from CoinGecko.'},
    {pattern: /error.*gas/i, handler: () => 'Gas errors usually mean insufficient POL tokens. Get some POL tokens from a Polygon Amoy faucet.'},
  ]

  async generateResponse(input: string): Promise<AIResponse> {
    const query = input.toLowerCase().trim()
    
    // Check for direct matches first
    for (const [key, value] of Object.entries(this.knowledge)) {
      if (query.includes(key)) {
        return {
          content: value,
          type: 'info'
        }
      }
    }
    
    // Check pattern matches
    for (const {pattern, handler} of this.patterns) {
      const match = query.match(pattern)
      if (match) {
        return {
          content: handler(match),
          type: 'help'
        }
      }
    }
    
    // Fallback responses based on keywords
    if (query.includes('help')) {
      return this.getHelpResponse()
    }
    
    if (query.includes('error') || query.includes('problem')) {
      return this.getTroubleshootingResponse()
    }
    
    if (query.includes('example') || query.includes('tutorial')) {
      return this.getExampleResponse()
    }
    
    // Default response
    return {
      content: "I'm POLySeal AI assistant! I can help you with:\n\n• Creating attestations on Polygon\n• Understanding EAS (Ethereum Attestation Service)\n• Blockchain and Web3 concepts\n• Using POLySeal features\n• Troubleshooting issues\n\nTry asking: 'What is an attestation?' or 'How to create attestation?'",
      type: 'help'
    }
  }

  private getDefinition(term: string): string {
    const cleanTerm = term.trim().toLowerCase()
    return this.knowledge[cleanTerm] || `I don't have specific information about "${term}". Try asking about attestations, EAS, Polygon, or POLySeal features.`
  }

  private getHowTo(action: string): string {
    const cleanAction = action.trim().toLowerCase()
    if (cleanAction.includes('create') || cleanAction.includes('make')) {
      return this.knowledge['create attestation']
    }
    if (cleanAction.includes('connect') || cleanAction.includes('wallet')) {
      return this.knowledge['wallet connect']
    }
    return `To ${action}, I recommend checking our documentation or exploring the POLySeal interface. Each page has helpful guides and tooltips.`
  }

  private getHelpResponse(): AIResponse {
    return {
      content: "🤝 I'm here to help! Here are common things I can assist with:\n\n• **Attestations**: Creating, verifying, and managing attestations\n• **EAS Integration**: Understanding schemas and on-chain data\n• **Polygon Network**: Gas fees, transactions, and wallet setup\n• **POLySeal Features**: Dashboard, Explorer, Market data\n\nWhat specific topic would you like to know about?",
      type: 'help'
    }
  }

  private getTroubleshootingResponse(): AIResponse {
    return {
      content: "🔧 **Common Issues & Solutions:**\n\n• **Wallet not connecting**: Make sure you're on Polygon Amoy testnet\n• **Transaction failing**: Check you have POL tokens for gas fees\n• **Attestation not showing**: Allow time for blockchain confirmation\n• **Page loading issues**: Try refreshing or clearing browser cache\n\nDescribe your specific issue for more targeted help!",
      type: 'help'
    }
  }

  private getExampleResponse(): AIResponse {
    return {
      content: "📚 **POLySeal Examples:**\n\n• **Skill Verification**: Attest to someone's programming abilities\n• **Event Attendance**: Create proof of participation in workshops\n• **Identity Verification**: Confirm professional credentials\n• **Achievement Records**: Document certifications or accomplishments\n\nWant to try creating your first attestation? Visit the Create page!",
      type: 'help'
    }
  }
}

export const polysealAI = new POLySealAI()