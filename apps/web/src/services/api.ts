import { serverUrl } from '@/lib/env';
import type {
    AIMessage,
    AttestationData,
    ExplorerSearchResult,
    MetricsData,
    PriceData,
    UserHistoryData
} from '@polyseal/types';
import axios, { AxiosError, AxiosInstance } from 'axios';

// Re-export types for convenient importing
export type {
    AIMessage,
    AttestationData,
    ExplorerSearchResult,
    MetricsData,
    PriceData,
    UserHistoryData
} from '@polyseal/types';

// API client with retry logic
const api: AxiosInstance = axios.create({
  baseURL: serverUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens or custom headers here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;

    // Retry logic for network errors
    if (!config || !config.headers) {
      return Promise.reject(error);
    }

    const retryCount = (config.headers['X-Retry-Count'] as number) || 0;

    if (retryCount < 3 && (!error.response || error.response.status >= 500)) {
      config.headers['X-Retry-Count'] = retryCount + 1;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
      return api(config);
    }

    return Promise.reject(error);
  }
);

// API functions
export async function getMetrics(): Promise<MetricsData> {
  const { data } = await api.get<{ success: boolean; data: MetricsData }>('/api/metrics');
  return data.data;
}

export async function searchExplorer(query: string, page = 1, pageSize = 20): Promise<ExplorerSearchResult> {
  const { data } = await api.get<{ success: boolean; data: ExplorerSearchResult }>('/api/explorer', {
    params: { q: query, page, pageSize },
  });
  return data.data;
}

export async function createAttestation(payload: {
  schema: string;
  recipient: string;
  data: Record<string, any>;
  refUID?: string;
}): Promise<{ attestationId: string; txHash: string }> {
  const { data } = await api.post<{ success: boolean; data: { attestationId: string; txHash: string } }>('/api/attestations/create', payload);
  return data.data;
}

export async function getAttestations(query?: string): Promise<AttestationData[]> {
  const { data } = await api.get<{ success: boolean; data: AttestationData[] }>('/api/attestations', {
    params: { q: query },
  });
  return data.data;
}

export async function getUserHistory(address: string): Promise<UserHistoryData> {
  const { data } = await api.get<{ success: boolean; data: UserHistoryData }>(`/api/users/${address}/history`);
  return data.data;
}

export async function getPrices(): Promise<PriceData> {
  const { data } = await api.get<{ success: boolean; data: PriceData }>('/api/prices');
  return data.data;
}

// AI streaming with Server-Sent Events
export async function streamAI(
  messages: AIMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(`${serverUrl}/api/ai/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`AI stream error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || line.startsWith(':')) continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.content) {
            onChunk(parsed.content);
          }
        } catch (e) {
          console.warn('Failed to parse SSE chunk:', e);
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}

export default api;
