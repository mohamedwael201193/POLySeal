import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { searchExplorer, type AttestationData } from '@/services/api';
import { truncateAddress, formatRelativeTime } from '@/lib/format';
import { scannerBase } from '@/lib/env';
import { Search, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Explorer() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AttestationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);

    try {
      const data = await searchExplorer(query, page, 20);
      setResults(data.attestations);
      setTotal(data.total);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Search className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-gradient-purple">Explorer</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Search attestations by address or attestation ID
        </p>
      </div>

      {/* Search */}
      <Card className="glass">
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Enter address or attestation ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 font-mono"
            />
            <Button type="submit" variant="neon" disabled={isSearching || !query.trim()}>
              {isSearching ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Search />
              )}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {total} attestation{total !== 1 ? 's' : ''}
            </p>
            {total > 20 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 20 >= total}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {results.map((attestation, idx) => (
              <motion.div
                key={attestation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
                          {formatRelativeTime(attestation.timestamp * 1000)}
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
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Attester</p>
                        <Badge variant="outline" className="font-mono">
                          {truncateAddress(attestation.attester)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Recipient</p>
                        <Badge variant="outline" className="font-mono">
                          {truncateAddress(attestation.recipient)}
                        </Badge>
                      </div>
                    </div>
                    
                    {Object.keys(attestation.data).length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Data</p>
                        <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-auto">
                          {JSON.stringify(attestation.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && results.length === 0 && query && (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try searching with a different address or attestation ID
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
