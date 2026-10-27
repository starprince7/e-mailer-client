'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { CheckCircle2 } from 'lucide-react';

export const API_KEY_UPDATED_EVENT = 'resend-api-key-updated';

type KeyStatus = 'checking' | 'local' | 'env' | 'missing';

function subscribeToKeyChanges(callback: () => void) {
  window.addEventListener(API_KEY_UPDATED_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(API_KEY_UPDATED_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useApiKeyStatus(): KeyStatus {
  // The browser-stored key is authoritative — it wins over server config.
  const localKey = useSyncExternalStore(
    subscribeToKeyChanges,
    () => localStorage.getItem('resend_api_key'),
    () => null
  );

  const [envStatus, setEnvStatus] = useState<'checking' | 'env' | 'missing'>('checking');

  useEffect(() => {
    if (localKey) return;

    let cancelled = false;
    fetch('/api/check-env-key')
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setEnvStatus(data.hasEnvKey ? 'env' : 'missing');
      })
      .catch(() => {
        if (!cancelled) setEnvStatus('missing');
      });
    return () => {
      cancelled = true;
    };
  }, [localKey]);

  return localKey ? 'local' : envStatus;
}

/**
 * Prominent success banner shown on every page once a Resend API key is
 * configured — either in browser storage or server-side config.
 */
export function ApiKeyBanner() {
  const status = useApiKeyStatus();

  if (status !== 'local' && status !== 'env') return null;

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 px-4 py-2.5">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span className="truncate">API key connected — you&apos;re ready to send emails</span>
      </div>
    </div>
  );
}
