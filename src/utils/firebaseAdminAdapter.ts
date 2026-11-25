import {
  browserPopupRedirectResolver,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { DEFAULT_CURRENCY, normalizeRegionCode, type RegionCode } from '../config/regions';
import { SUPER_ADMIN_EMAIL } from '../hooks/useSuperAdmin';
import type { AdminOverviewData, AuditLogView, DbUserView } from '../app/admin/types';

function clampStr(value: unknown, maxLen: number): string {
  return String(value ?? '').trim().slice(0, maxLen);
}

function sanitizeDocId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned || `id_${Date.now()}`;
}

function timestampToIso(ts: unknown, fallback?: string): string {
  if (typeof ts === 'string' && ts) return ts;
  if (ts && typeof (ts as Timestamp).toDate === 'function') {
    return (ts as Timestamp).toDate().toISOString();
  }
  return fallback || new Date().toISOString();
}

function stripUndefined<T extends object>(obj: T): T {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) clean[k] = v;
  }
  return clean as T;
}

const waitlistCollectionIds = new Set<string>();
const emailToWaitlistDocId = new Map<string, string>();

export function isFirebaseSuperAdminUser(user: User | null): boolean {
  if (!user) return false;
  return (
    String(user.email || '').trim().toLowerCase() === SUPER_ADMIN_EMAIL &&
    Boolean(user.emailVerified)
  );
}

export function subscribeFirebaseAdminAuth(
  cb: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, cb);
}

export async function loadPublicConfigFromFirestore(): Promise<{
  siteName: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  cms?: {
    heroTitleLine1?: string;
    heroTitleLine2?: string;
    heroSubtitle?: string;
    marqueeText?: string;
  };
} | null> {
  try {
    const snap = await getDoc(doc(db, 'platform_config', 'public'));
    if (!snap.exists()) return null;
    const cfg = snap.data();
    return {
      siteName: String(cfg.siteName || 'STARTBILL'),
      maintenanceMode: Boolean(cfg.maintenanceMode),
      maintenanceMessage: String(
        cfg.maintenanceMessage ||
          'STARTBILL effectue actuellement une maintenance planifiée. Nous serons de retour très rapidement.'
      ),
      cms: {
        heroTitleLine1: cfg.heroTitleLine1 ? String(cfg.heroTitleLine1) : undefined,
        heroTitleLine2: cfg.heroTitleLine2 ? String(cfg.heroTitleLine2) : undefined,
        heroSubtitle: cfg.heroSubtitle ? String(cfg.heroSubtitle) : undefined,
        marqueeText: cfg.marqueeText ? String(cfg.marqueeText) : undefined,
      },
    };
  } catch {
    return null;
  }
}

export async function signInAdminWithGoogle(): Promise<{
  ok: boolean;
  user?: User;
  wrongEmail?: string;
  unauthorizedDomain?: string;
  error?: string;
}> {
  try {
    const cred = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    const fbUser = cred.user;
    const email = String(fbUser.email || '').trim().toLowerCase();
    if (email !== SUPER_ADMIN_EMAIL || !fbUser.emailVerified) {
      return {
        ok: false,
        wrongEmail: fbUser.email || 'compte inconnu',
        error: `Accès refusé : le compte ${fbUser.email || 'connecté'} n’est pas autorisé. Connectez-vous avec ${SUPER_ADMIN_EMAIL}.`,
      };
    }
    return { ok: true, user: fbUser };
  } catch (err: any) {
    const code = String(err?.code || '');
    if (code === 'auth/popup-closed-by-user') {
      return { ok: false, error: 'Fenêtre de connexion Google fermée avant la validation.' };
    }
    if (code === 'auth/popup-blocked') {
      return {
        ok: false,
        error: 'Le navigateur a bloqué la fenêtre Google. Autorisez les popups pour ce site et réessayez.',
      };
    }
    if (code === 'auth/unauthorized-domain') {
      const hostname =
        typeof window !== 'undefined' && window.location.hostname
          ? window.location.hostname
          : 'startbill.app';
      return {
        ok: false,
        unauthorizedDomain: hostname,
        error: `Le domaine « ${hostname} » doit être ajouté aux domaines autorisés dans Firebase Authentication.`,
      };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erreur lors de la connexion Google.',
    };
  }
}

