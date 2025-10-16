import { Outlet, Link, useLocation } from 'react-router-dom';
import { WalletConnect } from '@/components/WalletConnect';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Sparkles, FileText, Search, TrendingUp, User, Hexagon } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/ai', label: 'AI Assistant', icon: Sparkles },
  { to: '/attest', label: 'Create', icon: FileText },
  { to: '/explore', label: 'Explorer', icon: Search },
  { to: '/market', label: 'Market', icon: TrendingUp },
  { to: '/dashboard', label: 'Dashboard', icon: User },
];

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Animated gradient mesh background */}
      <div className="gradient-mesh-bg" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Hexagon className="h-8 w-8 text-primary group-hover:text-primary-glow transition-smooth" />
                <div className="absolute inset-0 blur-lg bg-primary/30 group-hover:bg-primary/50 transition-smooth" />
              </div>
              <span className="text-xl font-bold text-gradient-purple">
                POLySeal
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Button
                    key={to}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    asChild
                  >
                    <Link to={to} className="relative">
                      <Icon className="h-4 w-4" />
                      {label}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-primary/20 rounded-md -z-10"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </Button>
                );
              })}
            </nav>

            {/* Wallet */}
            <WalletConnect />
          </div>

          {/* Mobile Navigation */}
          <nav className="lg:hidden flex items-center gap-1 mt-4 overflow-x-auto scrollbar-hide">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Button
                  key={to}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link to={to}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content with animated route transitions */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-border/50 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 POLySeal • Built on Polygon
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://polygon.technology"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-smooth"
              >
                Polygon
              </a>
              <a
                href="https://docs.attest.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-smooth"
              >
                EAS Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
