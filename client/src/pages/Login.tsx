import { useEffect, useRef, useState } from "react";
import { HumanityConnect, useAuth, useVerification, clearVerificationCache } from "@humanity-org/react-sdk";

// ---------------------------------------------------------------------------
// Custom PKCE helper — forces the Humanity consent screen by adding
// prompt=consent to the authorization URL.  The SDK's HumanityConnect does not
// expose this parameter, so we build the redirect manually while reusing the
// same sessionStorage/localStorage keys the SDK expects for the callback.
// ---------------------------------------------------------------------------
async function loginWithForcedConsent(): Promise<void> {
  const clientId = import.meta.env.VITE_HUMANITY_CLIENT_ID as string;
  const redirectUri = import.meta.env.VITE_HUMANITY_REDIRECT_URI as string;
  const env = (import.meta.env.VITE_HUMANITY_ENVIRONMENT as string) || "sandbox";

  if (!clientId || !redirectUri) {
    console.error("[Humanity] VITE_HUMANITY_CLIENT_ID or VITE_HUMANITY_REDIRECT_URI not set");
    return;
  }

  const base =
    env === "production"
      ? "https://api.humanity.org/oauth/authorize"
      : "https://api.sandbox.humanity.org/oauth/authorize";

  // Generate PKCE verifier (43-128 random chars, URL-safe base64)
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  // SHA-256 challenge
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  // Random state
  const stateArr = new Uint8Array(16);
  crypto.getRandomValues(stateArr);
  const state = btoa(String.fromCharCode(...stateArr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  // Store PKCE using the same keys as the SDK + localStorage backup (Firefox ETP)
  sessionStorage.setItem("humanity_pkce", verifier);
  sessionStorage.setItem("humanity_state", state);
  localStorage.setItem("humanity_pkce_backup", verifier);
  localStorage.setItem("humanity_state_backup", state);

  const url = new URL(base);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid identity:read");
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "consent");

  window.location.href = url.toString();
}
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, RefreshCw, Shield, Sparkles, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { toast } = useToast();
  const { isLoading, isAuthenticated, user, logout, refreshToken: humanityRefreshToken } = useAuth();
  const { authenticated: privyAuthenticated, user: privyUser, getAccessToken, login } = usePrivy();
  const {
    verify,
    isLoading: isVerifying,
    status: verificationStatus,
    result: verificationResult,
    error: verificationError,
    reset: resetVerification,
  } = useVerification();
  const [socialAccountsCheck, setSocialAccountsCheck] = useState<{
    checked: boolean;
    verified: boolean;
    count: number;
  } | null>(null);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  const refreshAttempted = useRef(false);

  // Auto-refresh expired Humanity token on mount using the SDK's native
  // refreshToken() — this updates the SDK's internal React state correctly,
  // unlike writing to localStorage directly which leaves stale in-memory state.
  useEffect(() => {
    if (refreshAttempted.current) return;
    refreshAttempted.current = true;

    const raw = localStorage.getItem("humanity_auth");
    if (!raw) return;

    let auth: any;
    try { auth = JSON.parse(raw); } catch { return; }

    const expiresAt: number | null = auth?.expiresAt ?? null;
    const storedRefreshToken: string | null = auth?.refreshToken ?? null;
    const BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry

    const isExpiredOrSoon = expiresAt !== null && Date.now() >= expiresAt - BUFFER_MS;
    if (!isExpiredOrSoon) return; // token still valid

    if (!storedRefreshToken) {
      // No refresh token available — clear stale auth so SDK shows re-auth UI
      localStorage.removeItem("humanity_auth");
      toast({
        title: "Sessione Humanity scaduta",
        description: "Accedi nuovamente con Humanity per continuare.",
        variant: "destructive",
      });
      return;
    }

    // Use SDK's native refreshToken() — updates internal React state correctly
    setTokenRefreshing(true);
    humanityRefreshToken()
      .then(() => {
        toast({
          title: "Sessione rinnovata",
          description: "Il token Humanity è stato aggiornato automaticamente.",
        });
      })
      .catch(() => {
        // SDK refresh failed — clear stale auth so the re-auth UI appears
        localStorage.removeItem("humanity_auth");
        toast({
          title: "Sessione Humanity scaduta",
          description: "Il token è scaduto. Accedi di nuovo con Humanity.",
          variant: "destructive",
        });
      })
      .finally(() => setTokenRefreshing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !privyAuthenticated) {
      return;
    }

    const humanityWalletAddress =
      (user as any)?.walletAddress ||
      (user as any)?.wallet?.address ||
      (user as any)?.evmAddress ||
      "";
    const privyWalletAddress = (privyUser as any)?.wallet?.address || "";
    const walletAddress = humanityWalletAddress || privyWalletAddress;

    if (!walletAddress) {
      return;
    }

    let existingSession: any = {};
    try {
      existingSession = JSON.parse(localStorage.getItem("webpayback_session") || "{}");
    } catch {
      existingSession = {};
    }

    const session = {
      ...existingSession,
      walletAddress,
      loginTime: new Date().toISOString(),
      isAuthenticated: true,
      privyUserId: (privyUser as any)?.id || existingSession?.privyUserId || null,
    };

    (async () => {
      let enrichedSession: any = { ...session };

      // Privy JWT is the backend auth layer for /api/humanity/sync.
      if (privyAuthenticated) {
        try {
          const privyToken = await getAccessToken();
          if (privyToken) {
            enrichedSession = { ...enrichedSession, token: privyToken };
          }
        } catch {
          // Keep session usable even if token retrieval fails; sync effect will surface a toast.
        }
      }

      if (!Number.isFinite(Number(enrichedSession?.creatorId))) {
        try {
          const response = await fetch("/api/auth/wallet/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress }),
          });
          if (response.ok) {
            const data = await response.json();
            const recoveredId = Number(data?.creators?.[0]?.id);
            if (Number.isFinite(recoveredId) && recoveredId > 0) {
              enrichedSession = { ...enrichedSession, creatorId: recoveredId };
            }
          }
        } catch {
          // Non-blocking: creatorId may be added later by other flows.
        }
      }

      localStorage.setItem("webpayback_session", JSON.stringify(enrichedSession));
      window.dispatchEvent(new CustomEvent("webpayback-login", { detail: enrichedSession }));
    })();
  }, [isAuthenticated, user, privyAuthenticated, privyUser, getAccessToken]);

  useEffect(() => {
    if (verificationError) {
      toast({
        title: "Verification error",
        description: verificationError.message || "Humanity verification failed.",
        variant: "destructive",
      });
    }
  }, [verificationError, toast]);

  useEffect(() => {
    if (verificationStatus !== "success" || !verificationResult) {
      return;
    }

    const preset = typeof (verificationResult as any)?.preset === "string"
      ? (verificationResult as any).preset
      : null;
    if (preset && preset !== "is_human") {
      return;
    }

    const sessionRaw = localStorage.getItem("webpayback_session");
    if (!sessionRaw) {
      return;
    }

    let session: any = null;
    try {
      session = JSON.parse(sessionRaw);
    } catch {
      return;
    }

    const creatorId = Number(session?.creatorId);
    const bearerToken = session?.token;
    const privyUserId = typeof session?.privyUserId === "string" ? session.privyUserId : null;
    const walletAddress = typeof session?.walletAddress === "string" ? session.walletAddress : null;
    if (!Number.isFinite(creatorId) || creatorId <= 0 || !bearerToken) {
      toast({
        title: "Sync skipped",
        description: "Missing creator session data (creatorId/token).",
        variant: "destructive",
      });
      return;
    }

    const isVerified = Boolean((verificationResult as any)?.verified);
    const scoreCandidate =
      Number((verificationResult as any)?.score) ||
      Number((verificationResult as any)?.humanityScore) ||
      Number((verificationResult as any)?.result?.score) ||
      0;
    const score = Number.isFinite(scoreCandidate) ? scoreCandidate : 0;
    const credentialId =
      (verificationResult as any)?.credentialId ||
      (verificationResult as any)?.result?.credentialId ||
      null;

    (async () => {
      try {
        const response = await fetch("/api/humanity/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({
            userId: creatorId,
            isVerified,
            score,
            credentialId,
            privyUserId,
            walletAddress,
          }),
        });

        if (!response.ok) {
          toast({
            title: "Sync failed",
            description: "Could not persist Humanity status to backend.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Verification synced",
          description: "Your Humanity status was persisted to backend state.",
        });
      } catch {
        toast({
          title: "Sync failed",
          description: "Network error while persisting Humanity status.",
          variant: "destructive",
        });
        return;
      }
    })();
  }, [verificationStatus, verificationResult, toast]);

  if (isLoading || tokenRefreshing) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4 flex-col gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
        {tokenRefreshing && (
          <p className="text-sm text-gray-400">Rinnovo sessione Humanity…</p>
        )}
      </div>
    );
  }

  if (!privyAuthenticated) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-electric-blue/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="text-center space-y-4 relative z-10">
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-10 w-10 text-electric-blue" />
              <h1 className="text-3xl font-bold text-white tracking-tight">WebPayback Protocol</h1>
            </div>
            <p className="text-md text-gray-400 max-w-md mx-auto">
              First sign in with Privy to create/attach your app wallet session.
            </p>
          </div>
          <Card className="border-gray-800 bg-black/60 backdrop-blur-xl relative z-10">
            <CardContent className="pt-8 pb-8 space-y-6">
              <Button
                onClick={login}
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-electric-blue/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="text-center space-y-4 relative z-10">
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-10 w-10 text-electric-blue" />
              <h1 className="text-3xl font-bold text-white tracking-tight">WebPayback Protocol</h1>
            </div>
            <p className="text-md text-gray-400 max-w-md mx-auto">
              Sign in using the official Humanity SDK redirect flow.
            </p>
          </div>
          <Card className="border-gray-800 bg-black/60 backdrop-blur-xl relative z-10">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-electric-blue/10 p-4 rounded-full mb-2">
                  <Shield className="h-10 w-10 text-electric-blue" />
                </div>
                <h3 className="text-xl font-medium text-white text-center">Prove Your Humanity</h3>
                <div className="w-full flex justify-center">
                  <HumanityConnect
                    mode="redirect"
                    scopes={["openid", "identity:read"]}
                    variant="primary"
                    size="md"
                    label="Sign in with Humanity"
                    onError={(error) => {
                      if (error.code === "access_denied") {
                        toast({
                          title: "Sign-in cancelled",
                          description: "You denied the Humanity consent screen.",
                          variant: "destructive",
                        });
                        return;
                      }

                      if (error.code === "popup_blocked") {
                        toast({
                          title: "Popup blocked",
                          description: "Enable popups or continue with redirect mode.",
                          variant: "destructive",
                        });
                        return;
                      }

                      toast({
                        title: "Authentication error",
                        description: error.message || "Unable to initialize Humanity sign-in.",
                        variant: "destructive",
                      });
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Changed credentials or not seeing the consent screen?{" "}
                  <button
                    onClick={() => loginWithForcedConsent()}
                    className="text-electric-blue underline hover:text-electric-blue/80 cursor-pointer bg-transparent border-none p-0"
                  >
                    Force re-consent
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="border-gray-800 bg-black/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-6 w-6" />
              Humanity SDK Session Active
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium text-white">You are authenticated with Humanity SDK.</p>
              <p className="text-sm text-gray-400">
                Run a quick verification to sync your human-proof state for rewards.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Verification Result</p>
                <Badge className="bg-electric-blue/20 text-electric-blue border-none">
                  {verificationResult?.verified ? "Verified" : "Pending"}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm font-medium text-white">Social Accounts Check</p>
                <Badge className="bg-electric-blue/20 text-electric-blue border-none">
                  {!socialAccountsCheck?.checked
                    ? "Not Checked"
                    : socialAccountsCheck.verified
                      ? `Verified (${socialAccountsCheck.count})`
                      : "No Accounts"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  clearVerificationCache();
                  verify("is_human");
                }}
                disabled={isVerifying}
                className="flex-1 bg-electric-blue hover:bg-electric-blue/80 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isVerifying ? "Verifying..." : "Verify is_human"}
              </Button>
              <Button
                onClick={() => {
                  clearVerificationCache();
                  resetVerification();
                }}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                Re-check
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  try {
                    const result = await verify("social_accounts");
                    const rawValue =
                      (result as any)?.value ??
                      (result as any)?.result?.value ??
                      (result as any)?.social_accounts ??
                      [];
                    const socialCount = Array.isArray(rawValue) ? rawValue.length : 0;
                    const socialVerified = Boolean((result as any)?.verified) || socialCount > 0;
                    setSocialAccountsCheck({
                      checked: true,
                      verified: socialVerified,
                      count: socialCount,
                    });
                    toast({
                      title: "Social check completed",
                      description: socialVerified
                        ? `Detected ${socialCount} linked social account(s).`
                        : "No linked social accounts found in current identity scope.",
                    });
                  } catch (error: any) {
                    setSocialAccountsCheck({
                      checked: true,
                      verified: false,
                      count: 0,
                    });
                    toast({
                      title: "Social check failed",
                      description: error?.message || "Unable to verify social_accounts.",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={isVerifying}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                Verify social_accounts
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  window.location.href = "/creators";
                }}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white"
              >
                Go to Creator Portal
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await logout();
                  } catch {
                    toast({
                      title: "Logout warning",
                      description: "Provider logout failed, local session cleared.",
                      variant: "destructive",
                    });
                  }
                  localStorage.removeItem("webpayback_session");
                  localStorage.removeItem("humanity_auth");
                  window.dispatchEvent(new CustomEvent("webpayback-logout"));
                }}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
            {/* Re-auth: forces a new Humanity login with prompt=consent so that
                changed credentials (e.g. removed palm, added social) produce a
                fresh access token and the verify() call returns updated results */}
            <div className="pt-2 border-t border-gray-800">
              <Button
                onClick={() => loginWithForcedConsent()}
                variant="outline"
                className="w-full border-gray-700 hover:bg-gray-800 text-gray-400 text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-authenticate with Humanity (changed credentials?)
              </Button>
              <p className="text-xs text-gray-600 text-center mt-1">
                Use this if you added / removed credentials in Humanity and verify still returns the old result.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
