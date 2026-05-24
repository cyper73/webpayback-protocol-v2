import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@humanity-org/react-sdk";
import { Loader2 } from "lucide-react";

/**
 * Humanity OAuth callback page.
 *
 * The HumanityProvider SDK (mounted in main.tsx) automatically detects the
 * `?code=...&state=...` query params on this URL, performs the PKCE token
 * exchange, persists the access token to the configured storage backend
 * (localStorage), and flips `useAuth().isAuthenticated` to true.
 *
 * This component only renders a loading state while that happens, then
 * navigates the user to /login (which renders post-auth state via useAuth).
 */
export default function HumanityCallback() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    // Whether the SDK succeeded or failed, send the user back to /login.
    // Login.tsx reads useAuth() and useVerification() to drive the next step.
    navigate(isAuthenticated ? "/login" : "/login?error=auth_failed", { replace: true });
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-electric-blue" />
        <p className="text-gray-300">Completing Humanity sign-in…</p>
      </div>
    </div>
  );
}
