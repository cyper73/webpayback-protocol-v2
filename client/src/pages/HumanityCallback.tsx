import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, XCircle } from "lucide-react";
import { useHumanity } from "@humanity-org/react-sdk";

const TIMEOUT_MS = 30_000; // 30 seconds max wait

export default function HumanityCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, error } = useHumanity();
  const hasCode = new URLSearchParams(window.location.search).has("code");
  const navigatedRef = useRef(false);
  const [timedOut, setTimedOut] = useState(false);

  // If there's no code at all, this page was opened directly — go home
  useEffect(() => {
    if (!hasCode) {
      navigate("/", { replace: true });
    }
  }, [hasCode, navigate]);

  // Wait for SDK to either authenticate or emit an error
  // Do NOT navigate on isLoading=false alone — the SDK has two sequential
  // effects and the first one sets unauthenticated before the callback
  // processor starts.
  useEffect(() => {
    if (!hasCode || navigatedRef.current) return;

    if (isAuthenticated) {
      navigatedRef.current = true;
      navigate("/login", { replace: true });
      return;
    }

    if (error) {
      navigatedRef.current = true;
      // Small delay so the error is visible to the user
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    }
  }, [isAuthenticated, error, hasCode, navigate]);

  // Safety timeout — if SDK never resolves, go back to login
  useEffect(() => {
    if (!hasCode) return;
    const timer = setTimeout(() => {
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        setTimedOut(true);
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    }, TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [hasCode, navigate]);

  if (timedOut) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-gray-300">
          <XCircle className="h-8 w-8 text-red-400" />
          <span className="text-lg">Authentication timed out.</span>
          <span className="text-sm text-gray-500">Returning to login…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-gray-300">
          <XCircle className="h-8 w-8 text-red-400" />
          <span className="text-lg">Sign-in failed.</span>
          <span className="text-sm text-gray-500">{error.message}</span>
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
