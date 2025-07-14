import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard-static";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Banner Multilingua - Posizionato sopra tutto */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '8px',
        textAlign: 'center',
        fontSize: '14px',
        zIndex: 10000,
        fontFamily: 'system-ui, sans-serif'
      }}>
        🌍 WebPayback - Piattaforma Globale | 🇺🇸 English | 🇮🇹 Italiano | 🇪🇸 Español | 🇫🇷 Français | 🇩🇪 Deutsch | 🇵🇹 Português | 🇷🇺 Русский | 🇨🇳 中文 | + 4 altre lingue
      </div>
      <TooltipProvider>
        <div style={{paddingTop: '40px'}}>
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
