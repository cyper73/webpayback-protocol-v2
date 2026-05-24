import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, XCircle } from "lucide-react";

const PKCE_KEY = "humanity_pkce";
const STATE_KEY = "humanity_state";

type Status = "loading" | "success" | "error";

export default function HumanityCallback() {
  const navigate = useNavigate();
  const calledRef = useRef(false);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const oauthError = params.get("error");

    // Clean the URL immediately so the code isn't reused on refresh
    window.history.replaceState({}, document.title, window.location.pathname);

    // Humanity returned an error directly
    if (oauthError) {
      const desc = params.get("error_description") ?? oauthError;
      setErrorMsg(desc);
      setStatus("error");
      setTimeout(() => navigate("/login", { replace: true }), 2500);
      return;
    }

    // No code — wrong page or stale URL
    if (!code) {
      navigate("/", { replace: true });
      return;
    }

    // Read PKCE state saved by the SDK before the redirect
    const codeVerifier = sessionStorage.getItem(PKCE_KEY);
    const storedState = sessionStorage.getItem(STATE_KEY);

    // Clean up immediately so they can't be reused
    sessionStorage.removeItem(PKCE_KEY);
    sessionStorage.removeItem(STATE_KEY);
    // Reset the redirect counter so future logins work
    sessionStorage.removeItem("humanity_redirect_count");

    if (!codeVerifier) {
      setErrorMsg("PKCE verifier missing — please try logging in again.");
      setStatus("error");
      setTimeout(() => navigate("/login", { replace: true }), 2500);
      return;
    }

    if (!state || !storedState || state !== storedState) {
      setErrorMsg("OAuth state mismatch — possible CSRF. Please try again.");
      setStatus("error");
      setTimeout(() => navigate("/login", { replace: true }), 2500);
      return;
    }

    // Exchange code for token server-side (bypasses browser CORS/CSP entirely)
    fetch("/api/humanity/exchange-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, codeVerifier }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        // Store the token so the rest of the app can use it
        if (data.accessToken) {
          sessionStorage.setItem("humanity_access_token", data.accessToken);
          if (data.refreshToken) {
            sessionStorage.setItem("humanity_refresh_token", data.refreshToken);
          }
        }
        setStatus("success");
        navigate("/login", { replace: true });
      })
      .catch((err: any) => {
        console.error("[HumanityCallback] exchange failed:", err);
        setErrorMsg(err?.message ?? "Token exchange failed. Please try again.");
        setStatus("error");
        setTimeout(() => navigate("/login", { replace: true }), 2500);
      });
  }, [navigate]);

  if (status === "error") {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-gray-300">
          <XCircle className="h-8 w-8 text-red-400" />
          <span className="text-lg">Sign-in failed.</span>
          <span className="text-sm text-gray-500 text-center max-w-xs">{errorMsg}</span>
          <span className="text-xs text-gray-600">Returning to login…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-gray-300">
        <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
        <span className="text-lg">Completing sign-in with Humanity…</span>
        <span className="text-sm text-gray-500">Please wait, do not close this page.</span>
      </div>
    </div>
  );
}
