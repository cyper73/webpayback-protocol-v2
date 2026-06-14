import { useEffect, useRef, useState } from "react";
import { useAuth, useVerification, clearVerificationCache } from "@humanity-org/react-sdk";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Loader2,
  Shield,
  Sparkles,
  LogOut,
  AlertTriangle,
  Users,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { toast } = useToast();

  // Privy — wallet/email auth layer
  const { authenticated: privyAuthenticated, user: privyUser, getAccessToken, login: privyLogin } = usePrivy();

  // Humanity SDK — identity & verification layer
  const {
    isLoading: humanityLoading,
    isAuthenticated: humanityAuthenticated,
    user: humanityUser,
    login: humanityLogin,
    logout: humanityLogout,
    refreshToken: humanityRefreshToken,
  } = useAuth();

  const {
    verify,
    isLoading: isVerifying,
    status: verificationStatus,
    result: verificationResult,
    error: verificationError,
    reset: resetVerification,
  } = useVerification();

  const [isReauthing, setIsReauthing] = useState(false);
  const [humanResult, setHumanResult] = useState<any>(null);
  const [isVerifyingHuman, setIsVerifyingHuman] = useState(false);
  const [socialResult, setSocialResult] = useState<any>(null);
  const [isVerifyingSocial, setIsVerifyingSocial] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const refreshAttempted = useRef(false);

  // ─── Auto-refresh expired token using SDK's native function ────────────────
  useEffect(() => {
    if (refreshAttempted.current) return;
    refreshAttempted.current = true;

    const raw = localStorage.getItem("humanity_auth");
    if (!raw) return;

    let auth: any;
    try { auth = JSON.parse(raw); } catch { return; }

    const expiresAt: number | null = auth?.expiresAt ?? null;
    const storedRefreshToken: string | null = auth?.refreshToken ?? null;
    const BUFFER_MS = 5 * 60 * 1000;

    if (expiresAt === null || Date.now() < expiresAt - BUFFER_MS) return;

    if (!storedRefreshToken) {
      localStorage.removeItem("humanity_auth");
      return;
    }

    humanityRefreshToken().catch(() => {
      localStorage.removeItem("humanity_auth");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Sync Privy session when both providers are authenticated ──────────────
  useEffect(() => {
    if (!humanityAuthenticated || !privyAuthenticated) return;

    const walletAddress =
      (humanityUser as any)?.walletAddress ||
      (humanityUser as any)?.evmAddress ||
      (privyUser as any)?.wallet?.address ||
      "";

    if (!walletAddress) return;

    (async () => {
      let session: any = {};
      try { session = JSON.parse(localStorage.getItem("webpayback_session") || "{}"); } catch {}

      const enriched: any = {
        ...session,
        walletAddress,
        loginTime: new Date().toISOString(),
        isAuthenticated: true,
        privyUserId: (privyUser as any)?.id ?? session?.privyUserId ?? null,
      };

      if (privyAuthenticated) {
        try {
          const t = await getAccessToken();
          if (t) enriched.token = t;
        } catch {}
      }

      if (!Number.isFinite(Number(enriched?.creatorId))) {
        try {
          const res = await fetch("/api/auth/wallet/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress }),
          });
          if (res.ok) {
            const data = await res.json();
            const id = Number(data?.creators?.[0]?.id);
            if (Number.isFinite(id) && id > 0) enriched.creatorId = id;
          }
        } catch {}
      }

      localStorage.setItem("webpayback_session", JSON.stringify(enriched));
      window.dispatchEvent(new CustomEvent("webpayback-login", { detail: enriched }));
    })();
  }, [humanityAuthenticated, humanityUser, privyAuthenticated, privyUser, getAccessToken]);

  // ─── Toast on verification error ──────────────────────────────────────────
  useEffect(() => {
    if (!verificationError) return;
    toast({
      title: "Verification error",
      description: verificationError.message || "Humanity verification failed.",
      variant: "destructive",
    });
  }, [verificationError, toast]);

  // ─── Sync verification result to backend ──────────────────────────────────
  useEffect(() => {
    if (verificationStatus !== "success" || !verificationResult) return;

    const sessionRaw = localStorage.getItem("webpayback_session");
    if (!sessionRaw) return;

    let session: any;
    try { session = JSON.parse(sessionRaw); } catch { return; }

    const creatorId = Number(session?.creatorId);
    const bearerToken = session?.token;
    const privyUserId = typeof session?.privyUserId === "string" ? session.privyUserId : null;
    const walletAddress = typeof session?.walletAddress === "string" ? session.walletAddress : null;

    if (!Number.isFinite(creatorId) || creatorId <= 0 || !bearerToken) return;

    const isVerified = Boolean((verificationResult as any)?.verified);
    const score = Number((verificationResult as any)?.score ?? 0);
    const credentialId = (verificationResult as any)?.credentialId ?? null;

    fetch("/api/humanity/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearerToken}` },
      body: JSON.stringify({ userId: creatorId, isVerified, score, credentialId, privyUserId, walletAddress }),
    }).catch(() => {});
  }, [verificationStatus, verificationResult]);

  // ─── is_human verification ────────────────────────────────────────────────
  const handleHumanVerify = async () => {
    setIsVerifyingHuman(true);
    clearVerificationCache();
    resetVerification();
    setHumanResult(null);
    try {
      const result = await verify("is_human");
      setHumanResult(result);
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err?.message ?? "is_human check failed.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingHuman(false);
    }
  };

  // ─── social_accounts verification ─────────────────────────────────────────
  const handleSocialVerify = async () => {
    setIsVerifyingSocial(true);
    setSocialResult(null);
    setSocialError(null);
    clearVerificationCache();
    try {
      const result = await verify("social_accounts");
      setSocialResult(result);
    } catch (err: any) {
      setSocialError(err?.message ?? "social_accounts check failed.");
      toast({
        title: "Social verification failed",
        description: err?.message ?? "Could not read social credentials.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingSocial(false);
    }
  };

  // ─── Handle re-auth after credential changes ──────────────────────────────
  const handleReauth = async () => {
    setIsReauthing(true);
    try {
      // Revoke current token server-side so Humanity issues a fresh one
      await humanityLogout();
      // Clear any cached verification results
      clearVerificationCache();
      resetVerification();
      // SDK-native redirect login — builds PKCE internally, stores with SDK keys
      await humanityLogin({ mode: "redirect", scopes: ["openid", "identity:read"] });
    } catch (err: any) {
      toast({
        title: "Re-auth failed",
        description: err?.message ?? "Unable to restart Humanity authentication.",
        variant: "destructive",
      });
      setIsReauthing(false);
    }
  };

  // ─── STEP 1: Privy not authenticated ──────────────────────────────────────
  if (!privyAuthenticated) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-electric-blue/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="text-center space-y-3 relative z-10">
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-10 w-10 text-electric-blue" />
              <h1 className="text-3xl font-bold text-white tracking-tight">WebPayback Protocol</h1>
            </div>
            <p className="text-sm text-gray-400">Step 1 of 2 — Connect your wallet</p>
          </div>
          <Card className="border-gray-800 bg-black/60 backdrop-blur-xl relative z-10">
            <CardContent className="pt-8 pb-8">
              <Button
                onClick={privyLogin}
                className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white"
              >
                Continue with Privy
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── STEP 2: Humanity not authenticated ───────────────────────────────────
  if (!humanityAuthenticated) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-electric-blue/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="text-center space-y-3 relative z-10">
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-10 w-10 text-electric-blue" />
              <h1 className="text-3xl font-bold text-white tracking-tight">WebPayback Protocol</h1>
            </div>
            <p className="text-sm text-gray-400">Step 2 of 2 — Prove your humanity</p>
          </div>
          <Card className="border-gray-800 bg-black/60 backdrop-blur-xl relative z-10">
            <CardContent className="pt-8 pb-8 space-y-4">
              {humanityLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-electric-blue" />
                </div>
              ) : (
                <Button
                  onClick={() =>
                    humanityLogin({ mode: "redirect", scopes: ["openid", "identity:read"] })
                  }
                  className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white"
                >
                  Verify with Humanity
                </Button>
              )}
              <p className="text-xs text-gray-500 text-center">
                You'll be redirected to Humanity to approve access to your identity & credentials.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── STEP 3: Both authenticated — verify credentials ──────────────────────

  // Derived values from individual result states
  const humanVerified = Boolean(humanResult?.verified);
  const humanScore = Number(humanResult?.score ?? 0);

  // Parse social accounts from result — SDK may nest under value, result.value, or social_accounts
  const rawSocial =
    socialResult?.value ??
    socialResult?.result?.value ??
    socialResult?.social_accounts ??
    [];
  const socialAccounts: { platform?: string; username?: string; verified?: boolean }[] =
    Array.isArray(rawSocial) ? rawSocial : [];
  const socialVerified = Boolean(socialResult?.verified) || socialAccounts.length > 0;

  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-4">

        {/* Status card */}
        <Card className="border-gray-800 bg-black/60 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              Authenticated
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Privy wallet</span>
              <Badge className="bg-green-500/20 text-green-400 border-none">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Humanity identity</span>
              <Badge className="bg-green-500/20 text-green-400 border-none">Connected</Badge>
            </div>

            {/* is_human result */}
            {humanResult && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">is_human</span>
                  <Badge className={humanVerified
                    ? "bg-green-500/20 text-green-400 border-none"
                    : "bg-red-500/20 text-red-400 border-none"}>
                    {humanVerified ? "Verified" : "Not verified"}
                  </Badge>
                </div>
                {humanScore > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Humanity score</span>
                    <Badge className="bg-electric-blue/20 text-electric-blue border-none">{humanScore}</Badge>
                  </div>
                )}
              </>
            )}

            {/* social_accounts result */}
            {socialResult && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">social_accounts</span>
                <Badge className={socialVerified
                  ? "bg-green-500/20 text-green-400 border-none"
                  : "bg-yellow-500/20 text-yellow-400 border-none"}>
                  {socialVerified ? `${socialAccounts.length || "✓"} account(s)` : "None found"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* is_human verification card */}
        <Card className="border-gray-800 bg-black/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-electric-blue" />
              Human Credential Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-500">
              Checks your palm / biometric credential registered in the Humanity mock generator.
            </p>
            <Button
              onClick={handleHumanVerify}
              disabled={isVerifyingHuman}
              className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white"
            >
              {isVerifyingHuman ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying…</>
              ) : (
                <>Verify is_human</>
              )}
            </Button>
            {verificationStatus === "error" && !isVerifyingHuman && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{verificationError?.message ?? "Verification failed."}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* social_accounts verification card */}
        <Card className="border-gray-800 bg-black/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-electric-blue" />
              Social Scope Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-500">
              Reads the social account credentials you added in the Humanity credential mock generator (Twitter, LinkedIn, etc.).
            </p>
            <Button
              onClick={handleSocialVerify}
              disabled={isVerifyingSocial}
              variant="outline"
              className="w-full border-electric-blue/40 hover:bg-electric-blue/10 text-electric-blue"
            >
              {isVerifyingSocial ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Checking…</>
              ) : (
                <>Verify social_accounts</>
              )}
            </Button>

            {/* Social accounts list */}
            {socialResult && socialAccounts.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {socialAccounts.map((acc, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-md bg-gray-900/60 border border-gray-800">
                    <span className="text-xs text-gray-300 capitalize">
                      {acc.platform ?? acc.username ?? `Account ${i + 1}`}
                    </span>
                    {acc.verified !== false ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-400" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {socialResult && socialAccounts.length === 0 && (
              <p className="text-xs text-yellow-500 text-center">
                No social accounts found. Add them in the Humanity mock generator, then re-authenticate.
              </p>
            )}

            {socialError && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{socialError}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Re-auth note */}
        <p className="text-xs text-gray-600 text-center px-4">
          Changed credentials in the mock generator (added/removed palm or social)?{" "}
          <button
            onClick={handleReauth}
            disabled={isReauthing}
            className="text-electric-blue underline hover:text-electric-blue/80 cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
          >
            {isReauthing ? "Redirecting…" : "Re-authenticate to refresh"}
          </button>
        </p>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            onClick={() => { window.location.href = "/creators"; }}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white"
          >
            Go to Creator Portal
          </Button>
          <Button
            onClick={async () => {
              await humanityLogout().catch(() => {});
              localStorage.removeItem("webpayback_session");
              localStorage.removeItem("humanity_auth");
              window.dispatchEvent(new CustomEvent("webpayback-logout"));
            }}
            variant="outline"
            className="border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>

      </div>
    </div>
  );
}
