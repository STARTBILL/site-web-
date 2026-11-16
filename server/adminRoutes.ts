import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import {
  getDb,
  saveDb,
  sanitizeUserForClient,
  appendAuditLog,
  SUPER_ADMIN_EMAIL,
  type UserRole,
  type UserStatus,
} from './db.ts';
import {
  generateTotpSecret,
  generateTotpQrDataUrl,
  verifyTotpCode,
  buildOtpAuthUri,
} from './totp.ts';
import {
  adminRateLimiter,
  createRequireSuperAdmin,
  ADMIN_IDLE_TIMEOUT_MS,
} from '../middleware/requireSuperAdmin.js';

export interface AdminSession {
  id: string;
  userId: string;
  email: string;
  role: string;
  csrfToken: string;
  totpVerified: boolean;
  pendingTotpSecret?: string | null;
  ip: string;
  userAgent: string;
  createdAt: number;
  lastActivityAt: number;
}

interface AdminRequest extends Request {
  adminSession?: AdminSession;
}

const adminSessions = new Map<string, AdminSession>();
const ADMIN_COOKIE_NAME = 'sb_admin_sid';

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie || '';
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    if (key) out[key] = val;
  }
  return out;
}

function getClientIp(req: Request): string {
  return (
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
}

function setSessionCookie(req: Request, res: Response, sessionId: string) {
  const isHttps =
    req.secure || req.headers['x-forwarded-proto']?.toString().includes('https');
  const flags = [
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
    'Path=/',
    'HttpOnly',
    isHttps ? 'SameSite=None' : 'SameSite=Lax',
    `Max-Age=${Math.floor(ADMIN_IDLE_TIMEOUT_MS / 1000)}`,
  ];
  if (isHttps) flags.push('Secure');
  res.setHeader('Set-Cookie', flags.join('; '));
}

function clearSessionCookie(res: Response) {
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

function resolveSession(req: Request) {
  const cookies = parseCookies(req);
  const headerToken = req.headers['x-admin-session']?.toString().trim();
  const sid = cookies[ADMIN_COOKIE_NAME] || headerToken;
  if (!sid) return null;

  const session = adminSessions.get(sid);
  if (!session) return null;

  const db = getDb();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return null;

  return {
    ...session,
    user,
  };
}

function touchSession(sessionId: string) {
  const session = adminSessions.get(sessionId);
  if (session) {
    session.lastActivityAt = Date.now();
  }
}

function destroySession(sessionId: string) {
  adminSessions.delete(sessionId);
}

function maskSecretKey(rawKey: string): string {
  const trimmed = rawKey.trim();
  if (!trimmed) return 'Non configurée';
  const suffix = trimmed.slice(-4);
  const prefix = trimmed.slice(0, Math.min(7, Math.max(0, trimmed.length - 4)));
  return `${prefix}••••••••••••••••${suffix}`;
}

export function computeDashboardAnalytics() {
  const db = getDb();
  const usersByRegion = {
    CA: db.users.filter((u) => u.region === 'CA').length,
    AF: db.users.filter((u) => u.region === 'AF').length,
    HT: db.users.filter((u) => u.region === 'HT').length,
  };

  const now = Date.now();
  const invoicesDay = db.invoices.filter(
    (inv) => now - new Date(inv.createdAt).getTime() <= 86_400_000
  ).length;
  const invoicesWeek = db.invoices.filter(
    (inv) => now - new Date(inv.createdAt).getTime() <= 7 * 86_400_000
  ).length;
  const invoicesMonth = db.invoices.filter(
    (inv) => now - new Date(inv.createdAt).getTime() <= 30 * 86_400_000
  ).length;

  const totalRevenueCad = db.payments
    .filter((p) => p.status === 'succeeded')
    .reduce((acc, p) => acc + p.amount, 0);

  const mrrCad = db.subscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, s) => acc + s.amount, 0);

  const nonAdminUsers = db.users.filter((u) => u.role !== 'super_admin');
  const proUsersCount = nonAdminUsers.filter((u) => u.plan === 'Pro').length;
  const conversionFreeToPro =
    nonAdminUsers.length > 0
      ? Number(((proUsersCount / nonAdminUsers.length) * 100).toFixed(1))
      : 0;

  const revenueByPlan = {
    Free: 0,
    Start: db.subscriptions
      .filter((s) => s.plan === 'Start' && s.status === 'active')
      .reduce((acc, s) => acc + s.amount, 0),
    Pro: db.subscriptions
      .filter((s) => s.plan === 'Pro' && s.status === 'active')
      .reduce((acc, s) => acc + s.amount, 0),
  };

  const cadInvoices = db.invoices.filter((i) => i.currency === 'CAD');
  const avgInvoiceCad =
    cadInvoices.length > 0
      ? Number(
          (cadInvoices.reduce((sum, i) => sum + i.amount, 0) / cadInvoices.length).toFixed(2)
        )
      : 0;

  return {
    totalUsers: db.users.length,
    usersByRegion,
    invoicesCreated: {
      day: invoicesDay,
      week: invoicesWeek,
      month: invoicesMonth,
      total: db.invoices.length,
    },
    totalRevenueCad,
    mrrCad,
    conversionFreeToPro,
    revenueByPlan,
    invoiceStats: {
      avgAmountCad: avgInvoiceCad,
      dominantCurrency: 'CAD',
      flaggedCount: db.invoices.filter((i) => i.flaggedFraud).length,
    },
    activitySeries: [
      { label: 'Sem. 1', signups: 3, invoices: 14, ocrUsage: 9, aiAdvisorUsage: 6 },
      { label: 'Sem. 2', signups: 4, invoices: 22, ocrUsage: 15, aiAdvisorUsage: 11 },
      { label: 'Sem. 3', signups: 5, invoices: 31, ocrUsage: 21, aiAdvisorUsage: 17 },
      { label: 'Sem. 4', signups: 7, invoices: 42, ocrUsage: 29, aiAdvisorUsage: 24 },
    ],
    featureUsage: [
      { feature: 'Facturation & Devis', percent: 94, sessions: 148 },
      { feature: 'OCR Reçus', percent: 62, sessions: 74 },
      { feature: 'Conseiller IA / Assistant', percent: 48, sessions: 58 },
      { feature: 'Exports comptables TPS/TVQ', percent: 71, sessions: 89 },
    ],
    performance: {
      uptimePercent: 99.98,
      errorRatePercent: 0.12,
      p95LatencyMs: 84,
    },
  };
}

