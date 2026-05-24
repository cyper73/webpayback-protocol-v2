import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@humanity-org/react-sdk";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * Humanity OAuth callback page.
 *
 * Humanity redirects the user here with `?code=...&state=...` (success) or
 * `?error=...&error_description=...` (failure). The HumanityProvider SDK
 * (mounted in main.tsx with storage="localStorage") automatically detects
 * the code in the URL, performs the PKCE token exchange, persists the access
 * token, and flips `useAuth().isAuthenticated` to true.
 *
 * This component:
 *  1. If the URL carries an explicit OAuth error, displays it immediately.
 *  2. Otherwise waits for the SDK to flip `isAuthenticated`.
 *  3. After a generous timeout, surfaces a friendly retry screen — never
 *     prematurely redirects to /login with a false-negative error.
 */
export default function HumanityCallback() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Read OAuth error / code synchronously from the URL once on mount.
  const [urlError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (!err) return null;
    const desc = params.get("error_description");
    return desc ? `${err}: ${desc}` : err;
  });

  const [hasAuthCode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("code");
  });

  const [timedOut, setTimedOut] = useState(false);

  // Redirect to /login as soon as the SDK confirms authentication.
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Give the SDK plenty of time to complete the exchange before showing a
  // failure. We do NOT redirect to /login?error=... — that was causing
  // false-negative "Sign in failed" toasts when the SDK was still working.
  useEffect(() => {
    if (urlError || isAuthenticated || !hasAuthCode) return;
    const t = setTimeout(() => setTimedOut(true), 20000);
    return () => clearTimeout(t);
  }, [urlError, isAuthenticated, hasAuthCode]);

  // Case 1: Humanity explicitly returned an error.
  if (urlError) {
    return (
      <ErrorView
        title="Humanity sign-in error"
        message={urlError}
        onRetry={() => navigate("/login", { replace: true })}
      />
    );
  }

  // Case 2: URL has neither code nor error — user landed here directly.
  if (!hasAuthCode) {
    return (
      <ErrorView
        title="No sign-in in progress"
        message="This page is reached automatically after signing in with Humanity."
        onRetry={() => navigate("/login", { replace: true })}
      />
    );
  }

  // Case 3: Exchange took too long.
  if (timedOut) {
    return (
      <ErrorView
        title="Sign-in is taking longer than expected"
        message="The Humanity token exchange did not complete. Please try again."
        onRetry={() => navigate("/login", { replace: true })}
      />
    );
  }

  // Case 4: Default — waiting for the SDK to finish the exchange.
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-electric-blue" />
        <p className="text-gray-300">Completing Humanity sign-in…</p>
      </div>
    </div>
  );
}

function ErrorView({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <p className="text-sm text-gray-300 break-words">{message}</p>
        <button
          onClick={onRetry}
          className="w-full bg-electric-blue hover:bg-electric-blue/80 text-black font-medium px-4 py-2 rounded-md transition"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}
