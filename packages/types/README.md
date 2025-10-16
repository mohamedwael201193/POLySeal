# @polyseal/types

Shared TypeScript types for the POLySeal monorepo.

## Installation

```bash
npm install @polyseal/types
```

## Usage

```typescript
import type { SessionResponse, AttestationData, MetricsData, ApiResponse } from '@polyseal/types';

// Use types in your frontend or backend code
const session: SessionResponse = {
  requestId: '0x...',
  status: 'completed',
  // ... other properties
};
```

## Available Types

### API Types

- `ApiResponse<T>` - Standard API response wrapper
- `APIError` - Error response structure
- `ErrorCode` - Standard error codes

### Session Types

- `SessionResponse` - AI session data structure
- `CreateSessionRequest` - Session creation parameters
- `SessionStatus` - Session state enum

### Attestation Types

- `AttestationData` - EAS attestation structure
- `CreateAttestationRequest` - Attestation creation parameters

### User & Explorer Types

- `UserHistoryData` - User attestation history
- `ExplorerSearchResult` - Search results structure
- `ExplorerSearchParams` - Search parameters

### Metrics Types

- `MetricsData` - Platform statistics
- `ProviderStats` - AI provider metrics
- `SystemStats` - System health metrics

### AI Types

- `AIMessage` - Chat message structure
- `AIResponse` - AI model response
- `AIThread` - Conversation thread

### Utility Types

- `PriceData` - Cryptocurrency prices
- `Toast` - Notification structure
- `PendingTransaction` - Transaction tracking

## Development

```bash
# Build types
npm run build

# Watch for changes
npm run dev

# Clean build artifacts
npm run clean
```
