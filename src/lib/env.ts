// Runtime environment validation
const requiredEnvVars = [
  'VITE_CHAIN_ID',
  'VITE_RPC_URL',
  'VITE_SCANNER_BASE',
  'VITE_EAS_ADDRESS',
  'VITE_SCHEMA_REGISTRY',
  'VITE_WALLETCONNECT_PROJECT_ID',
  'VITE_SESSIONPAY_ADDRESS',
  'VITE_MOCKUSDC_ADDRESS',
  'VITE_SERVER_URL',
] as const;

type EnvVars = {
  VITE_CHAIN_ID: string;
  VITE_RPC_URL: string;
  VITE_SCANNER_BASE: string;
  VITE_EAS_ADDRESS: string;
  VITE_SCHEMA_REGISTRY: string;
  VITE_WALLETCONNECT_PROJECT_ID: string;
  VITE_SESSIONPAY_ADDRESS: string;
  VITE_MOCKUSDC_ADDRESS: string;
  VITE_SERVER_URL: string;
};

function validateEnv(): EnvVars {
  const missing: string[] = [];

  for (const key of requiredEnvVars) {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nPlease check your .env file.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return {
    VITE_CHAIN_ID: import.meta.env.VITE_CHAIN_ID,
    VITE_RPC_URL: import.meta.env.VITE_RPC_URL,
    VITE_SCANNER_BASE: import.meta.env.VITE_SCANNER_BASE,
    VITE_EAS_ADDRESS: import.meta.env.VITE_EAS_ADDRESS,
    VITE_SCHEMA_REGISTRY: import.meta.env.VITE_SCHEMA_REGISTRY,
    VITE_WALLETCONNECT_PROJECT_ID: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    VITE_SESSIONPAY_ADDRESS: import.meta.env.VITE_SESSIONPAY_ADDRESS,
    VITE_MOCKUSDC_ADDRESS: import.meta.env.VITE_MOCKUSDC_ADDRESS,
    VITE_SERVER_URL: import.meta.env.VITE_SERVER_URL,
  };
}

export const env = validateEnv();

// Typed helpers
export const chainId = parseInt(env.VITE_CHAIN_ID) as 80002;
export const rpcUrl = env.VITE_RPC_URL;
export const scannerBase = env.VITE_SCANNER_BASE;
export const easAddress = env.VITE_EAS_ADDRESS as `0x${string}`;
export const schemaRegistry = env.VITE_SCHEMA_REGISTRY as `0x${string}`;
export const walletConnectProjectId = env.VITE_WALLETCONNECT_PROJECT_ID;
export const sessionPayAddress = env.VITE_SESSIONPAY_ADDRESS as `0x${string}`;
export const mockUsdcAddress = env.VITE_MOCKUSDC_ADDRESS as `0x${string}`;
export const serverUrl = env.VITE_SERVER_URL;
