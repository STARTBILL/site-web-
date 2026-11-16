/**
 * middleware/requireSuperAdmin.js
 * Middleware de sécurité RBAC strict pour toutes les routes /api/admin/* :
 * - Vérification stricte : user.email === 'contact.startbill@gmail.com' && user.role === 'super_admin' -> sinon 403 Forbidden
 * - Rate Limiting : 10 requêtes / minute max par IP sur /admin/* (HTTP 429)
 * - Protection CSRF : validation du header X-CSRF-Token par rapport à la session
 * - Expiration d'inactivité : 30 minutes max (HTTP 401)
 * - Enforcement 2FA (TOTP) et changement de mot de passe initial (mustChangePassword)
 */

import crypto from 'node:crypto';

export const SUPER_ADMIN_EMAIL = 'contact.startbill@gmail.com';
export const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const ADMIN_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const ADMIN_RATE_LIMIT_MAX_REQUESTS = 10;

const rateLimitStore = new Map();

/**
 * Rate Limiter strict pour les routes /admin/* : 10 requêtes / minute maximum.
 */
export function adminRateLimiter(req, res, next) {
  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  const key = `admin:${ip}`;
  const now = Date.now();

  const timestamps = (rateLimitStore.get(key) || []).filter(
    (ts) => now - ts < ADMIN_RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= ADMIN_RATE_LIMIT_MAX_REQUESTS) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((ADMIN_RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000));
    res.setHeader('Retry-After', String(retryAfterSec));
    return res.status(429).json({
      success: false,
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
      error: `Limite de sécurité atteinte (${ADMIN_RATE_LIMIT_MAX_REQUESTS} req/min max). Réessayez dans ${retryAfterSec}s.`,
    });
  }

  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  next();
}

/**
 * Fabrique le middleware requireSuperAdmin connecté au gestionnaire de sessions serveur.
 */
export function createRequireSuperAdmin({
  resolveSession,
  touchSession,
  destroySession,
  onUnauthorizedAttempt,
}) {
  return function requireSuperAdmin(req, res, next) {
    const session = resolveSession(req);
    const user = session?.user || req.user || null;

    if (!session || !user) {
      if (onUnauthorizedAttempt) {
        onUnauthorizedAttempt(req, 'Unauthenticated access attempt on admin route');
      }
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_SUPER_ADMIN_ONLY',
        error: '403 Forbidden : accès strictement réservé au Super Administrateur.',
      });
    }

    // Déconnexion automatique après 30 minutes d'inactivité
    const now = Date.now();
    if (now - session.lastActivityAt > ADMIN_IDLE_TIMEOUT_MS) {
      destroySession(session.id);
      return res.status(401).json({
        success: false,
        code: 'SESSION_IDLE_EXPIRED',
        error: "Session expirée après 30 minutes d'inactivité. Veuillez vous reconnecter.",
      });
    }

    // Vérification RBAC stricte demandée
    if (user.email !== SUPER_ADMIN_EMAIL || user.role !== 'super_admin') {
      if (onUnauthorizedAttempt) {
        onUnauthorizedAttempt(
          req,
          `RBAC violation attempt by ${user.email || 'unknown'} (role=${user.role})`
        );
      }
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_SUPER_ADMIN_ONLY',
        error: '403 Forbidden : privilèges Super Administrateur requis.',
      });
    }

    // Protection CSRF sur toutes les mutations (POST, PUT, PATCH, DELETE)
    const method = String(req.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const headerToken = String(req.headers['x-csrf-token'] || '');
      const expectedToken = String(session.csrfToken || '');
      const headerBuf = Buffer.from(headerToken);
      const expectedBuf = Buffer.from(expectedToken);

      if (
        !headerToken ||
        !expectedToken ||
        headerBuf.length !== expectedBuf.length ||
        !crypto.timingSafeEqual(headerBuf, expectedBuf)
      ) {
        return res.status(403).json({
          success: false,
          code: 'CSRF_TOKEN_INVALID',
          error: 'Jeton CSRF manquant ou invalide.',
        });
      }
    }

    const requestPath = req.path || '';
    const isAuthLifecycleRoute =
      requestPath.startsWith('/auth/') || requestPath === '/session';

    // Forcer le changement du mot de passe initial à la première connexion
    if (user.mustChangePassword && !isAuthLifecycleRoute) {
      return res.status(403).json({
        success: false,
        code: 'MUST_CHANGE_PASSWORD',
        error: 'Vous devez modifier votre mot de passe initial avant d’accéder au panneau.',
      });
    }

    // 2FA TOTP obligatoire pour le Super Administrateur
    if (!session.totpVerified && !isAuthLifecycleRoute) {
      return res.status(403).json({
        success: false,
        code: 'TOTP_2FA_REQUIRED',
        error: 'Validation 2FA (Google Authenticator) obligatoire requise.',
      });
    }

    touchSession(session.id);
    req.user = user;
    req.adminSession = session;
    next();
  };
}
