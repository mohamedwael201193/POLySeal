import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletConnect } from '@/components/WalletConnect';
import { scannerBase } from '@/lib/env';
import { formatRelativeTime, truncateAddress } from '@/lib/format';
import { getUserHistory, type UserHistoryData } from '@/services/api';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Loader2, Mail, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [history, setHistory] = useState<UserHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setIsLoading(true);
      getUserHistory(address)
        .then((data) => {
          console.log('User history loaded:', data);
          setHistory(data);
        })
        .catch((err) => {
          console.error('Failed to load history:', err);
          setHistory(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [address]);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="glass text-center py-12">
          <CardContent>
            <User className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view your attestation dashboard
            </p>
            <WalletConnect />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-gradient-purple">Dashboard</h1>
        </div>
        <p className="text-lg text-muted-foreground font-mono">
          {truncateAddress(address || '', 10, 10)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Created Attestations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-4xl font-bold text-gradient-purple">
                {history?.attestationsCreated?.length || 0}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-secondary" />
              Received Attestations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-4xl font-bold text-gradient-cyber">
                {history?.attestationsReceived?.length || 0}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Created Attestations */}
      {history && history.attestationsCreated?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Created Attestations</h2>
          <div className="grid gap-4">
            {history.attestationsCreated?.map((attestation, idx) => (
              <motion.div
                key={attestation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass hover:shadow-glow-purple transition-smooth">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-mono">
                          {truncateAddress(attestation.id, 10, 10)}
                        </CardTitle>
                        <CardDescription>
                          {formatRelativeTime(attestation.timestamp)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a
                          href={`${scannerBase}/tx/${attestation.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Recipient</p>
                      <Badge variant="outline" className="font-mono">
                        {truncateAddress(attestation.recipient)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Received Attestations */}
      {history && history.attestationsReceived?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Received Attestations</h2>
          <div className="grid gap-4">
            {history.attestationsReceived?.map((attestation, idx) => (
              <motion.div
                key={attestation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass hover:shadow-glow-cyan transition-smooth">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-mono">
                          {truncateAddress(attestation.id, 10, 10)}
                        </CardTitle>
                        <CardDescription>
                          {formatRelativeTime(attestation.timestamp)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a
                          href={`${scannerBase}/tx/${attestation.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Attester</p>
                      <Badge variant="outline" className="font-mono">
                        {truncateAddress(attestation.attester)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && history && 
       (history.attestationsCreated?.length || 0) === 0 && 
       (history.attestationsReceived?.length || 0) === 0 && (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No attestations yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first attestation to get started
            </p>
            <Button variant="neon" asChild>
              <a href="/attest">Create Attestation</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