export function createAdminAuthRouter() {
  const router = express.Router();

  router.get('/session', (req: Request, res: Response) => {
    const resolved = resolveSession(req);
    if (!resolved) {
      res.json({
        authenticated: false,
        user: null,
        totpVerified: false,
        mustChangePassword: false,
      });
      return;
    }

    const now = Date.now();
    if (now - resolved.lastActivityAt > ADMIN_IDLE_TIMEOUT_MS) {
      destroySession(resolved.id);
      clearSessionCookie(res);
      res.status(401).json({
        authenticated: false,
        code: 'SESSION_IDLE_EXPIRED',
        error: "Session expirée après 30 minutes d'inactivité.",
      });
      return;
    }

    res.json({
      authenticated: true,
      user: sanitizeUserForClient(resolved.user),
      mustChangePassword: Boolean(resolved.user.mustChangePassword),
      totpEnabled: Boolean(resolved.user.totpEnabled),
      totpVerified: resolved.totpVerified,
      csrfToken: resolved.csrfToken,
      idleRemainingMs: Math.max(0, ADMIN_IDLE_TIMEOUT_MS - (now - resolved.lastActivityAt)),
    });
  });

  router.post('/login', async (req: Request, res: Response) => {
    const db = getDb();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const ip = getClientIp(req);
    const userAgent = String(req.headers['user-agent'] || 'Unknown');

    if (email !== SUPER_ADMIN_EMAIL) {
      db.loginHistory.unshift({
        id: `log-${Date.now()}`,
        email: email || 'inconnu',
        role: 'unauthorized',
        success: false,
        ip,
        browser: userAgent.slice(0, 60),
        location: 'Canada',
        timestamp: new Date().toISOString(),
      });
      db.securityAlerts.unshift({
        id: `sec-${Date.now()}`,
        severity: 'warning',
        title: 'Tentative de connexion Admin avec un email non autorisé',
        description: `Email rejeté sur /api/auth/admin/login : ${email || 'vide'}`,
        sourceIp: ip,
        resolved: false,
        createdAt: new Date().toISOString(),
      });
      saveDb(db);
      res.status(403).json({
        success: false,
        error: '403 Forbidden : accès strictement réservé au Super Administrateur.',
      });
      return;
    }

    const adminUser = db.users.find((u) => u.email === SUPER_ADMIN_EMAIL);
    if (!adminUser || !adminUser.passwordHash || adminUser.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        error: 'Compte Super Administrateur introuvable ou invalide.',
      });
      return;
    }

    const validPassword = await bcrypt.compare(password, adminUser.passwordHash);
    if (!validPassword) {
      db.loginHistory.unshift({
        id: `log-${Date.now()}`,
        email: SUPER_ADMIN_EMAIL,
        role: 'super_admin',
        success: false,
        ip,
        browser: userAgent.slice(0, 60),
        location: 'Canada',
        timestamp: new Date().toISOString(),
      });
      db.securityAlerts.unshift({
        id: `sec-${Date.now()}`,
        severity: 'critical',
        title: 'Échec de mot de passe sur le compte Super Admin',
        description: 'Mot de passe incorrect saisi lors de la tentative de connexion.',
        sourceIp: ip,
        resolved: false,
        createdAt: new Date().toISOString(),
      });
      saveDb(db);
      res.status(401).json({
        success: false,
        error: 'Identifiants administrateur invalides.',
      });
      return;
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(24).toString('hex');
    const now = Date.now();

    const session: AdminSession = {
      id: sessionId,
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      csrfToken,
      totpVerified: false, // 2FA TOTP obligatoire à chaque connexion
      pendingTotpSecret: null,
      ip,
      userAgent: userAgent.slice(0, 80),
      createdAt: now,
      lastActivityAt: now,
    };

    adminSessions.set(sessionId, session);
    setSessionCookie(req, res, sessionId);

    adminUser.lastLoginAt = new Date().toISOString();
    db.loginHistory.unshift({
      id: `log-${Date.now()}`,
      email: SUPER_ADMIN_EMAIL,
      role: 'super_admin',
      success: true,
      ip,
      browser: userAgent.slice(0, 60),
      location: 'Montréal, QC, Canada',
      timestamp: new Date().toISOString(),
    });
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'ADMIN_LOGIN_STEP1',
      target: SUPER_ADMIN_EMAIL,
      details: 'Mot de passe vérifié ; en attente de changement initial / 2FA',
      ip,
      userAgent: userAgent.slice(0, 60),
    });

    res.json({
      success: true,
      user: sanitizeUserForClient(adminUser),
      mustChangePassword: Boolean(adminUser.mustChangePassword),
      totpEnabled: Boolean(adminUser.totpEnabled),
      totpVerified: false,
      csrfToken,
      sessionToken: sessionId,
    });
  });

  router.post('/change-password', async (req: Request, res: Response) => {
    const resolved = resolveSession(req);
    if (!resolved || resolved.email !== SUPER_ADMIN_EMAIL) {
      res.status(403).json({ error: 'Session Super Admin invalide.' });
      return;
    }

    const csrfHeader = String(req.headers['x-csrf-token'] || '');
    if (!csrfHeader || csrfHeader !== resolved.csrfToken) {
      res.status(403).json({ error: 'Jeton CSRF invalide.' });
      return;
    }

    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');

    if (!resolved.user.passwordHash) {
      res.status(400).json({ error: 'Configuration mot de passe invalide.' });
      return;
    }

    const matchesCurrent = await bcrypt.compare(currentPassword, resolved.user.passwordHash);
    if (!matchesCurrent) {
      res.status(400).json({ error: 'Le mot de passe actuel est incorrect.' });
      return;
    }

    if (
      newPassword.length < 12 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      res.status(400).json({
        error:
          'Le nouveau mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un symbole.',
      });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        error: 'Le nouveau mot de passe doit être différent du mot de passe initial.',
      });
      return;
    }

    const db = getDb();
    const adminUser = db.users.find((u) => u.email === SUPER_ADMIN_EMAIL);
    if (!adminUser) {
      res.status(404).json({ error: 'Compte introuvable.' });
      return;
    }

    adminUser.passwordHash = await bcrypt.hash(newPassword, 12);
    adminUser.mustChangePassword = false;
    adminUser.updatedAt = new Date().toISOString();
    saveDb(db);
    touchSession(resolved.id);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'ADMIN_PASSWORD_CHANGED',
      target: SUPER_ADMIN_EMAIL,
      details: 'Mot de passe initial remplacé avec hachage bcrypt (12 rounds)',
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.json({
      success: true,
      user: sanitizeUserForClient(adminUser),
      mustChangePassword: false,
      totpEnabled: Boolean(adminUser.totpEnabled),
      totpVerified: resolved.totpVerified,
    });
  });

  router.post('/totp/setup', async (req: Request, res: Response) => {
    const resolved = resolveSession(req);
    if (!resolved || resolved.email !== SUPER_ADMIN_EMAIL) {
      res.status(403).json({ error: 'Session Super Admin requise.' });
      return;
    }

    const csrfHeader = String(req.headers['x-csrf-token'] || '');
    if (!csrfHeader || csrfHeader !== resolved.csrfToken) {
      res.status(403).json({ error: 'Jeton CSRF invalide.' });
      return;
    }

    if (resolved.user.mustChangePassword) {
      res.status(403).json({
        error: 'Veuillez d’abord changer votre mot de passe initial.',
      });
      return;
    }

    if (resolved.user.totpEnabled && resolved.user.totpSecret) {
      res.json({
        alreadyEnrolled: true,
        message: '2FA déjà activée. Saisissez le code à 6 chiffres depuis Google Authenticator.',
      });
      return;
    }

    const session = adminSessions.get(resolved.id)!;
    const secret = session.pendingTotpSecret || generateTotpSecret();
    session.pendingTotpSecret = secret;
    touchSession(resolved.id);

    const qrDataUrl = await generateTotpQrDataUrl(SUPER_ADMIN_EMAIL, secret);
    const otpauthUri = buildOtpAuthUri(SUPER_ADMIN_EMAIL, secret);

    res.json({
      alreadyEnrolled: false,
      secret,
      qrDataUrl,
      otpauthUri,
    });
  });

  router.post('/totp/verify', (req: Request, res: Response) => {
    const resolved = resolveSession(req);
    if (!resolved || resolved.email !== SUPER_ADMIN_EMAIL) {
      res.status(403).json({ error: 'Session Super Admin requise.' });
      return;
    }

    const csrfHeader = String(req.headers['x-csrf-token'] || '');
    if (!csrfHeader || csrfHeader !== resolved.csrfToken) {
      res.status(403).json({ error: 'Jeton CSRF invalide.' });
      return;
    }

    if (resolved.user.mustChangePassword) {
      res.status(403).json({ error: 'Changement de mot de passe requis avant la 2FA.' });
      return;
    }

    const session = adminSessions.get(resolved.id)!;
    const code = String(req.body?.code || '').trim();
    const secret = resolved.user.totpEnabled
      ? resolved.user.totpSecret
      : session.pendingTotpSecret;

    if (!secret) {
      res.status(400).json({ error: 'Aucune clé TOTP initialisée. Rechargez la configuration 2FA.' });
      return;
    }

    const isValid = verifyTotpCode(secret, code);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: 'Code TOTP invalide ou expiré. Vérifiez Google Authenticator.',
      });
      return;
    }

    const db = getDb();
    const adminUser = db.users.find((u) => u.email === SUPER_ADMIN_EMAIL)!;
    if (!adminUser.totpEnabled) {
      adminUser.totpSecret = secret;
      adminUser.totpEnabled = true;
      adminUser.updatedAt = new Date().toISOString();
      saveDb(db);
    }

    session.pendingTotpSecret = null;
    session.totpVerified = true;
    touchSession(resolved.id);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'ADMIN_2FA_VERIFIED',
      target: SUPER_ADMIN_EMAIL,
      details: 'Validation TOTP (Google Authenticator) réussie',
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.json({
      success: true,
      user: sanitizeUserForClient(adminUser),
      totpEnabled: true,
      totpVerified: true,
      csrfToken: session.csrfToken,
    });
  });

  router.post('/logout', (req: Request, res: Response) => {
    const resolved = resolveSession(req);
    if (resolved) {
      destroySession(resolved.id);
      appendAuditLog({
        actorEmail: resolved.email,
        action: 'ADMIN_LOGOUT',
        target: resolved.email,
        details: 'Déconnexion du panneau Super Administrateur',
        ip: getClientIp(req),
        userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
      });
    }
    clearSessionCookie(res);
    res.json({ success: true });
  });

  return router;
}

