import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMetrics, type MetricsData } from '@/services/api';
import { formatNumber } from '@/lib/format';
import { Sparkles, FileText, Search, Shield, Zap, Users, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Attestations',
    description: 'Create verifiable on-chain attestations with Ethereum Attestation Service',
    color: 'text-primary',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Get intelligent assistance for creating and analyzing attestations',
    color: 'text-secondary',
  },
  {
    icon: Search,
    title: 'Powerful Explorer',
    description: 'Search and discover attestations across the Polygon network',
    color: 'text-success',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Polygon Amoy for instant, low-cost transactions',
    color: 'text-accent',
  },
];

export default function Home() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMetrics()
      .then(setMetrics)
      .catch((err) => console.error('Failed to load metrics:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 border-primary/30">
            <Zap className="h-3 w-3 mr-1" />
            Wave 1 • Polygon Buildathon
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Next-Gen Attestations
            <br />
            <span className="text-gradient-purple">on Polygon</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Create, verify, and explore on-chain attestations with AI assistance.
            Built with EAS and powered by the Polygon ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="neon" size="xl" asChild>
              <Link to="/attest">
                <FileText />
                Create Attestation
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/ai">
                <Sparkles />
                Try AI Assistant
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Live Stats */}
      {!isLoading && metrics && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="glass hover:shadow-glow-purple transition-smooth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Total Attestations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gradient-purple">
                {formatNumber(metrics.totalAttestations)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-glow-cyan transition-smooth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gradient-cyber">
                {formatNumber(metrics.totalUsers)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover:shadow-glow-purple transition-smooth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Total Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-success">
                ${formatNumber(metrics.totalVolume)}
              </p>
            </CardContent>
          </Card>
        </motion.section>
      )}

      {/* Features */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="text-gradient-purple">POLySeal?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for developers, enterprises, and Web3 enthusiasts who demand
            security, speed, and simplicity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="glass h-full hover:shadow-glow-purple transition-smooth group">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-background/50 ${feature.color} group-hover:scale-110 transition-smooth`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass max-w-3xl mx-auto p-8 md:p-12 rounded-2xl border-primary/20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Connect your wallet and create your first attestation in seconds.
          </p>
          <Button variant="neon" size="xl" asChild>
            <Link to="/attest">
              <Shield />
              Start Building
            </Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
