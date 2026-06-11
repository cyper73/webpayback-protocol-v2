import { Route, Routes } from "react-router-dom";

const MAINTENANCE_MODE = false; // set to true to show maintenance page

function MaintenancePage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0f1117",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      padding: "24px",
    }}>
      <div style={{ maxWidth: "560px", width: "100%", textAlign: "center", color: "#e2e8f0" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔧</div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "12px", color: "#f8fafc" }}>
          System Upgrade in Progress
        </h1>
        <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#94a3b8", marginBottom: "32px" }}>
          New architectural foundations are arriving on the platform. For this reason,
          our servers will be inaccessible until further notice. We are currently working
          on safely migrating all user accounts and credits to the new system.
        </p>
        <p style={{ fontSize: "14px", color: "#64748b" }}>Thank you for your patience.</p>
      </div>
    </div>
  );
}

import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from '@privy-io/react-auth';
import { HumanityProvider } from "@humanity-org/react-sdk";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import GettingStarted from "@/pages/getting-started";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/terms";
import PolStakingPage from "@/pages/PolStakingPage";
import CitationsByWallet from "@/pages/CitationsByWallet";
import PoolDebugger from "@/pages/PoolDebugger";
import AutomationPage from "@/pages/AutomationPage";
import { ContentCertificatePage } from "@/pages/ContentCertificatePage";
import Login from "@/pages/Login";
import HumanityCallback from "@/pages/HumanityCallback";

import PoolHealthDashboard from "@/pages/PoolHealthDashboard";
import AntiDumpSlippageDashboard from "@/pages/AntiDumpSlippageDashboard";
import CreatorPage from "@/pages/CreatorPage";
import ProtectedCreatorPortal from "@/components/auth/ProtectedCreatorPortal";
import ProtectedNFTModule from "@/components/auth/ProtectedNFTModule";
import ProtectedRewardsModule from "@/components/auth/ProtectedRewardsModule";
import CookieConsentBanner from "@/components/gdpr/CookieConsentBanner";
import { SecurityTest } from "@/pages/SecurityTest";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/getting-started" element={<GettingStarted />} />
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<HumanityCallback />} />
      <Route path="/creators" element={<CreatorPage />} />
      <Route path="/staking" element={<PolStakingPage />} />
      <Route path="/automation" element={<AutomationPage />} />
      <Route path="/content-certificate" element={<ProtectedNFTModule />} />
      <Route path="/pool-health" element={<PoolHealthDashboard />} />
      <Route path="/anti-dump" element={<AntiDumpSlippageDashboard />} />
      <Route path="/certificate" element={<ContentCertificatePage />} />
      <Route path="/certificate/:address" element={<ContentCertificatePage />} />
      <Route path="/pool-debug" element={<PoolDebugger />} />
      <Route path="/citations" element={<ProtectedRewardsModule />} />
      <Route path="/citations/:walletAddress" element={<CitationsByWallet />} />
      <Route path="/security-test" element={<SecurityTest />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  if (MAINTENANCE_MODE) return <MaintenancePage />;

  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID || 'cmn0xgyny01ra0ciijd8kc2kk';

  const rawHumanityEnvironment =
    (import.meta.env.VITE_HUMANITY_ENVIRONMENT as "production" | "sandbox" | undefined) || "sandbox";
  const humanityEnvironment: "production" | "sandbox" =
    rawHumanityEnvironment === "production" ? "production" : "sandbox";

  const humanityRedirectUri =
    import.meta.env.VITE_HUMANITY_REDIRECT_URI ||
    import.meta.env.VITE_REDIRECT_URI ||
    `${window.location.origin}/callback`;

  return (
    // PrivyProvider must be the outermost React context so that all usePrivy()
    // hooks (and other React hooks) resolve against the same React instance.
    // HumanityProvider is nested inside so it inherits the same React tree.
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#10b981',
          logo: '/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'all-users',
          noPromptOnSignature: true
        },
        defaultChain: {
          id: 137,
          name: 'Polygon',
          network: 'polygon',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: {
            default: { http: ['https://polygon-rpc.com'] },
            public: { http: ['https://polygon-rpc.com'] }
          },
          blockExplorers: {
            default: { name: 'Polygonscan', url: 'https://polygonscan.com' }
          }
        }
      }}
    >
      <HumanityProvider
        clientId={import.meta.env.VITE_HUMANITY_CLIENT_ID}
        redirectUri={humanityRedirectUri}
        environment={humanityEnvironment}
        storage="localStorage"
        theme="system"
        onError={(error: any) => {
          console.error("[Humanity SDK]", {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
          });
        }}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router />
            <Toaster />
            <CookieConsentBanner />
          </TooltipProvider>
        </QueryClientProvider>
      </HumanityProvider>
    </PrivyProvider>
  );
}

export default App;
