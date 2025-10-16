import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { chainId, mockUsdcAddress } from '@/lib/env';
import { truncateAddress } from '@/lib/format';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { AlertCircle, Power, Wallet } from 'lucide-react';
import { useAccount, useBalance, useDisconnect, useSwitchChain } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';

export function WalletConnect() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
  const { data: polBalance } = useBalance({
    address,
    chainId: polygonAmoy.id,
  });
  
  const { data: usdcBalance } = useBalance({
    address,
    token: mockUsdcAddress,
    chainId: polygonAmoy.id,
  });

  // Wrong network detection
  const isWrongNetwork = isConnected && chain?.id !== chainId;

  if (!isConnected) {
    return (
      <Button variant="neon" size="lg" onClick={() => open()}>
        <Wallet />
        Connect Wallet
      </Button>
    );
  }

  if (isWrongNetwork) {
    return (
      <Button
        variant="destructive"
        size="lg"
        onClick={() => switchChain({ chainId })}
      >
        <AlertCircle />
        Switch to Polygon Amoy
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Balances */}
      <div className="hidden md:flex flex-col items-end gap-0.5">
        {polBalance && (
          <Badge variant="outline" className="font-mono text-xs">
            {parseFloat(polBalance.formatted).toFixed(4)} POL
          </Badge>
        )}
        {usdcBalance && (
          <Badge variant="outline" className="font-mono text-xs">
            {parseFloat(usdcBalance.formatted).toFixed(2)} USDC
          </Badge>
        )}
      </div>

      {/* Address */}
      <Button variant="glass" size="default" onClick={() => open()}>
        <Wallet />
        <span className="font-mono">{truncateAddress(address || '')}</span>
      </Button>

      {/* Disconnect */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => disconnect()}
        title="Disconnect"
      >
        <Power className="h-4 w-4" />
      </Button>
    </div>
  );
}
