import QRCode from 'qrcode';
import { SUPER_ADMIN_EMAIL } from '../hooks/useSuperAdmin';
import type { AdminOverviewData, DbUserView, RegionSettingView } from '../app/admin/types';

const ADMIN_TOKEN_KEY = 'sb_admin_token_v1';
const STATIC_ADMIN_DB_KEY = 'sb_static_admin_db_v1';
const STATIC_ADMIN_AUTH_KEY = 'sb_static_admin_auth_v1';
const STATIC_ADMIN_SESSION_KEY = 'sb_static_admin_session_v1';

// Empreinte SHA-256 unidirectionnelle (aucun mot de passe en clair dans le code client)
const INITIAL_ADMIN_SHA256 =
  'ed4f41889b8965be74be0a6992820ebcca9962b6094d74ccf31df5d5d508ef7f';

interface StaticAdminAuthState {
  passwordDigest: string;
  mustChangePassword: boolean;
  totpEnabled: boolean;
  totpSecret: string | null;
}

interface StaticAdminSession {
  id: string;
  email: string;
  role: string;
  csrfToken: string;
  totpVerified: boolean;
  pendingTotpSecret: string | null;
  lastActivityAt: number;
}

export function getStoredAdminToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function parseJsonSafe(res: Response): Promise<{ isJson: boolean; data: any }> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.toLowerCase().includes('application/json')) {
    return { isJson: false, data: null };
  }
  try {
    const data = await res.json();
    return { isJson: true, data };
  } catch {
    return { isJson: false, data: null };
  }
}

function randomHex(byteCount = 16): string {
  const arr = new Uint8Array(byteCount);
  window.crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret(byteLen = 20): string {
  const bytes = new Uint8Array(byteLen);
  window.crypto.getRandomValues(bytes);
  let bits = 0;
  let value = 0;
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += BASE32[(value << (5 - bits)) & 31];
  }
  return out;
}

