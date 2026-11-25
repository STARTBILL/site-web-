import {
  DEFAULT_CURRENCY,
  DEFAULT_REGION,
  isRegionActive,
  normalizeRegionCode,
  validateRegion,
  type RegionCode,
} from '../config/regions';
import type { AuthUser } from '../components/RegionBlockedScreen';
import { saveWaitlistToFirestore } from './firebaseAdminAdapter';

const LOCAL_ACCOUNTS_KEY = 'startbill_local_accounts_v1';
const LOCAL_WAITLIST_KEY = 'startbill_waitlist';
const SUPER_ADMIN_EMAIL = 'contact.startbill@gmail.com';

const DEMO_ACCOUNTS: Record<string, AuthUser> = {
  'demo@startbill.ca': {
    id: 'usr-ca-001',
    fullName: 'Sophie Tremblay',
    email: 'demo@startbill.ca',
    role: 'pro',
    region: 'CA',
    profile: 'pme',
    currency: 'CAD',
    regionActive: true,
  },
  'test-af@startbill.ca': {
    id: 'usr-af-001',
    fullName: 'Awa Diallo (Test AF)',
    email: 'test-af@startbill.ca',
    role: 'user',
    region: 'AF',
    profile: 'commercant',
    currency: 'XOF',
    regionActive: false,
  },
  'test-ht@startbill.ca': {
    id: 'usr-ht-001',
    fullName: 'Jean-Baptiste Pierre (Test HT)',
    email: 'test-ht@startbill.ca',
    role: 'user',
    region: 'HT',
    profile: 'autonome',
    currency: 'HTG',
    regionActive: false,
  },
};

interface StoredLocalAccount extends AuthUser {
  passwordHash: string;
  createdAt: string;
}

export interface AuthActionResult {
  ok: boolean;
  user?: AuthUser;
  error?: string;
  requiresAdminAuth?: boolean;
  blocked?: boolean;
}

export interface WaitlistActionResult {
  ok: boolean;
  error?: string;
}

async function hashPasswordClient(rawPassword: string, email: string): Promise<string> {
  const input = `${email.trim().toLowerCase()}::${rawPassword}`;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(input);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return input;
}

function readLocalAccounts(): StoredLocalAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalAccounts(accounts: StoredLocalAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore storage quota errors
  }
}

async function parseJsonResponse(res: Response): Promise<{ isJson: boolean; data: any }> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return { isJson: false, data: null };
  }
  try {
    const data = await res.json();
    return { isJson: true, data };
  } catch {
    return { isJson: false, data: null };
  }
}

export async function submitUserLogin(params: {
  email: string;
  password?: string;
  isDemoQuickLogin?: boolean;
}): Promise<AuthActionResult> {
  const cleanEmail = params.email.trim().toLowerCase();
  const password = params.password || '';

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { ok: false, error: 'Veuillez saisir une adresse courriel valide.' };
  }

  if (cleanEmail === SUPER_ADMIN_EMAIL) {
    return { ok: false, requiresAdminAuth: true };
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        demoQuickLogin: Boolean(params.isDemoQuickLogin),
      }),
    });

    const { isJson, data } = await parseJsonResponse(res);
    if (isJson && data) {
      if (data.requiresAdminAuth) {
        return { ok: false, requiresAdminAuth: true, error: data.error };
      }
      if (!res.ok || !data.user) {
        return {
          ok: false,
          error: data.error || 'Adresse courriel ou mot de passe incorrect.',
        };
      }
      return {
        ok: true,
        user: data.user,
        blocked: Boolean(data.blocked),
      };
    }
    // Si réponse non-JSON (ex: hébergement statique Hostinger 404/HTML), bascule en fallback local
  } catch {
    // Fallback vers stockage local si API hors-ligne / hébergement statique
  }

  // Fallback local pour hébergement statique (conserve les mêmes règles métier)
  const demoUser = DEMO_ACCOUNTS[cleanEmail];
  if (demoUser) {
    return {
      ok: true,
      user: demoUser,
      blocked: !isRegionActive(demoUser.region),
    };
  }

  if (!password) {
    return { ok: false, error: 'Veuillez saisir votre mot de passe.' };
  }

  const localAccounts = readLocalAccounts();
  const found = localAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (!found) {
    return {
      ok: false,
      error: "Aucun compte trouvé avec cette adresse courriel. Créez un compte via l'onglet Inscription.",
    };
  }

  const hashedInput = await hashPasswordClient(password, cleanEmail);
  if (hashedInput !== found.passwordHash) {
    return { ok: false, error: 'Adresse courriel ou mot de passe incorrect.' };
  }

  const { passwordHash: _ph, createdAt: _ca, ...safeUser } = found;
  return {
    ok: true,
    user: safeUser,
    blocked: !isRegionActive(safeUser.region),
  };
}

