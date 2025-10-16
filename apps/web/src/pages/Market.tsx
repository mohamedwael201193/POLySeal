import { PriceChart } from '@/components/PriceChart';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { getPrices, type PriceData } from '@/services/api';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Market() {
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await getPrices();
        setPrices(data);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-gradient-purple">Market</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Live cryptocurrency prices and market data
        </p>
      </div>

      {/* Price Cards */}
      {!isLoading && prices && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* POL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass hover:shadow-glow-purple transition-smooth">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      POL
                    </CardTitle>
                    <CardDescription>Polygon</CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {prices.polChange24h && prices.polChange24h >= 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-success" />
                        <span className="text-success">+{prices.polChange24h.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-destructive" />
                        <span className="text-destructive">{prices.polChange24h?.toFixed(1)}%</span>
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-gradient-purple mb-4">
                  {formatCurrency(prices.pol)}
                </p>
                <PriceChart 
                  price={prices.pol} 
                  priceChange={prices.polChange24h} 
                  symbol="POL" 
                  color="#8b5cf6" 
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* ETH */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass hover:shadow-glow-cyan transition-smooth">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-secondary" />
                      </div>
                      ETH
                    </CardTitle>
                    <CardDescription>Ethereum</CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {prices.ethChange24h && prices.ethChange24h >= 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-success" />
                        <span className="text-success">+{prices.ethChange24h.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-destructive" />
                        <span className="text-destructive">{prices.ethChange24h?.toFixed(1)}%</span>
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-gradient-cyber mb-4">
                  {formatCurrency(prices.eth)}
                </p>
                <PriceChart 
                  price={prices.eth} 
                  priceChange={prices.ethChange24h} 
                  symbol="ETH" 
                  color="#06b6d4" 
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Additional Info */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Market Information</CardTitle>
          <CardDescription>
            Real-time data provided by the server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Prices are fetched from the server every 30 seconds. All API calls are
            proxied through the backend to ensure security and rate limiting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