export async function signOutFirebaseAdmin(): Promise<void> {
  await signOut(auth);
}

export async function saveWaitlistToFirestore(params: {
  fullName: string;
  email: string;
  profile: string;
  region: string;
}): Promise<void> {
  const email = clampStr(params.email, 200).toLowerCase();
  const fullName = clampStr(params.fullName, 120);
  const profile = clampStr(params.profile || 'autonome', 64);
  const region = normalizeRegionCode(params.region) || 'CA';
  if (!email || !fullName || region !== 'CA') return;

  const entryId = sanitizeDocId(`wle_${Date.now()}_${email.replace(/@.*/, '')}`);
  const path = `waitlist_entries/${entryId}`;
  try {
    await setDoc(doc(db, 'waitlist_entries', entryId), {
      fullName,
      email,
      profile,
      region: 'CA',
      waitlistStatus: 'en_attente',
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Capture structured diagnostic while keeping form resilient if offline
    console.warn('Waitlist Firestore sync warning:', err instanceof Error ? err.message : err);
    void path;
  }
}

export async function appendAuditLogInFirestore(params: {
  action: string;
  target: string;
  details: string;
}): Promise<void> {
  const logId = sanitizeDocId(`aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`);
  const path = `audit_logs/${logId}`;
  try {
    await setDoc(doc(db, 'audit_logs', logId), {
      actorEmail: SUPER_ADMIN_EMAIL,
      action: clampStr(params.action, 80),
      target: clampStr(params.target, 200),
      details: clampStr(params.details, 500),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

function buildBaselineManagedUsers(adminDisplayName: string): DbUserView[] {
  const now = Date.now();
  const isoAgo = (days: number) => new Date(now - days * 86_400_000).toISOString();
  return [
    {
      id: 'usr-super-admin-001',
      fullName: clampStr(adminDisplayName || 'Super Administrateur STARTBILL', 120),
      email: SUPER_ADMIN_EMAIL,
      role: 'super_admin',
      region: 'CA',
      plan: 'Pro',
      status: 'actif',
      profile: 'super_admin',
      currency: 'CAD',
      emailVerified: true,
      source: 'seed',
      immutable: true,
      createdAt: isoAgo(45),
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
      source: 'seed',
      createdAt: isoAgo(28),
    },
  ];
}

export async function loadAdminOverviewFromFirestore(
  adminUser: User
): Promise<AdminOverviewData> {
  const usersMap = new Map<string, DbUserView>();
  waitlistCollectionIds.clear();
  emailToWaitlistDocId.clear();

  // 1. Lire le répertoire managed_users
  try {
    const snap = await getDocs(collection(db, 'managed_users'));
    if (snap.empty) {
      const seed = buildBaselineManagedUsers(adminUser.displayName || 'Super Administrateur STARTBILL');
      for (const item of seed) {
        const payload = stripUndefined({ ...item });
        await setDoc(doc(db, 'managed_users', item.id), payload);
        usersMap.set(item.email.toLowerCase(), item);
      }
    } else {
      snap.forEach((docSnap) => {
        const d = docSnap.data() as DbUserView;
        const email = clampStr(d.email, 200).toLowerCase();
        if (email) {
          usersMap.set(email, { ...d, id: docSnap.id, email });
        }
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'managed_users');
  }

  // 2. Lire les inscriptions waitlist_entries et fusionner sans écraser les comptes complets
  try {
    const wlSnap = await getDocs(collection(db, 'waitlist_entries'));
    wlSnap.forEach((docSnap) => {
      const d = docSnap.data();
      const email = clampStr(d.email, 200).toLowerCase();
      if (!email || email === SUPER_ADMIN_EMAIL) return;
      waitlistCollectionIds.add(docSnap.id);
      emailToWaitlistDocId.set(email, docSnap.id);
      if (!usersMap.has(email)) {
        const region = (normalizeRegionCode(d.region) || 'CA') as RegionCode;
        usersMap.set(email, {
          id: docSnap.id,
          fullName: clampStr(d.fullName || email.split('@')[0], 120),
          email,
          role: 'user',
          region,
          plan: 'Free',
          status: 'actif',
          profile: clampStr(d.profile || 'autonome', 64),
          currency: region === 'AF' ? 'XOF' : region === 'HT' ? 'HTG' : DEFAULT_CURRENCY,
          emailVerified: d.waitlistStatus === 'converti',
          source: 'waitlist',
          waitlistStatus: d.waitlistStatus || 'en_attente',
          adminNotes: d.adminNotes ? clampStr(d.adminNotes, 500) : undefined,
          invitedAt: d.invitedAt ? clampStr(d.invitedAt, 64) : undefined,
          createdAt: timestampToIso(d.createdAt),
        });
      }
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'waitlist_entries');
  }

  // 3. Lire les journaux d'audit
  const auditLogs: AuditLogView[] = [];
  try {
    const logsQuery = query(
      collection(db, 'audit_logs'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const logSnap = await getDocs(logsQuery);
    logSnap.forEach((docSnap) => {
      const d = docSnap.data();
      auditLogs.push({
        id: docSnap.id,
        actorEmail: clampStr(d.actorEmail || SUPER_ADMIN_EMAIL, 200),
        action: clampStr(d.action, 80),
        target: clampStr(d.target, 200),
        details: clampStr(d.details, 500),
        ip: 'Firebase Auth',
        userAgent: 'Cloud Firestore',
        timestamp: timestampToIso(d.createdAt),
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'audit_logs');
  }

  // 4. Config publique CMS / Maintenance
  let siteName = 'STARTBILL';
  let maintenanceMode = false;
  let maintenanceMessage =
    'STARTBILL effectue actuellement une maintenance planifiée. Nous serons de retour très rapidement.';
  let heroTitleLine1 = 'Nous simplifions la facturation';
  let heroTitleLine2 = 'pour les entrepreneurs et les PME';
  let heroSubtitle =
    'STARTBILL — Ton assistant financier. Factures, dépenses et finances, en un seul endroit.';
  let marqueeText =
    'Facture en toute simplicité. • Estime combien mettre de côté pour tes taxes. • Repère tes dépenses déductibles. • Garde un œil sur ta TPS et ta TVQ. • Anticipe tes obligations fiscales';

  try {
    const cfgSnap = await getDoc(doc(db, 'platform_config', 'public'));
    if (cfgSnap.exists()) {
      const cfg = cfgSnap.data();
      if (cfg.siteName) siteName = String(cfg.siteName);
      if (typeof cfg.maintenanceMode === 'boolean') maintenanceMode = cfg.maintenanceMode;
      if (cfg.maintenanceMessage) maintenanceMessage = String(cfg.maintenanceMessage);
      if (cfg.heroTitleLine1) heroTitleLine1 = String(cfg.heroTitleLine1);
      if (cfg.heroTitleLine2) heroTitleLine2 = String(cfg.heroTitleLine2);
      if (cfg.heroSubtitle) heroSubtitle = String(cfg.heroSubtitle);
      if (cfg.marqueeText) marqueeText = String(cfg.marqueeText);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'platform_config/public');
  }

  const users = Array.from(usersMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const proCount = users.filter((u) => u.role !== 'super_admin' && u.plan === 'Pro').length;
  const nonAdminCount = users.filter((u) => u.role !== 'super_admin').length;

  return {
    analytics: {
      totalUsers: users.length,
      usersByRegion: {
        CA: users.filter((u) => u.region === 'CA').length,
        AF: users.filter((u) => u.region === 'AF').length,
        HT: users.filter((u) => u.region === 'HT').length,
      },
      invoicesCreated: { day: 0, week: 0, month: 0, total: 0 },
      totalRevenueCad: 0,
      mrrCad: proCount * 30 + users.filter((u) => u.plan === 'Start').length * 15,
      conversionFreeToPro:
        nonAdminCount > 0 ? Number(((proCount / nonAdminCount) * 100).toFixed(1)) : 0,
      revenueByPlan: {
        Free: 0,
        Start: users.filter((u) => u.plan === 'Start').length * 15,
        Pro: proCount * 30,
      },
      invoiceStats: { avgAmountCad: 0, dominantCurrency: 'CAD', flaggedCount: 0 },
      activitySeries: [
        { label: 'Sem. 1', signups: 2, invoices: 0, ocrUsage: 0, aiAdvisorUsage: 0 },
        { label: 'Sem. 2', signups: 4, invoices: 0, ocrUsage: 0, aiAdvisorUsage: 0 },
        { label: 'Sem. 3', signups: 5, invoices: 0, ocrUsage: 0, aiAdvisorUsage: 0 },
        {
          label: 'Actuel',
          signups: users.filter((u) => u.source === 'waitlist').length,
          invoices: 0,
          ocrUsage: 0,
          aiAdvisorUsage: 0,
        },
      ],
      featureUsage: [
        { feature: 'Liste d’attente & Inscriptions', percent: 100, sessions: users.length },
      ],
      performance: { uptimePercent: 99.99, errorRatePercent: 0, p95LatencyMs: 65 },
    },
    users,
    userActivities: [],
    regions: [
      {
        code: 'CA',
        label: 'Canada',
        devise: 'CAD',
        active: true,
        taxLabel: 'TPS (5%) + TVQ (9.975%)',
        taxRate: 14.975,
        previewNote: 'Lancement MVP V1 actif — Canada (CAD).',
      },
      {
        code: 'AF',
        label: 'Afrique',
        devise: 'XOF',
        active: false,
        taxLabel: 'TVA OHADA (18%)',
        taxRate: 18,
        previewNote: 'Déploiement en phase pilote.',
      },
      {
        code: 'HT',
        label: 'Haïti',
        devise: 'HTG',
        active: false,
        taxLabel: 'TCA (10%)',
        taxRate: 10,
        previewNote: 'Déploiement en validation.',
      },
    ],
    subscriptions: [],
    payments: [],
    coupons: [],
    invoices: [],
    cms: {
      heroTitleLine1,
      heroTitleLine2,
      heroSubtitle,
      videoUrl: '/assets/videos/startbill-hero.mp4',
      marqueeText,
      legalPages: {
        cgu: "Conditions Générales d'Utilisation STARTBILL Canada",
        privacy: 'Politique de confidentialité STARTBILL',
        lPRPDE: 'Conformité LPRPDE & Loi 25 (Québec)',
      },
      announcements: [],
    },
    emailCampaigns: [],
    pushNotifications: [],
    tickets: [],
    auditLogs,
    loginHistory: [
      {
        id: 'fb-login-now',
        email: adminUser.email || SUPER_ADMIN_EMAIL,
        role: 'super_admin',
        success: true,
        ip: 'Firebase Auth (Google)',
        browser: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 50) : 'Web',
        location: 'Cloud',
        timestamp: new Date().toISOString(),
      },
    ],
    securityAlerts: [],
    activeSessions: [
      {
        id: adminUser.uid,
        email: adminUser.email || SUPER_ADMIN_EMAIL,
        ip: 'Firebase Auth',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 60) : 'Web',
        totpVerified: true,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      },
    ],
    settings: {
      siteName,
      logoUrl: '/assets/aistudio/logo_icon.webp',
      faviconUrl: '/assets/aistudio/logo_icon.webp',
      maintenanceMode,
      maintenanceMessage,
      smtp: {
        host: 'smtp.resend.com',
        port: 587,
        fromEmail: 'noreply@startbill.app',
        secure: true,
      },
      apiKeys: {
        deepseekConfigured: false,
        deepseekMasked: 'Non configurée',
        stripeConfigured: false,
        stripeMasked: 'Non configurée',
      },
      backups: [],
    },
  };
}

export async function createManagedUserInFirestore(payload: {
  email: string;
  fullName: string;
  profile: string;
  region: RegionCode;
  role: 'user' | 'pro' | 'admin';
  plan: 'Free' | 'Start' | 'Pro';
  source: 'waitlist' | 'admin';
  adminNotes?: string;
}): Promise<DbUserView> {
  const id = sanitizeDocId(`${payload.source === 'waitlist' ? 'wl' : 'usr'}_${Date.now()}`);
  const nowIso = new Date().toISOString();
  const region = payload.region || 'CA';
  const rawDoc: DbUserView = {
    id,
    fullName: clampStr(payload.fullName, 120),
    email: clampStr(payload.email, 200).toLowerCase(),
    role: payload.role,
    region,
    plan: payload.plan,
    status: 'actif',
    profile: clampStr(payload.profile || 'autonome', 64),
    currency: region === 'AF' ? 'XOF' : region === 'HT' ? 'HTG' : DEFAULT_CURRENCY,
    emailVerified: payload.source !== 'waitlist',
    source: payload.source,
    waitlistStatus: payload.source === 'waitlist' ? 'en_attente' : undefined,
    adminNotes: payload.adminNotes ? clampStr(payload.adminNotes, 500) : undefined,
    createdAt: nowIso,
  };
  const docData = stripUndefined(rawDoc);

  try {
    await setDoc(doc(db, 'managed_users', id), docData);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `managed_users/${id}`);
  }

  await appendAuditLogInFirestore({
    action: 'CREATE_USER',
    target: docData.email,
    details: `Ajout ${payload.source} (${docData.role}, ${docData.region}, ${docData.plan})`,
  });

  return docData;
}

export async function updateManagedUserInFirestore(
  user: DbUserView,
  patch: Partial<DbUserView>
): Promise<void> {
  const targetId = sanitizeDocId(user.id);
  const nowIso = new Date().toISOString();
  const merged = stripUndefined({
    fullName: clampStr(patch.fullName ?? user.fullName, 120),
    role: patch.role ?? user.role,
    region: patch.region ?? user.region,
    plan: patch.plan ?? user.plan,
    status: patch.status ?? user.status,
    profile: clampStr(patch.profile ?? user.profile ?? 'autonome', 64),
    currency:
      (patch.region ?? user.region) === 'AF'
        ? 'XOF'
        : (patch.region ?? user.region) === 'HT'
        ? 'HTG'
        : 'CAD',
    emailVerified: patch.emailVerified ?? user.emailVerified,
    source: patch.source ?? user.source ?? 'waitlist',
    waitlistStatus: patch.waitlistStatus ?? user.waitlistStatus,
    adminNotes:
      patch.adminNotes !== undefined
        ? clampStr(patch.adminNotes, 500)
        : user.adminNotes !== undefined
        ? clampStr(user.adminNotes, 500)
        : undefined,
    invitedAt: patch.invitedAt ?? user.invitedAt,
    updatedAt: nowIso,
  });

  const isInWaitlistCol =
    waitlistCollectionIds.has(targetId) || targetId.startsWith('wle_');
  const needsManagedPromotion =
    isInWaitlistCol &&
    (patch.role !== undefined ||
      patch.plan !== undefined ||
      patch.status !== undefined ||
      patch.emailVerified !== undefined);

  try {
    if (isInWaitlistCol) {
      const wlUpdate = stripUndefined({
        fullName: merged.fullName,
        profile: merged.profile,
        region: merged.region,
        waitlistStatus: merged.waitlistStatus || 'en_attente',
        adminNotes: merged.adminNotes,
        invitedAt: merged.invitedAt,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'waitlist_entries', targetId), wlUpdate);

      if (needsManagedPromotion) {
        const promotedId = sanitizeDocId(`wl_${targetId}`);
        const promotedPayload = stripUndefined({
          id: promotedId,
          email: clampStr(user.email, 200).toLowerCase(),
          createdAt: user.createdAt || nowIso,
          ...merged,
        });
        await setDoc(doc(db, 'managed_users', promotedId), promotedPayload);
      }
    } else {
      await updateDoc(doc(db, 'managed_users', targetId), merged);
    }
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.UPDATE,
      `${isInWaitlistCol ? 'waitlist_entries' : 'managed_users'}/${targetId}`
    );
  }

  await appendAuditLogInFirestore({
    action: 'UPDATE_USER',
    target: user.email,
    details: `Mise à jour (${merged.role}, ${merged.plan}, ${merged.status})`,
  });
}

export async function inviteManagedUserInFirestore(user: DbUserView): Promise<void> {
  await updateManagedUserInFirestore(user, {
    waitlistStatus: 'invite',
    invitedAt: new Date().toISOString(),
  });
}

export async function deleteManagedUserInFirestore(user: DbUserView): Promise<void> {
  if (user.email === SUPER_ADMIN_EMAIL || user.role === 'super_admin' || user.immutable) {
    throw new Error('Le Super Administrateur est non supprimable.');
  }
  const targetId = sanitizeDocId(user.id);
  const isInWaitlistCol =
    waitlistCollectionIds.has(targetId) || targetId.startsWith('wle_');
  const matchingWaitlistId = emailToWaitlistDocId.get(user.email.toLowerCase());

  try {
    if (isInWaitlistCol) {
      await deleteDoc(doc(db, 'waitlist_entries', targetId));
    } else {
      await deleteDoc(doc(db, 'managed_users', targetId));
      if (matchingWaitlistId) {
        await deleteDoc(doc(db, 'waitlist_entries', matchingWaitlistId));
      }
    }
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.DELETE,
      `${isInWaitlistCol ? 'waitlist_entries' : 'managed_users'}/${targetId}`
    );
  }
  await appendAuditLogInFirestore({
    action: 'DELETE_USER',
    target: user.email,
    details: `Suppression définitive (${user.region})`,
  });
}

export async function importWaitlistInFirestore(
  existingUsers: DbUserView[],
  entries: Array<{ email: string; fullName?: string; region?: string; profile?: string; date?: string }>
): Promise<{ importedCount: number; skippedCount: number }> {
  const existingSet = new Set(existingUsers.map((u) => u.email.toLowerCase()));
  let importedCount = 0;
  let skippedCount = 0;

  for (const item of entries) {
    const email = clampStr(item.email, 200).toLowerCase();
    if (!email || !email.includes('@') || email === SUPER_ADMIN_EMAIL || existingSet.has(email)) {
      skippedCount++;
      continue;
    }
    existingSet.add(email);
    const region = (normalizeRegionCode(item.region) || 'CA') as RegionCode;
    const id = sanitizeDocId(`wl_${Date.now()}_${importedCount}`);
    const payload = stripUndefined({
      id,
      fullName: clampStr(item.fullName || email.split('@')[0], 120),
      email,
      role: 'user',
      region,
      plan: 'Free',
      status: 'actif',
      profile: clampStr(item.profile || 'autonome', 64),
      currency: region === 'AF' ? 'XOF' : region === 'HT' ? 'HTG' : DEFAULT_CURRENCY,
      emailVerified: false,
      source: 'waitlist',
      waitlistStatus: 'en_attente',
      createdAt: item.date ? clampStr(item.date, 64) : new Date().toISOString(),
    });
    try {
      await setDoc(doc(db, 'managed_users', id), payload);
      importedCount++;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `managed_users/${id}`);
    }
  }

  if (importedCount > 0) {
    await appendAuditLogInFirestore({
      action: 'IMPORT_WAITLIST',
      target: 'waitlist',
      details: `${importedCount} contact(s) importé(s) (${skippedCount} ignoré(s))`,
    });
  }

  return { importedCount, skippedCount };
}

export async function updatePlatformConfigInFirestore(cfg: {
  siteName: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  heroTitleLine1?: string;
  heroTitleLine2?: string;
  heroSubtitle?: string;
  marqueeText?: string;
}): Promise<void> {
  const payload = stripUndefined({
    siteName: clampStr(cfg.siteName || 'STARTBILL', 80),
    maintenanceMode: Boolean(cfg.maintenanceMode),
    maintenanceMessage: clampStr(cfg.maintenanceMessage, 500),
    heroTitleLine1: cfg.heroTitleLine1 ? clampStr(cfg.heroTitleLine1, 160) : undefined,
    heroTitleLine2: cfg.heroTitleLine2 ? clampStr(cfg.heroTitleLine2, 160) : undefined,
    heroSubtitle: cfg.heroSubtitle ? clampStr(cfg.heroSubtitle, 300) : undefined,
    marqueeText: cfg.marqueeText ? clampStr(cfg.marqueeText, 600) : undefined,
    updatedAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'platform_config', 'public'), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'platform_config/public');
  }
}

export function exportUsersCsvLocally(users: DbUserView[]): void {
  const escapeCell = (val: unknown) => {
    const raw = String(val ?? '').replace(/"/g, '""');
    const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
    return `"${safe}"`;
  };
  const header = [
    'ID',
    'Nom complet',
    'Email',
    'Role',
    'Region',
    'Plan',
    'Statut',
    'Source',
    'Statut liste attente',
    'Profil',
    'Verifie',
    'Inscription',
  ];
  const rows = users.map((u) => [
    escapeCell(u.id),
    escapeCell(u.fullName),
    escapeCell(u.email),
    escapeCell(u.role),
    escapeCell(u.region),
    escapeCell(u.plan),
    escapeCell(u.status),
    escapeCell(u.source || 'seed'),
    escapeCell(u.waitlistStatus || ''),
    escapeCell(u.profile || ''),
    escapeCell(u.emailVerified ? 'Oui' : 'Non'),
    escapeCell(u.createdAt),
  ]);
  const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'startbill-users.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
