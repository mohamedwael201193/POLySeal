import { createWeb3Modal } from '@web3modal/wagmi/react';
import { http, createConfig } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';
import { walletConnectProjectId, rpcUrl } from '@/lib/env';

// Wagmi config
export const config = createConfig({
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http(rpcUrl),
  },
  connectors: [
    walletConnect({ projectId: walletConnectProjectId, showQrModal: false }),
    injected({ shimDisconnect: true }),
  ],
});

// Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: walletConnectProjectId,
  enableAnalytics: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(271 81% 56%)',
    '--w3m-border-radius-master': '0.75rem',
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
