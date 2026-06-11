import { useState, useEffect } from 'react';
import CreatorPortal from '../creators/CreatorPortal';
import TwoFactorGate from './TwoFactorGate';

const SESSION_KEY = 'webpayback_2fa_verified';
const TIMESTAMP_KEY = 'webpayback_2fa_timestamp';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

function isSessionValid(): boolean {
  if (sessionStorage.getItem(SESSION_KEY) !== 'true') return false;
  const ts = parseInt(sessionStorage.getItem(TIMESTAMP_KEY) || '0', 10);
  return Date.now() - ts < SESSION_TTL_MS;
}

export default function ProtectedCreatorPortal() {
  const [authenticated, setAuthenticated] = useState<boolean>(() => isSessionValid());

  useEffect(() => {
    if (!isSessionValid()) {
      setAuthenticated(false);
    }
  }, []);

  if (!authenticated) {
    return (
      <TwoFactorGate
        requiredFor="Creator Portal"
        onAuthenticationSuccess={() => setAuthenticated(true)}
      />
    );
  }

  return <CreatorPortal />;
}
