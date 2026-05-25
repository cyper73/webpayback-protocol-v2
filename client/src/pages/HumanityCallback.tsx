import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@humanity-org/react-sdk";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * Humanity OAuth callback page — HYBRID approach.
 *
 * The Humanity React SDK stores PKCE in sessionStorage, but its internal
 * callback handler tries to exchange the code browser-to-Humanity which
 * fails in production due to CORS. We intercept the redirect here, read
 * code/state from the URL and the PKCE verifier from sessionStorage, then
 * POST to our backend /api/humanity/exchange-token which does the exchange
 * server-to-server. After a successful exchange we store the access token in
 * localStorage (so it survives page refreshes) and navigate to /login.
 *
 * Race condition fix: we use a ref (hasStarted) so this runs exactly once,
 * regardless of how many times isAuthenticated or navigate change. We also
 * clear the ?code= params from the URL immediately on mount so the SDK
 * internal handler does not re-process them and trigger a second redirect.
 */
export default function HumanityCallback() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const hasStarted = useRef(false);

  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Guard: run exactly once
    if (hasStarted.current) return;
    hasStarted.current = true;

    // If already authenticated (cached token), skip exchange and go to /login
    if (isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const oauthError = params.get("error");
        const oauthDesc = params.get("error_description");

        // Clear ?code= params from the URL immediately so the SDK internal
        // handler cannot also process them and cause a second redirect.
        window.history.replaceState({}, "", window.location.pathname);

        if (oauthError) {
          setErrorMessage(oauthDesc ? `${oauthError}: ${oauthDesc}` : oauthError);
          setStatus("error");
          return;
        }

        if (!code || !state) {
          setErrorMessage("Missing OAuth code or state in callback URL.");
          setStatus("error");
          return;
        }

        // Firefox ETP can wipe sessionStorage after a cross-origin redirect.
        // Try sessionStorage first, fall back to localStorage backup.
        const codeVerifier =
          sessionStorage.getItem("humanity_pkce") ||
          localStorage.getItem("humanity_pkce_backup");
        const storedState =
          sessionStorage.getItem("humanity_state") ||
          localStorage.getItem("humanity_state_backup");

        if (!codeVerifier) {
          setErrorMessage(
            "Missing PKCE code verifier. The session may have expired or the redirect came from a different browser tab."
          );
          setStatus("error");
          return;
        }

        if (storedState && state !== storedState) {
          setErrorMessage("OAuth state mismatch. Possible CSRF attempt or stale session.");
          setStatus("error");
          return;
        }

        // Clean up PKCE keys before calling backend so the SDK internal handler
        // won't find them and attempt its own (CORS-blocked) exchange.
        sessionStorage.removeItem("humanity_pkce");
        sessionStorage.removeItem("humanity_state");
        sessionStorage.removeItem("humanity_redirect_count");
        localStorage.removeItem("humanity_pkce_backup");
        localStorage.removeItem("humanity_state_backup");

        // Call our backend which exchanges the code server-to-server.
        const response = await fetch("/api/humanity/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, codeVerifier }),
        });

        const data = await response.json().catch(() => ({
          error: `Server returned non-JSON (HTTP ${response.status})`,
        }));

        if (!response.ok || data.error) {
          const msg = data.error ?? `Token exchange failed (${response.status})`;
          setErrorMessage(msg);
          setStatus("error");
          return;
        }

        // Persist token in the exact format the Humanity React SDK expects.
        const authState = {
          accessToken: data.accessToken ?? null,
          refreshToken: data.refreshToken ?? null,
          expiresAt: data.expiresIn ? Date.now() + data.expiresIn * 1000 : null,
          authorizationId: data.authorizationId ?? "",
          appScopedUserId: data.appScopedUserId ?? "",
          user: null,
        };
        localStorage.setItem("humanity_auth", JSON.stringify(authState));

        navigate("/login", { replace: true });
      } catch (err: any) {
        console.error("[HumanityCallback] unexpected error:", err);
        setErrorMessage(err?.message ?? "Unexpected error during callback");
        setStatus("error");
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — runs once on mount only

  if (status === "error" && errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
            <h2 className="text-lg font-semibold text-white">Sign-in failed</h2>
          </div>
          <p className="text-sm text-gray-300 break-words">{errorMessage}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full bg-electric-blue hover:bg-electric-blue/80 text-black font-medium px-4 py-2 rounded-md transition"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-electric-blue" />
        <p className="text-gray-300">Completing Humanity sign-in…</p>
      </div>
    </div>
  );
}