export async function submitUserSignup(params: {
  fullName: string;
  email: string;
  password: string;
  profile: string;
  region: RegionCode | string;
}): Promise<AuthActionResult> {
  const fullName = params.fullName.trim();
  const cleanEmail = params.email.trim().toLowerCase();
  const password = params.password || '';
  const profile = params.profile || 'autonome';
  const normalizedRegion = normalizeRegionCode(params.region);

  if (!fullName) {
    return { ok: false, error: 'Veuillez indiquer votre nom complet ou entreprise.' };
  }
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Veuillez renseigner une adresse courriel valide.' };
  }
  if (password.length < 8) {
    return {
      ok: false,
      error: 'Le mot de passe doit contenir au moins 8 caractères.',
    };
  }
  if (cleanEmail === SUPER_ADMIN_EMAIL) {
    return {
      ok: false,
      error: 'Cet email est réservé au Super Administrateur de la plateforme.',
    };
  }
  if (!validateRegion(params.region)) {
    return {
      ok: false,
      error: "StartBill n'est pas encore disponible dans votre région.",
    };
  }

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        email: cleanEmail,
        password,
        profile,
        region: normalizedRegion || DEFAULT_REGION,
      }),
    });

    const { isJson, data } = await parseJsonResponse(res);
    if (isJson && data) {
      if (!res.ok || !data.user) {
        return {
          ok: false,
          error: data.error || "Impossible de créer le compte.",
        };
      }
      return { ok: true, user: data.user };
    }
    // Si réponse non-JSON (ex: hébergement statique Hostinger), bascule en fallback local
  } catch {
    // Fallback local
  }

  if (DEMO_ACCOUNTS[cleanEmail]) {
    return {
      ok: false,
      error: 'Un compte existe déjà avec cette adresse courriel. Veuillez vous connecter.',
    };
  }

  const localAccounts = readLocalAccounts();
  if (localAccounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
    return {
      ok: false,
      error: 'Un compte existe déjà avec cette adresse courriel. Veuillez vous connecter.',
    };
  }

  const passwordHash = await hashPasswordClient(password, cleanEmail);
  const newAccount: StoredLocalAccount = {
    id: `usr-${Date.now()}`,
    fullName,
    email: cleanEmail,
    role: 'user',
    region: normalizedRegion || DEFAULT_REGION,
    profile,
    currency: DEFAULT_CURRENCY,
    regionActive: true,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  localAccounts.push(newAccount);
  writeLocalAccounts(localAccounts);

  const { passwordHash: _ph, createdAt: _ca, ...safeUser } = newAccount;
  return { ok: true, user: safeUser };
}

export async function submitWaitlistEntry(params: {
  fullName: string;
  email: string;
  profile: string;
  region: string;
}): Promise<WaitlistActionResult> {
  const fullName = params.fullName.trim();
  const cleanEmail = params.email.trim().toLowerCase();

  if (!validateRegion(params.region)) {
    return {
      ok: false,
      error: "StartBill n'est pas encore disponible dans votre région.",
    };
  }

  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        email: cleanEmail,
        profile: params.profile,
        region: params.region,
      }),
    });

    const { isJson, data } = await parseJsonResponse(res);
    if (isJson && data) {
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || "StartBill n'est pas encore disponible dans votre région.",
        };
      }
    }
  } catch {
    // Fallback local si hébergement statique sans Node backend
  }

  await saveWaitlistToFirestore({
    fullName,
    email: cleanEmail,
    profile: params.profile,
    region: params.region,
  });

  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_WAITLIST_KEY) || '[]');
    existing.push({
      fullName,
      email: cleanEmail,
      profile: params.profile,
      region: params.region,
      date: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_WAITLIST_KEY, JSON.stringify(existing));
  } catch {
    // Ignore storage errors
  }

  return { ok: true };
}