export function createProtectedAdminRouter() {
  const router = express.Router();

  const requireSuperAdmin = createRequireSuperAdmin({
    resolveSession,
    touchSession,
    destroySession,
    onUnauthorizedAttempt: (req: Request, reason: string) => {
      const db = getDb();
      db.securityAlerts.unshift({
        id: `sec-${Date.now()}`,
        severity: 'critical',
        title: 'Tentative d’accès refusée sur route /api/admin/*',
        description: `${reason} — Route: ${req.method} ${req.originalUrl}`,
        sourceIp: getClientIp(req),
        resolved: false,
        createdAt: new Date().toISOString(),
      });
      saveDb(db);
    },
  });

  // Protection globale sur TOUTES les routes /api/admin/*
  router.use(adminRateLimiter);
  router.use(requireSuperAdmin);

  // Snapshot consolidé pour éviter de dépasser 10 req/min lors du chargement du panneau
  router.get('/overview', (_req: Request, res: Response) => {
    const db = getDb();
    const activeSessionsList = Array.from(adminSessions.values()).map((s) => ({
      id: s.id,
      email: s.email,
      ip: s.ip,
      userAgent: s.userAgent,
      totpVerified: s.totpVerified,
      createdAt: new Date(s.createdAt).toISOString(),
      lastActivityAt: new Date(s.lastActivityAt).toISOString(),
    }));

    res.json({
      analytics: computeDashboardAnalytics(),
      users: db.users.map(sanitizeUserForClient),
      userActivities: db.userActivities,
      regions: db.regions,
      subscriptions: db.subscriptions,
      payments: db.payments,
      coupons: db.coupons,
      invoices: db.invoices,
      cms: db.cms,
      emailCampaigns: db.emailCampaigns,
      pushNotifications: db.pushNotifications,
      tickets: db.tickets,
      auditLogs: db.auditLogs,
      loginHistory: db.loginHistory,
      securityAlerts: db.securityAlerts,
      activeSessions: activeSessionsList,
      settings: db.settings,
    });
  });

  // B. Gestion des utilisateurs (pagination, recherche, filtres, CSV, actions)
  router.get('/users', (req: Request, res: Response) => {
    const db = getDb();
    const q = String(req.query.q || '').trim().toLowerCase();
    const region = String(req.query.region || 'ALL');
    const role = String(req.query.role || 'ALL');
    const status = String(req.query.status || 'ALL');
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const filtered = db.users
      .filter((u) => {
        if (q) {
          const hay = `${u.email} ${u.fullName} ${u.region}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (region !== 'ALL' && u.region !== region) return false;
        if (role !== 'ALL' && u.role !== role) return false;
        if (status !== 'ALL' && u.status !== status) return false;
        return true;
      })
      .map(sanitizeUserForClient);

    const start = (page - 1) * limit;
    res.json({
      items: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    });
  });

  router.get('/users/export.csv', (req: Request, res: Response) => {
    const db = getDb();
    const header = ['ID', 'Nom complet', 'Email', 'Role', 'Region', 'Plan', 'Statut', 'Verifie', 'Inscription'];
    const rows = db.users.map((u) => [
      u.id,
      `"${u.fullName.replace(/"/g, '""')}"`,
      u.email,
      u.role,
      u.region,
      u.plan,
      u.status,
      u.emailVerified ? 'Oui' : 'Non',
      u.createdAt,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'EXPORT_USERS_CSV',
      target: 'users',
      details: `Export CSV de ${db.users.length} utilisateurs`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="startbill-users.csv"');
    res.send(csv);
  });

  router.patch('/users/:id', (req: Request, res: Response) => {
    const db = getDb();
    const target = db.users.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }

    if (target.email === SUPER_ADMIN_EMAIL || target.role === 'super_admin' || target.immutable) {
      res.status(403).json({
        error: 'Protection critique : le compte Super Administrateur ne peut pas être suspendu ni rétrogradé.',
      });
      return;
    }

    const nextRole = req.body?.role as UserRole | undefined;
    const nextStatus = req.body?.status as UserStatus | undefined;

    if (nextRole && ['user', 'pro', 'admin'].includes(nextRole)) {
      target.role = nextRole;
      if (nextRole === 'pro') target.plan = 'Pro';
    }
    if (nextStatus && ['actif', 'suspendu'].includes(nextStatus)) {
      target.status = nextStatus;
    }
    target.updatedAt = new Date().toISOString();
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'UPDATE_USER',
      target: target.email,
      details: `Mise à jour : role=${target.role}, statut=${target.status}`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.json({ success: true, user: sanitizeUserForClient(target) });
  });

  router.delete('/users/:id', (req: Request, res: Response) => {
    const db = getDb();
    const target = db.users.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }

    // Protection stricte : Super Admin non supprimable
    if (target.email === SUPER_ADMIN_EMAIL || target.role === 'super_admin' || target.immutable) {
      res.status(403).json({
        error: 'Protection base de données : le Super Administrateur est unique et non supprimable.',
      });
      return;
    }

    db.users = db.users.filter((u) => u.id !== target.id);
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'DELETE_USER',
      target: target.email,
      details: `Suppression définitive du compte (${target.region})`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.json({ success: true, deletedId: target.id });
  });

  // C. Gestion des régions
  router.patch('/regions/:code', (req: Request, res: Response) => {
    const db = getDb();
    const region = db.regions.find((r) => r.code === req.params.code);
    if (!region) {
      res.status(404).json({ error: 'Région introuvable.' });
      return;
    }

    if (typeof req.body?.active === 'boolean') region.active = req.body.active;
    if (req.body?.devise) region.devise = req.body.devise;
    if (typeof req.body?.taxLabel === 'string') region.taxLabel = req.body.taxLabel;
    if (typeof req.body?.taxRate === 'number') region.taxRate = req.body.taxRate;
    if (typeof req.body?.previewNote === 'string') region.previewNote = req.body.previewNote;

    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'UPDATE_REGION',
      target: region.code,
      details: `active=${region.active}, devise=${region.devise}, taxes=${region.taxLabel} (${region.taxRate}%)`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.json({ success: true, region, regions: db.regions });
  });

  // D. Abonnements, paiements & coupons
  router.patch('/billing/payments/:id', (req: Request, res: Response) => {
    const db = getDb();
    const payment = db.payments.find((p) => p.id === req.params.id);
    if (!payment) {
      res.status(404).json({ error: 'Paiement introuvable.' });
      return;
    }
    const nextStatus = req.body?.status;
    if (nextStatus === 'refunded' || nextStatus === 'succeeded' || nextStatus === 'disputed') {
      payment.status = nextStatus;
      saveDb(db);
      appendAuditLog({
        actorEmail: SUPER_ADMIN_EMAIL,
        action: 'UPDATE_PAYMENT_STATUS',
        target: payment.id,
        details: `Statut paiement (${payment.userEmail}) passé à ${nextStatus}`,
        ip: getClientIp(req),
        userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
      });
    }
    res.json({ success: true, payment, analytics: computeDashboardAnalytics() });
  });

  router.post('/billing/coupons', (req: Request, res: Response) => {
    const db = getDb();
    const code = String(req.body?.code || '').trim().toUpperCase();
    const discountPercent = Math.min(90, Math.max(5, Number(req.body?.discountPercent) || 15));
    const maxUses = Math.max(1, Number(req.body?.maxUses) || 50);
    const expiresAt = String(req.body?.expiresAt || '2026-12-31');

    if (!code) {
      res.status(400).json({ error: 'Code coupon requis.' });
      return;
    }

    const coupon = {
      id: `cpn-${Date.now()}`,
      code,
      discountPercent,
      maxUses,
      usedCount: 0,
      expiresAt,
      active: true,
    };
    db.coupons.unshift(coupon);
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'CREATE_COUPON',
      target: coupon.code,
      details: `Coupon -${coupon.discountPercent}% (max ${coupon.maxUses} utilisations)`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.status(201).json({ success: true, coupon });
  });

  router.patch('/billing/coupons/:id', (req: Request, res: Response) => {
    const db = getDb();
    const coupon = db.coupons.find((c) => c.id === req.params.id);
    if (!coupon) {
      res.status(404).json({ error: 'Coupon introuvable.' });
      return;
    }
    coupon.active = !coupon.active;
    saveDb(db);
    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'TOGGLE_COUPON',
      target: coupon.code,
      details: `Statut coupon : ${coupon.active ? 'actif' : 'inactif'}`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });
    res.json({ success: true, coupon });
  });

  // E. Factures globales (signalement fraude)
  router.patch('/invoices/:id/flag', (req: Request, res: Response) => {
    const db = getDb();
    const invoice = db.invoices.find((i) => i.id === req.params.id);
    if (!invoice) {
      res.status(404).json({ error: 'Facture introuvable.' });
      return;
    }
    invoice.flaggedFraud = Boolean(req.body?.flaggedFraud);
    invoice.flagReason = invoice.flaggedFraud
      ? String(req.body?.flagReason || 'Signalée manuellement pour vérification anti-fraude')
      : undefined;
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: invoice.flaggedFraud ? 'FLAG_INVOICE_FRAUD' : 'UNFLAG_INVOICE_FRAUD',
      target: invoice.number,
      details: invoice.flagReason || 'Signalement levé',
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.json({ success: true, invoice });
  });

  // F. CMS (Texte accueil, vidéo, marquee, pages légales, blog/annonces)
  router.put('/cms', (req: Request, res: Response) => {
    const db = getDb();
    const body = req.body || {};
    if (typeof body.heroTitleLine1 === 'string') db.cms.heroTitleLine1 = body.heroTitleLine1;
    if (typeof body.heroTitleLine2 === 'string') db.cms.heroTitleLine2 = body.heroTitleLine2;
    if (typeof body.heroSubtitle === 'string') db.cms.heroSubtitle = body.heroSubtitle;
    if (typeof body.videoUrl === 'string') db.cms.videoUrl = body.videoUrl;
    if (typeof body.marqueeText === 'string') db.cms.marqueeText = body.marqueeText;
    if (body.legalPages && typeof body.legalPages === 'object') {
      db.cms.legalPages = {
        ...db.cms.legalPages,
        ...body.legalPages,
      };
    }
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'UPDATE_CMS_CONTENT',
      target: 'cms',
      details: 'Mise à jour du contenu accueil / marquee / vidéo / mentions légales LPRPDE',
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.json({ success: true, cms: db.cms });
  });

  router.post('/cms/posts', (req: Request, res: Response) => {
    const db = getDb();
    const title = String(req.body?.title || '').trim();
    const category = String(req.body?.category || 'Annonce').trim();
    const status = (req.body?.status || 'published') as 'published' | 'scheduled' | 'draft';
    const excerpt = String(req.body?.excerpt || '').trim();
    const scheduledFor = req.body?.scheduledFor ? String(req.body.scheduledFor) : undefined;

    if (!title) {
      res.status(400).json({ error: 'Titre requis.' });
      return;
    }

    const post = {
      id: `post-${Date.now()}`,
      title,
      category,
      status,
      scheduledFor,
      excerpt,
      updatedAt: new Date().toISOString(),
    };
    db.cms.announcements.unshift(post);
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'CREATE_CMS_POST',
      target: post.title,
      details: `Statut: ${post.status}`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.status(201).json({ success: true, post });
  });

  // G. Communication (newsletter, emails ciblés, push in-app)
  router.post('/communications/email', (req: Request, res: Response) => {
    const db = getDb();
    const subject = String(req.body?.subject || '').trim();
    const body = String(req.body?.body || '').trim();
    const targetType = (req.body?.targetType || 'all') as 'all' | 'region' | 'plan';
    const targetValue = String(req.body?.targetValue || 'ALL');

    if (!subject || !body) {
      res.status(400).json({ error: 'Sujet et contenu requis.' });
      return;
    }

    const recipients = db.users.filter((u) => {
      if (u.status === 'suspendu') return false;
      if (targetType === 'region') return u.region === targetValue;
      if (targetType === 'plan') return u.plan === targetValue;
      return true;
    });

    const campaign = {
      id: `cmp-${Date.now()}`,
      subject,
      targetType,
      targetValue,
      recipientCount: recipients.length,
      body,
      sentAt: new Date().toISOString(),
      sentBy: SUPER_ADMIN_EMAIL,
    };
    db.emailCampaigns.unshift(campaign);
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'SEND_EMAIL_CAMPAIGN',
      target: `${targetType}:${targetValue}`,
      details: `Envoi "${subject}" à ${recipients.length} destinataire(s)`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.status(201).json({ success: true, campaign });
  });

  router.post('/communications/push', (req: Request, res: Response) => {
    const db = getDb();
    const title = String(req.body?.title || '').trim();
    const message = String(req.body?.message || '').trim();
    const targetRegion = (req.body?.targetRegion || 'ALL') as 'ALL' | 'CA' | 'AF' | 'HT';

    if (!title || !message) {
      res.status(400).json({ error: 'Titre et message requis.' });
      return;
    }

    const push = {
      id: `push-${Date.now()}`,
      title,
      message,
      targetRegion,
      createdAt: new Date().toISOString(),
    };
    db.pushNotifications.unshift(push);
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'SEND_PUSH_IN_APP',
      target: targetRegion,
      details: title,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.status(201).json({ success: true, push });
  });

  // H. Support client
  router.patch('/support/tickets/:id', (req: Request, res: Response) => {
    const db = getDb();
    const ticket = db.tickets.find((t) => t.id === req.params.id);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket introuvable.' });
      return;
    }
    if (req.body?.status && ['ouvert', 'en_cours', 'resolu'].includes(req.body.status)) {
      ticket.status = req.body.status;
    }
    if (typeof req.body?.assignedTo === 'string') {
      ticket.assignedTo = req.body.assignedTo;
    }
    ticket.updatedAt = new Date().toISOString();
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'UPDATE_TICKET',
      target: ticket.id,
      details: `Statut=${ticket.status}, Assigné=${ticket.assignedTo}`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.json({ success: true, ticket });
  });

  router.post('/support/tickets/:id/reply', (req: Request, res: Response) => {
    const db = getDb();
    const ticket = db.tickets.find((t) => t.id === req.params.id);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket introuvable.' });
      return;
    }
    const message = String(req.body?.message || '').trim();
    if (!message) {
      res.status(400).json({ error: 'Réponse vide.' });
      return;
    }

    ticket.replies.push({
      id: `rep-${Date.now()}`,
      author: 'Super Admin STARTBILL',
      isAdmin: true,
      message,
      createdAt: new Date().toISOString(),
    });
    if (ticket.status === 'ouvert') {
      ticket.status = 'en_cours';
    }
    ticket.updatedAt = new Date().toISOString();
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'REPLY_TICKET',
      target: ticket.id,
      details: `Réponse envoyée à ${ticket.userEmail}`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.json({ success: true, ticket });
  });

  // I. Sécurité & Logs (alertes + sessions actives)
  router.patch('/logs/alerts/:id', (req: Request, res: Response) => {
    const db = getDb();
    const alert = db.securityAlerts.find((a) => a.id === req.params.id);
    if (!alert) {
      res.status(404).json({ error: 'Alerte introuvable.' });
      return;
    }
    alert.resolved = true;
    saveDb(db);
    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'RESOLVE_SECURITY_ALERT',
      target: alert.id,
      details: alert.title,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });
    res.json({ success: true, alert });
  });

  router.post('/logs/sessions/:sessionId/revoke', (req: AdminRequest, res: Response) => {
    const targetId = req.params.sessionId;
    if (req.adminSession?.id === targetId) {
      res.status(400).json({ error: 'Utilisez le bouton Déconnexion pour fermer votre session active.' });
      return;
    }
    destroySession(targetId);
    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'REVOKE_ADMIN_SESSION',
      target: targetId,
      details: 'Session révoquée manuellement',
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });
    res.json({ success: true, revokedId: targetId });
  });

  // J. Paramètres de la plateforme + backups manuels
  router.put('/settings', (req: Request, res: Response) => {
    const db = getDb();
    const body = req.body || {};

    if (typeof body.siteName === 'string' && body.siteName.trim()) {
      db.settings.siteName = body.siteName.trim();
    }
    if (typeof body.logoUrl === 'string') db.settings.logoUrl = body.logoUrl.trim();
    if (typeof body.faviconUrl === 'string') db.settings.faviconUrl = body.faviconUrl.trim();
    if (typeof body.maintenanceMode === 'boolean') {
      db.settings.maintenanceMode = body.maintenanceMode;
    }
    if (typeof body.maintenanceMessage === 'string') {
      db.settings.maintenanceMessage = body.maintenanceMessage;
    }
    if (body.smtp && typeof body.smtp === 'object') {
      db.settings.smtp = {
        ...db.settings.smtp,
        host: String(body.smtp.host || db.settings.smtp.host),
        port: Number(body.smtp.port) || db.settings.smtp.port,
        fromEmail: String(body.smtp.fromEmail || db.settings.smtp.fromEmail),
        secure: Boolean(body.smtp.secure),
      };
    }

    // Masquage strict : ne jamais enregistrer ni renvoyer une clé API brute en réponse
    if (typeof body.deepseekApiKey === 'string' && body.deepseekApiKey.trim()) {
      db.settings.apiKeys.deepseekConfigured = true;
      db.settings.apiKeys.deepseekMasked = maskSecretKey(body.deepseekApiKey);
    }
    if (typeof body.stripeApiKey === 'string' && body.stripeApiKey.trim()) {
      db.settings.apiKeys.stripeConfigured = true;
      db.settings.apiKeys.stripeMasked = maskSecretKey(body.stripeApiKey);
    }

    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'UPDATE_PLATFORM_SETTINGS',
      target: 'platform_settings',
      details: `Maintenance=${db.settings.maintenanceMode}, Site=${db.settings.siteName}`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.json({ success: true, settings: db.settings });
  });

  router.post('/settings/backup', (req: Request, res: Response) => {
    const db = getDb();
    const snapshotSizeKb = Math.max(12, Math.round(Buffer.byteLength(JSON.stringify(db), 'utf8') / 1024));
    const backup = {
      id: `bkp-${Date.now()}`,
      label: `startbill-backup-${new Date().toISOString().slice(0, 10)}.json`,
      sizeKb: snapshotSizeKb,
      createdAt: new Date().toISOString(),
      createdBy: SUPER_ADMIN_EMAIL,
    };
    db.settings.backups.unshift(backup);
    saveDb(db);

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'MANUAL_BACKUP_CREATED',
      target: backup.label,
      details: `Sauvegarde manuelle (${backup.sizeKb} Ko)`,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.status(201).json({ success: true, backup });
  });

  // K. Analytics export CSV
  router.get('/analytics/export.csv', (req: Request, res: Response) => {
    const analytics = computeDashboardAnalytics();
    const lines = [
      'Metrique,Valeur',
      `Utilisateurs totaux,${analytics.totalUsers}`,
      `Utilisateurs CA,${analytics.usersByRegion.CA}`,
      `Utilisateurs AF,${analytics.usersByRegion.AF}`,
      `Utilisateurs HT,${analytics.usersByRegion.HT}`,
      `Revenus totaux CAD,${analytics.totalRevenueCad}`,
      `MRR CAD,${analytics.mrrCad}`,
      `Conversion Free -> Pro (%),${analytics.conversionFreeToPro}`,
      `Factures (mois),${analytics.invoicesCreated.month}`,
      `Montant moyen facture CAD,${analytics.invoiceStats.avgAmountCad}`,
    ];

    appendAuditLog({
      actorEmail: SUPER_ADMIN_EMAIL,
      action: 'EXPORT_ANALYTICS_CSV',
      target: 'analytics',
      details: 'Export du rapport analytique plateforme',
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 60),
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="startbill-analytics-report.csv"');
    res.send(lines.join('\n'));
  });

  return router;
}
