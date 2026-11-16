import { useEffect, useState, useRef } from 'react';

export const SUPER_ADMIN_EMAIL = 'contact.startbill@gmail.com';
export const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export interface BasicUserIdentity {
  email?: string | null;
  role?: string | null;
}

/**
 * Hook RBAC strict côté frontend :
 * L'accès au bouton "Administration" et aux routes /admin/* est strictement réservé
 * à contact.startbill@gmail.com avec le rôle 'super_admin'.
 */
export function useSuperAdmin(user?: BasicUserIdentity | null) {
  const email = String(user?.email || '').trim().toLowerCase();
  const role = String(user?.role || '').trim();

  const isSuperAdmin = email === SUPER_ADMIN_EMAIL && role === 'super_admin';

  return {
    isSuperAdmin,
    superAdminEmail: SUPER_ADMIN_EMAIL,
  };
}

/**
 * Déconnexion automatique après 30 minutes d'inactivité.
 */
export function useIdleLogout(
  enabled: boolean,
  onIdleTimeout: () => void,
  timeoutMs: number = ADMIN_IDLE_TIMEOUT_MS
) {
  const [remainingMs, setRemainingMs] = useState(timeoutMs);
  const lastActivityRef = useRef<number>(Date.now());
  const onIdleRef = useRef(onIdleTimeout);
  onIdleRef.current = onIdleTimeout;

  useEffect(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();
    setRemainingMs(timeoutMs);

    const resetActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ];

    events.forEach((evt) => window.addEventListener(evt, resetActivity, { passive: true }));

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const left = Math.max(0, timeoutMs - elapsed);
      setRemainingMs(left);
      if (left <= 0) {
        onIdleRef.current();
      }
    }, 10_000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetActivity));
      window.clearInterval(interval);
    };
  }, [enabled, timeoutMs]);

  return {
    remainingMs,
    remainingMinutes: Math.ceil(remainingMs / 60_000),
  };
}
