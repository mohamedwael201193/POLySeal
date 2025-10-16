import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { config } from '@/config/wagmi';
import { AppLayout } from '@/layouts/AppLayout';
import Home from "./pages/Home";
import AIAssistant from "./pages/AIAssistant";
import CreateAttestation from "./pages/CreateAttestation";
import Explorer from "./pages/Explorer";
import Market from "./pages/Market";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="ai" element={<AIAssistant />} />
              <Route path="attest" element={<CreateAttestation />} />
              <Route path="explore" element={<Explorer />} />
              <Route path="market" element={<Market />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