function decodeBase32Bytes(secret: string): Uint8Array {
  const cleaned = secret.replace(/=+$/g, '').replace(/\s+/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

async function verifyTotpBrowser(secret: string, token: string): Promise<boolean> {
  const clean = String(token || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(clean)) return false;

  const keyBytes = decodeBase32Bytes(secret);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const now = Date.now();
  for (let offsetStep = -1; offsetStep <= 1; offsetStep++) {
    const counter = Math.floor((now + offsetStep * 30_000) / 1000 / 30);
    const counterBuf = new ArrayBuffer(8);
    const view = new DataView(counterBuf);
    view.setUint32(0, Math.floor(counter / 0x100000000), false);
    view.setUint32(4, counter >>> 0, false);

    const sig = new Uint8Array(await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuf));
    const offset = sig[sig.length - 1] & 0x0f;
    const binary =
      ((sig[offset] & 0x7f) << 24) |
      ((sig[offset + 1] & 0xff) << 16) |
      ((sig[offset + 2] & 0xff) << 8) |
      (sig[offset + 3] & 0xff);
    const candidate = (binary % 1_000_000).toString().padStart(6, '0');
    if (candidate === clean) return true;
  }
  return false;
}

function getStaticAuthState(): StaticAdminAuthState {
  try {
    const raw = localStorage.getItem(STATIC_ADMIN_AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback default
  }
  return {
    passwordDigest: INITIAL_ADMIN_SHA256,
    mustChangePassword: true,
    totpEnabled: false,
    totpSecret: null,
  };
}

function saveStaticAuthState(state: StaticAdminAuthState) {
  try {
    localStorage.setItem(STATIC_ADMIN_AUTH_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota error
  }
}

function getStaticSession(): StaticAdminSession | null {
  try {
    const raw = sessionStorage.getItem(STATIC_ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StaticAdminSession;
    if (Date.now() - parsed.lastActivityAt > 30 * 60 * 1000) {
      sessionStorage.removeItem(STATIC_ADMIN_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveStaticSession(session: StaticAdminSession | null) {
  try {
    if (!session) {
      sessionStorage.removeItem(STATIC_ADMIN_SESSION_KEY);
    } else {
      sessionStorage.setItem(STATIC_ADMIN_SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore
  }
}

function buildStaticOverviewSeed(): AdminOverviewData {
  const iso = (daysAgo: number) =>
    new Date(Date.now() - daysAgo * 86_400_000).toISOString();

  const users: DbUserView[] = [
    {
      id: 'usr-super-admin-001',
      fullName: 'Super Administrateur STARTBILL',
      email: SUPER_ADMIN_EMAIL,
      role: 'super_admin',
      region: 'CA',
      plan: 'Pro',
      status: 'actif',
      profile: 'super_admin',
      currency: 'CAD',
      emailVerified: true,
      immutable: true,
      totpEnabled: getStaticAuthState().totpEnabled,
      createdAt: iso(45),
      lastLoginAt: new Date().toISOString(),
    },
    {
      id: 'usr-ca-001',
      fullName: 'Sophie Tremblay',
      email: 'demo@startbill.ca',
      role: 'pro',
      region: 'CA',
      plan: 'Pro',
      status: 'actif',
      profile: 'pme',
      currency: 'CAD',
      emailVerified: true,
      createdAt: iso(28),
      lastLoginAt: iso(1),
    },
    {
      id: 'usr-ca-002',
      fullName: 'Marc-Antoine Bouchard',
      email: 'mbouchard@ateliernord.ca',
      role: 'user',
      region: 'CA',
      plan: 'Start',
      status: 'actif',
      profile: 'autonome',
      currency: 'CAD',
      emailVerified: true,
      createdAt: iso(22),
      lastLoginAt: iso(2),
    },
    {
      id: 'usr-ca-003',
      fullName: 'Nadia Benali',
      email: 'nadia@montrealstudio.ca',
      role: 'pro',
      region: 'CA',
      plan: 'Pro',
      status: 'actif',
      profile: 'pme',
      currency: 'CAD',
      emailVerified: true,
      createdAt: iso(19),
      lastLoginAt: iso(1),
    },
    {
      id: 'usr-af-001',
      fullName: 'Awa Diallo (Test AF)',
      email: 'test-af@startbill.ca',
      role: 'user',
      region: 'AF',
      plan: 'Free',
      status: 'actif',
      profile: 'commercant',
      currency: 'XOF',
      emailVerified: true,
      createdAt: iso(15),
    },
    {
      id: 'usr-ht-001',
      fullName: 'Jean-Baptiste Pierre (Test HT)',
      email: 'test-ht@startbill.ca',
      role: 'user',
      region: 'HT',
      plan: 'Free',
      status: 'actif',
      profile: 'autonome',
      currency: 'HTG',
      emailVerified: true,
      createdAt: iso(12),
    },
  ];

  const regions: RegionSettingView[] = [
    {
      code: 'CA',
      label: 'Canada',
      devise: 'CAD',
      active: true,
      taxLabel: 'TPS/TVQ (5% + 9.975%)',
      taxRate: 14.975,
      previewNote: 'Région principale MVP Canada ouverte en production.',
    },
    {
      code: 'AF',
      label: 'Afrique francophone',
      devise: 'XOF',
      active: false,
      taxLabel: 'TVA (18%)',
      taxRate: 18,
      previewNote: 'Ouverture planifiée V2 — Mobile Money & OHADA.',
    },
    {
      code: 'HT',
      label: 'Haïti',
      devise: 'HTG',
      active: false,
      taxLabel: 'TCA (10%)',
      taxRate: 10,
      previewNote: 'Ouverture planifiée V2 — MonCash / NatCash.',
    },
  ];

  return {
    users,
    userActivities: [
      {
        id: 'act-1',
        userId: 'usr-ca-001',
        action: 'FACTURE_CRÉÉE',
        details: 'Facture #INV-CA-2026-014 générée (1 450,00 CAD)',
        timestamp: iso(1),
      },
    ],
    regions,
    subscriptions: [
      {
        id: 'sub-001',
        userId: 'usr-ca-001',
        userName: 'Sophie Tremblay',
        userEmail: 'demo@startbill.ca',
        region: 'CA',
        plan: 'Pro',
        amount: 30,
        currency: 'CAD',
        interval: 'monthly',
        status: 'active',
        nextBillingDate: iso(-12),
      },
      {
        id: 'sub-002',
        userId: 'usr-ca-002',
        userName: 'Marc-Antoine Bouchard',
        userEmail: 'mbouchard@ateliernord.ca',
        region: 'CA',
        plan: 'Start',
        amount: 15,
        currency: 'CAD',
        interval: 'monthly',
        status: 'active',
        nextBillingDate: iso(-8),
      },
    ],
    payments: [
      {
        id: 'pay-901',
        userEmail: 'demo@startbill.ca',
        region: 'CA',
        plan: 'Pro',
        amount: 30,
        currency: 'CAD',
        provider: 'Stripe',
        status: 'succeeded',
        createdAt: iso(1),
      },
      {
        id: 'pay-902',
        userEmail: 'mbouchard@ateliernord.ca',
        region: 'CA',
        plan: 'Start',
        amount: 15,
        currency: 'CAD',
        provider: 'Interac',
        status: 'succeeded',
        createdAt: iso(4),
      },
    ],
    coupons: [
      {
        id: 'cpn-1',
        code: 'CANADA2026',
        discountPercent: 25,
        maxUses: 100,
        usedCount: 14,
        expiresAt: iso(-60),
        active: true,
      },
    ],
    invoices: [
      {
        id: 'inv-1',
        number: 'INV-CA-2026-014',
        userId: 'usr-ca-001',
        userEmail: 'demo@startbill.ca',
        clientName: 'Groupe Boréal Montréal',
        region: 'CA',
        amount: 1450,
        currency: 'CAD',
        status: 'paid',
        flaggedFraud: false,
        createdAt: iso(1),
      },
      {
        id: 'inv-2',
        number: 'INV-CA-2026-015',
        userId: 'usr-ca-002',
        userEmail: 'mbouchard@ateliernord.ca',
        clientName: 'Studio Québec Inc.',
        region: 'CA',
        amount: 680,
        currency: 'CAD',
        status: 'pending',
        flaggedFraud: false,
        createdAt: iso(0),
      },
    ],
    cms: {
      heroTitleLine1: 'Nous simplifions la facturation',
      heroTitleLine2: 'pour les entrepreneurs et les PME',
      heroSubtitle:
        'STARTBILL — Ton assistant financier. Factures, dépenses et finances, en un seul endroit.',
      videoUrl: '/assets/videos/startbill_presentation.mp4',
      marqueeText:
        'Nous simplifions la facturation pour les entrepreneurs et les PME. • Suis tes revenus et dépenses en temps réel. • Prépare ta saison des impôts sans stress. • Entreprends sereinement au Canada.',
      legalPages: {
        cgu: "Conditions Générales d'Utilisation STARTBILL Canada (CAD).",
        privacy: 'Politique de confidentialité et protection des données.',
        lPRPDE: 'Conformité LPRPDE (Loi sur la protection des renseignements personnels, Canada).',
      },
      announcements: [
        {
          id: 'post-1',
          title: 'Ouverture officielle du pilote STARTBILL Canada',
          category: 'Produit',
          status: 'published',
          excerpt: 'Facturation CAD et gestion TPS/TVQ disponibles pour les PME canadiennes.',
          updatedAt: iso(2),
        },
      ],
    },
    emailCampaigns: [],
    pushNotifications: [],
    tickets: [
      {
        id: 'tkt-1',
        userEmail: 'demo@startbill.ca',
        userName: 'Sophie Tremblay',
        region: 'CA',
        subject: 'Configuration TPS/TVQ sur les devis',
        status: 'ouvert',
        priority: 'normale',
        assignedTo: 'Support CA',
        createdAt: iso(1),
        updatedAt: iso(1),
        replies: [
          {
            id: 'rep-1',
            author: 'Sophie Tremblay',
            isAdmin: false,
            message: 'Bonjour, comment appliquer automatiquement la TVQ sur mes factures ?',
            createdAt: iso(1),
          },
        ],
      },
    ],
    auditLogs: [
      {
        id: 'aud-1',
        actorEmail: SUPER_ADMIN_EMAIL,
        action: 'SYSTEM_INIT',
        target: 'RBAC',
        details: 'Console Super Admin initialisée avec protection 2FA',
        ip: '127.0.0.1',
        userAgent: 'Browser',
        timestamp: iso(1),
      },
    ],
    loginHistory: [
      {
        id: 'log-1',
        email: SUPER_ADMIN_EMAIL,
        role: 'super_admin',
        success: true,
        ip: '127.0.0.1',
        browser: 'Navigateur sécurisé',
        location: 'Canada',
        timestamp: new Date().toISOString(),
      },
    ],
    securityAlerts: [],
    activeSessions: [],
    settings: {
      siteName: 'STARTBILL',
      logoUrl: '/assets/aistudio/logo_icon.webp',
      faviconUrl: '/assets/aistudio/logo_icon.webp',
      maintenanceMode: false,
      maintenanceMessage:
        'STARTBILL effectue actuellement une maintenance planifiée. Nous serons de retour très rapidement.',
      smtp: {
        host: 'smtp.resend.com',
        port: 587,
        fromEmail: 'noreply@startbill.app',
        secure: true,
      },
      apiKeys: {
        deepseekConfigured: false,
        deepseekMasked: 'Non configurée',
        stripeConfigured: true,
        stripeMasked: 'sk_live_••••••••••••••••429A',
      },
      backups: [
        {
          id: 'bkp-001',
          label: 'backup-pre-mvp-canada-2026.json',
          sizeKb: 148,
          createdAt: iso(3),
          createdBy: SUPER_ADMIN_EMAIL,
        },
      ],
    },
    analytics: {
      totalUsers: 6,
      usersByRegion: { CA: 4, AF: 1, HT: 1 },
      invoicesCreated: { day: 4, week: 18, month: 62, total: 124 },
      totalRevenueCad: 1245,
      mrrCad: 45,
      conversionFreeToPro: 33.3,
      revenueByPlan: { Free: 0, Start: 345, Pro: 900 },
      invoiceStats: {
        avgAmountCad: 1065,
        dominantCurrency: 'CAD',
        flaggedCount: 0,
      },
      activitySeries: [
        { label: 'Sem -3', signups: 2, invoices: 11, ocrUsage: 8, aiAdvisorUsage: 5 },
        { label: 'Sem -2', signups: 3, invoices: 16, ocrUsage: 12, aiAdvisorUsage: 7 },
        { label: 'Sem -1', signups: 4, invoices: 21, ocrUsage: 15, aiAdvisorUsage: 9 },
        { label: 'Actuel', signups: 6, invoices: 26, ocrUsage: 19, aiAdvisorUsage: 12 },
      ],
      featureUsage: [
        { feature: 'Facturation PDF', percent: 92, sessions: 142 },
        { feature: 'Calcul TPS/TVQ', percent: 74, sessions: 96 },
        { feature: 'OCR Reçus', percent: 41, sessions: 48 },
        { feature: 'Conseiller IA', percent: 29, sessions: 31 },
      ],
      performance: {
        uptimePercent: 99.98,
        errorRatePercent: 0.12,
        p95LatencyMs: 84,
      },
    },
  };
}

function getStaticDb(): AdminOverviewData {
  try {
    const raw = localStorage.getItem(STATIC_ADMIN_DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Seed fresh
  }
  const seeded = buildStaticOverviewSeed();
  saveStaticDb(seeded);
  return seeded;
}

function saveStaticDb(db: AdminOverviewData) {
  try {
    localStorage.setItem(STATIC_ADMIN_DB_KEY, JSON.stringify(db));
  } catch {
    // Ignore storage errors
  }
}

export async function adminApiRequest(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; data: any }> {
  const token = getStoredAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token && !headers['X-Admin-Session']) {
    headers['X-Admin-Session'] = token;
  }

  try {
    const res = await fetch(path, {
      ...options,
      credentials: 'include',
      headers,
    });
    const { isJson, data } = await parseJsonSafe(res);
    if (isJson && data) {
      if (data.sessionToken) {
        setStoredAdminToken(data.sessionToken);
      }
      return { status: res.status, data };
    }
    // Réponse non-JSON (ex: 404 HTML sur hébergement statique Hostinger) -> bascule fallback static
  } catch {
    // Erreur réseau -> bascule fallback static
  }

  return handleStaticAdminRequest(path, options);
}

async function handleStaticAdminRequest(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; data: any }> {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(String(options.body)) : {};

  if (path === '/api/auth/admin/session' && method === 'GET') {
    const sess = getStaticSession();
    const auth = getStaticAuthState();
    if (!sess) {
      return {
        status: 200,
        data: {
          authenticated: false,
          user: null,
          mustChangePassword: false,
          totpEnabled: false,
          totpVerified: false,
        },
      };
    }
    return {
      status: 200,
      data: {
        authenticated: true,
        user: {
          id: 'usr-super-admin-001',
          fullName: 'Super Administrateur STARTBILL',
          email: SUPER_ADMIN_EMAIL,
          role: 'super_admin',
          region: 'CA',
        },
        mustChangePassword: auth.mustChangePassword,
        totpEnabled: auth.totpEnabled,
        totpVerified: sess.totpVerified,
        csrfToken: sess.csrfToken,
      },
    };
  }

  if (path === '/api/auth/admin/login' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (email !== SUPER_ADMIN_EMAIL) {
      return {
        status: 403,
        data: {
          success: false,
          error: '403 Forbidden : accès strictement réservé au Super Administrateur.',
        },
      };
    }

    const auth = getStaticAuthState();
    const candidateDigest = await sha256Hex(`${SUPER_ADMIN_EMAIL}::${password}`);
    if (candidateDigest !== auth.passwordDigest) {
      return {
        status: 401,
        data: {
          success: false,
          error: 'Identifiants administrateur invalides.',
        },
      };
    }

    const session: StaticAdminSession = {
      id: `sess-${randomHex(8)}`,
      email: SUPER_ADMIN_EMAIL,
      role: 'super_admin',
      csrfToken: randomHex(16),
      totpVerified: false,
      pendingTotpSecret: null,
      lastActivityAt: Date.now(),
    };
    saveStaticSession(session);

    return {
      status: 200,
      data: {
        success: true,
        user: {
          id: 'usr-super-admin-001',
          fullName: 'Super Administrateur STARTBILL',
          email: SUPER_ADMIN_EMAIL,
          role: 'super_admin',
          region: 'CA',
        },
        mustChangePassword: auth.mustChangePassword,
        totpEnabled: auth.totpEnabled,
        totpVerified: false,
        csrfToken: session.csrfToken,
      },
    };
  }

  if (path === '/api/auth/admin/change-password' && method === 'POST') {
    const sess = getStaticSession();
    const auth = getStaticAuthState();
    if (!sess) return { status: 403, data: { error: 'Session Super Admin invalide.' } };

    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');
    const curDigest = await sha256Hex(`${SUPER_ADMIN_EMAIL}::${currentPassword}`);
    if (curDigest !== auth.passwordDigest) {
      return { status: 400, data: { error: 'Le mot de passe actuel est incorrect.' } };
    }
    if (
      newPassword.length < 12 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      return {
        status: 400,
        data: {
          error:
            'Le nouveau mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un symbole.',
        },
      };
    }

    auth.passwordDigest = await sha256Hex(`${SUPER_ADMIN_EMAIL}::${newPassword}`);
    auth.mustChangePassword = false;
    saveStaticAuthState(auth);

    return {
      status: 200,
      data: {
        success: true,
        user: {
          id: 'usr-super-admin-001',
          fullName: 'Super Administrateur STARTBILL',
          email: SUPER_ADMIN_EMAIL,
          role: 'super_admin',
          region: 'CA',
        },
        mustChangePassword: false,
        totpEnabled: auth.totpEnabled,
        totpVerified: sess.totpVerified,
      },
    };
  }

  if (path === '/api/auth/admin/totp/setup' && method === 'POST') {
    const sess = getStaticSession();
    const auth = getStaticAuthState();
    if (!sess) return { status: 403, data: { error: 'Session Super Admin requise.' } };
    if (auth.totpEnabled && auth.totpSecret) {
      return {
        status: 200,
        data: {
          alreadyEnrolled: true,
          message: '2FA déjà activée. Saisissez le code à 6 chiffres depuis Google Authenticator.',
        },
      };
    }
    const secret = sess.pendingTotpSecret || generateBase32Secret();
    sess.pendingTotpSecret = secret;
    saveStaticSession(sess);

    const uri = `otpauth://totp/${encodeURIComponent(`StartBill Canada:${SUPER_ADMIN_EMAIL}`)}?secret=${secret}&issuer=${encodeURIComponent('StartBill Canada')}&algorithm=SHA1&digits=6&period=30`;
    const qrDataUrl = await QRCode.toDataURL(uri, {
      width: 220,
      margin: 2,
      color: { dark: '#0A2540', light: '#FFFFFF' },
    });

    return {
      status: 200,
      data: { alreadyEnrolled: false, secret, qrDataUrl, otpauthUri: uri },
    };
  }

  if (path === '/api/auth/admin/totp/verify' && method === 'POST') {
    const sess = getStaticSession();
    const auth = getStaticAuthState();
    if (!sess) return { status: 403, data: { error: 'Session Super Admin requise.' } };

    const secret = auth.totpEnabled ? auth.totpSecret : sess.pendingTotpSecret;
    if (!secret) {
      return { status: 400, data: { error: 'Aucune clé TOTP initialisée.' } };
    }
    const ok = await verifyTotpBrowser(secret, String(body.code || ''));
    if (!ok) {
      return {
        status: 401,
        data: { error: 'Code TOTP invalide ou expiré. Vérifiez Google Authenticator.' },
      };
    }

    if (!auth.totpEnabled) {
      auth.totpSecret = secret;
      auth.totpEnabled = true;
      saveStaticAuthState(auth);
    }
    sess.pendingTotpSecret = null;
    sess.totpVerified = true;
    sess.lastActivityAt = Date.now();
    saveStaticSession(sess);

    return {
      status: 200,
      data: {
        success: true,
        user: {
          id: 'usr-super-admin-001',
          fullName: 'Super Administrateur STARTBILL',
          email: SUPER_ADMIN_EMAIL,
          role: 'super_admin',
          region: 'CA',
        },
        totpEnabled: true,
        totpVerified: true,
        csrfToken: sess.csrfToken,
      },
    };
  }

  if (path === '/api/auth/admin/logout' && method === 'POST') {
    saveStaticSession(null);
    setStoredAdminToken('');
    return { status: 200, data: { success: true } };
  }

  // Routes protégées /api/admin/* en mode statique
  const sess = getStaticSession();
  const auth = getStaticAuthState();
  if (!sess || auth.mustChangePassword || !sess.totpVerified) {
    return { status: 403, data: { error: '403 Forbidden' } };
  }
  sess.lastActivityAt = Date.now();
  saveStaticSession(sess);

  const db = getStaticDb();

  if (path === '/api/admin/overview' && method === 'GET') {
    db.activeSessions = [
      {
        id: sess.id,
        email: sess.email,
        ip: 'Client Browser',
        userAgent: navigator.userAgent.slice(0, 60),
        totpVerified: sess.totpVerified,
        createdAt: new Date(sess.lastActivityAt).toISOString(),
        lastActivityAt: new Date(sess.lastActivityAt).toISOString(),
      },
    ];
    return { status: 200, data: db };
  }

  if (path.startsWith('/api/admin/users/') && method === 'PATCH') {
    const id = path.split('/').pop();
    const user = db.users.find((u) => u.id === id);
    if (!user) return { status: 404, data: { error: 'Utilisateur introuvable.' } };
    if (user.email === SUPER_ADMIN_EMAIL && body.role && body.role !== 'super_admin') {
      return { status: 403, data: { error: 'Rôle Super Administrateur immuable.' } };
    }
    if (body.role) user.role = body.role;
    if (body.status) user.status = body.status;
    if (body.plan) user.plan = body.plan;
    saveStaticDb(db);
    return { status: 200, data: { success: true, user } };
  }

  if (path.startsWith('/api/admin/users/') && method === 'DELETE') {
    const id = path.split('/').pop();
    const user = db.users.find((u) => u.id === id);
    if (!user) return { status: 404, data: { error: 'Utilisateur introuvable.' } };
    if (user.email === SUPER_ADMIN_EMAIL || user.immutable) {
      return {
        status: 403,
        data: { error: 'Ce compte Super Administrateur est protégé et ne peut pas être supprimé.' },
      };
    }
    db.users = db.users.filter((u) => u.id !== id);
    saveStaticDb(db);
    return { status: 200, data: { success: true } };
  }

  if (path.startsWith('/api/admin/regions/') && method === 'PATCH') {
    const code = path.split('/').pop();
    const reg = db.regions.find((r) => r.code === code);
    if (!reg) return { status: 404, data: { error: 'Région introuvable.' } };
    Object.assign(reg, body);
    saveStaticDb(db);
    return { status: 200, data: { success: true, region: reg } };
  }

  if (path === '/api/admin/cms' && method === 'PUT') {
    Object.assign(db.cms, body);
    saveStaticDb(db);
    return { status: 200, data: { success: true, cms: db.cms } };
  }

  if (path === '/api/admin/settings' && method === 'PUT') {
    Object.assign(db.settings, body);
    saveStaticDb(db);
    return { status: 200, data: { success: true, settings: db.settings } };
  }

  if (path === '/api/admin/settings/backup' && method === 'POST') {
    db.settings.backups.unshift({
      id: `bkp-${Date.now()}`,
      label: `backup-manual-${new Date().toISOString().slice(0, 10)}.json`,
      sizeKb: Math.round(JSON.stringify(db).length / 1024),
      createdAt: new Date().toISOString(),
      createdBy: SUPER_ADMIN_EMAIL,
    });
    saveStaticDb(db);
    return { status: 200, data: { success: true } };
  }

  return { status: 200, data: { success: true } };
}
