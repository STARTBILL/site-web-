import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RegionCode, CurrencyCode } from '../src/config/regions.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
export const DB_FILE_PATH = path.join(DATA_DIR, 'startbill-db.json');

export const SUPER_ADMIN_EMAIL = 'contact.startbill@gmail.com';
// Hash bcrypt (12 rounds) généré par scripts/seedAdmin.js — aucun mot de passe en clair dans le code
const DEFAULT_ADMIN_BCRYPT_HASH =
  '$2b$12$qmEEz6hjfny28Wpj.Qj1bOVCHKKYs.6Izx.Z7YfyoUmZEj.VEVqei';

export type UserRole = 'user' | 'pro' | 'admin' | 'super_admin';
export type UserStatus = 'actif' | 'suspendu';

export interface DbUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  region: RegionCode;
  plan: 'Free' | 'Start' | 'Pro';
  status: UserStatus;
  profile: string;
  currency: CurrencyCode;
  emailVerified: boolean;
  mustChangePassword?: boolean;
  immutable?: boolean;
  totpEnabled?: boolean;
  totpSecret?: string | null;
  passwordHash?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface UserActivityEntry {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface RegionSetting {
  code: RegionCode;
  label: string;
  devise: CurrencyCode;
  active: boolean;
  taxLabel: string;
  taxRate: number;
  previewNote: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  region: RegionCode;
  plan: 'Free' | 'Start' | 'Pro';
  amount: number;
  currency: CurrencyCode;
  interval: 'monthly' | 'annual';
  status: 'active' | 'past_due' | 'canceled';
  nextBillingDate: string;
}

export interface PaymentRecord {
  id: string;
  userEmail: string;
  region: RegionCode;
  plan: 'Start' | 'Pro';
  amount: number;
  currency: CurrencyCode;
  provider: 'Stripe' | 'Mobile Money' | 'Interac';
  status: 'succeeded' | 'refunded' | 'disputed';
  createdAt: string;
}

export interface CouponRecord {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export interface InvoiceRecord {
  id: string;
  number: string;
  userId: string;
  userEmail: string;
  clientName: string;
  region: RegionCode;
  amount: number;
  currency: CurrencyCode;
  status: 'paid' | 'pending' | 'overdue';
  flaggedFraud: boolean;
  flagReason?: string;
  createdAt: string;
}

export interface BlogPostRecord {
  id: string;
  title: string;
  category: string;
  status: 'published' | 'scheduled' | 'draft';
  scheduledFor?: string;
  excerpt: string;
  updatedAt: string;
}

export interface CmsContent {
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  videoUrl: string;
  marqueeText: string;
  legalPages: {
    cgu: string;
    privacy: string;
    lPRPDE: string;
  };
  announcements: BlogPostRecord[];
}

export interface EmailCampaignRecord {
  id: string;
  subject: string;
  targetType: 'all' | 'region' | 'plan';
  targetValue: string;
  recipientCount: number;
  body: string;
  sentAt: string;
  sentBy: string;
}

export interface PushNotificationRecord {
  id: string;
  title: string;
  message: string;
  targetRegion: 'ALL' | RegionCode;
  createdAt: string;
}

export interface TicketReply {
  id: string;
  author: string;
  isAdmin: boolean;
  message: string;
  createdAt: string;
}

export interface SupportTicketRecord {
  id: string;
  userEmail: string;
  userName: string;
  region: RegionCode;
  subject: string;
  status: 'ouvert' | 'en_cours' | 'resolu';
  priority: 'normale' | 'haute';
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
}

export interface AuditLogRecord {
  id: string;
  actorEmail: string;
  action: string;
  target: string;
  details: string;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export interface LoginHistoryRecord {
  id: string;
  email: string;
  role: string;
  success: boolean;
  ip: string;
  browser: string;
  location: string;
  timestamp: string;
}

export interface SecurityAlertRecord {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  sourceIp: string;
  resolved: boolean;
  createdAt: string;
}

export interface PlatformSettings {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  smtp: {
    host: string;
    port: number;
    fromEmail: string;
    secure: boolean;
  };
  apiKeys: {
    deepseekConfigured: boolean;
    deepseekMasked: string;
    stripeConfigured: boolean;
    stripeMasked: string;
  };
  backups: Array<{
    id: string;
    label: string;
    sizeKb: number;
    createdAt: string;
    createdBy: string;
  }>;
}

export interface StartBillDatabase {
  users: DbUser[];
  userActivities: UserActivityEntry[];
  regions: RegionSetting[];
  subscriptions: SubscriptionRecord[];
  payments: PaymentRecord[];
  coupons: CouponRecord[];
  invoices: InvoiceRecord[];
  cms: CmsContent;
  emailCampaigns: EmailCampaignRecord[];
  pushNotifications: PushNotificationRecord[];
  tickets: SupportTicketRecord[];
  auditLogs: AuditLogRecord[];
  loginHistory: LoginHistoryRecord[];
  securityAlerts: SecurityAlertRecord[];
  settings: PlatformSettings;
}

function buildInitialSeed(existingAdmin?: DbUser): StartBillDatabase {
  const now = new Date();
  const iso = (daysAgo: number, hoursOffset = 0) =>
    new Date(now.getTime() - daysAgo * 86_400_000 - hoursOffset * 3_600_000).toISOString();

  const superAdmin: DbUser = existingAdmin
    ? {
        ...existingAdmin,
        role: 'super_admin',
        email: SUPER_ADMIN_EMAIL,
        region: 'CA',
        emailVerified: true,
        immutable: true,
        passwordHash: existingAdmin.passwordHash || DEFAULT_ADMIN_BCRYPT_HASH,
      }
    : {
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
        mustChangePassword: true,
        immutable: true,
        totpEnabled: false,
        totpSecret: null,
        passwordHash: DEFAULT_ADMIN_BCRYPT_HASH,
        createdAt: iso(45),
        updatedAt: iso(45),
      };

  const users: DbUser[] = [
    superAdmin,
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
      lastLoginAt: iso(0, 4),
    },
    {
      id: 'usr-ca-004',
      fullName: 'Éric Pelletier',
      email: 'eric@pelletierconseil.ca',
      role: 'user',
      region: 'CA',
      plan: 'Free',
      status: 'actif',
      profile: 'autonome',
      currency: 'CAD',
      emailVerified: true,
      createdAt: iso(14),
      lastLoginAt: iso(3),
    },
    {
      id: 'usr-ca-005',
      fullName: 'Julie Lavoie',
      email: 'julie@lavoiedesign.ca',
      role: 'user',
      region: 'CA',
      plan: 'Start',
      status: 'suspendu',
      profile: 'commercant',
      currency: 'CAD',
      emailVerified: true,
      createdAt: iso(11),
      lastLoginAt: iso(7),
    },
    {
      id: 'usr-ca-006',
      fullName: 'Félix-Antoine Gagnon',
      email: 'felix@solutionsquebec.ca',
      role: 'pro',
      region: 'CA',
      plan: 'Pro',
      status: 'actif',
      profile: 'pme',
      currency: 'CAD',
      emailVerified: true,
      createdAt: iso(8),
      lastLoginAt: iso(0, 2),
    },
    {
      id: 'usr-ca-007',
      fullName: 'Camille Côté',
      email: 'camille@cotecreation.ca',
      role: 'user',
      region: 'CA',
      plan: 'Free',
      status: 'actif',
      profile: 'autonome',
      currency: 'CAD',
      emailVerified: false,
      createdAt: iso(5),
      lastLoginAt: iso(4),
    },
    {
      id: 'usr-ca-008',
      fullName: 'Olivier Roy',
      email: 'olivier@roylabs.ca',
      role: 'user',
      region: 'CA',
      plan: 'Start',
      status: 'actif',
      profile: 'pme',
      currency: 'CAD',
      emailVerified: true,
      createdAt: iso(2),
      lastLoginAt: iso(1),
    },
    {
      id: 'usr-af-001',
      fullName: 'Amadou Diallo (Compte Test AF)',
      email: 'test-af@startbill.ca',
      role: 'user',
      region: 'AF',
      plan: 'Free',
      status: 'actif',
      profile: 'commercant',
      currency: 'XOF',
      emailVerified: true,
      createdAt: iso(30),
      lastLoginAt: iso(12),
    },
    {
      id: 'usr-ht-001',
      fullName: 'Jean-Marc Pierre (Compte Test HT)',
      email: 'test-ht@startbill.ca',
      role: 'user',
      region: 'HT',
      plan: 'Free',
      status: 'actif',
      profile: 'autonome',
      currency: 'HTG',
      emailVerified: true,
      createdAt: iso(29),
      lastLoginAt: iso(15),
    },
  ];

  return {
    users,
    userActivities: [
      {
        id: 'act-1',
        userId: 'usr-ca-001',
        action: 'FACTURE_CREEE',
        details: 'Facture FACT-2026-1042 émise (1 450,00 CAD)',
        timestamp: iso(1, 2),
      },
      {
        id: 'act-2',
        userId: 'usr-ca-001',
        action: 'EXPORT_COMPTABLE',
        details: 'Export CSV trimestriel TPS/TVQ téléchargé',
        timestamp: iso(3),
      },
      {
        id: 'act-3',
        userId: 'usr-ca-003',
        action: 'UPGRADE_PRO',
        details: 'Passage au forfait Pro (30 CAD/mois)',
        timestamp: iso(6),
      },
      {
        id: 'act-4',
        userId: 'usr-ca-005',
        action: 'ALERTE_PAIEMENT',
        details: 'Échec de renouvellement carte Stripe — compte suspendu',
        timestamp: iso(7),
      },
    ],
    regions: [
      {
        code: 'CA',
        label: 'Canada',
        devise: 'CAD',
        active: true,
        taxLabel: 'TPS (5%) + TVQ (9.975%)',
        taxRate: 14.975,
        previewNote: 'Lancement MVP V1 actif — Interac, Stripe CAD et exports LPRPDE prêts.',
      },
      {
        code: 'AF',
        label: 'Afrique',
        devise: 'XOF',
        active: false,
        taxLabel: 'TVA OHADA (18%)',
        taxRate: 18,
        previewNote: 'Intégration Orange Money / Wave / MTN en phase pilote.',
      },
      {
        code: 'HT',
        label: 'Haïti',
        devise: 'HTG',
        active: false,
        taxLabel: 'TCA (10%)',
        taxRate: 10,
        previewNote: 'Intégration MonCash & Natcash en validation.',
      },
    ],
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
        userId: 'usr-ca-003',
        userName: 'Nadia Benali',
        userEmail: 'nadia@montrealstudio.ca',
        region: 'CA',
        plan: 'Pro',
        amount: 30,
        currency: 'CAD',
        interval: 'monthly',
        status: 'active',
        nextBillingDate: iso(-18),
      },
      {
        id: 'sub-003',
        userId: 'usr-ca-006',
        userName: 'Félix-Antoine Gagnon',
        userEmail: 'felix@solutionsquebec.ca',
        region: 'CA',
        plan: 'Pro',
        amount: 30,
        currency: 'CAD',
        interval: 'monthly',
        status: 'active',
        nextBillingDate: iso(-22),
      },
      {
        id: 'sub-004',
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
      {
        id: 'sub-005',
        userId: 'usr-ca-008',
        userName: 'Olivier Roy',
        userEmail: 'olivier@roylabs.ca',
        region: 'CA',
        plan: 'Start',
        amount: 15,
        currency: 'CAD',
        interval: 'monthly',
        status: 'active',
        nextBillingDate: iso(-28),
      },
      {
        id: 'sub-006',
        userId: 'usr-ca-005',
        userName: 'Julie Lavoie',
        userEmail: 'julie@lavoiedesign.ca',
        region: 'CA',
        plan: 'Start',
        amount: 15,
        currency: 'CAD',
        interval: 'monthly',
        status: 'past_due',
        nextBillingDate: iso(2),
      },
      {
        id: 'sub-007',
        userId: 'usr-ca-004',
        userName: 'Éric Pelletier',
        userEmail: 'eric@pelletierconseil.ca',
        region: 'CA',
        plan: 'Free',
        amount: 0,
        currency: 'CAD',
        interval: 'monthly',
        status: 'active',
        nextBillingDate: iso(-30),
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
        userEmail: 'nadia@montrealstudio.ca',
        region: 'CA',
        plan: 'Pro',
        amount: 30,
        currency: 'CAD',
        provider: 'Stripe',
        status: 'succeeded',
        createdAt: iso(3),
      },
      {
        id: 'pay-903',
        userEmail: 'mbouchard@ateliernord.ca',
        region: 'CA',
        plan: 'Start',
        amount: 15,
        currency: 'CAD',
        provider: 'Interac',
        status: 'succeeded',
        createdAt: iso(5),
      },
      {
        id: 'pay-904',
        userEmail: 'felix@solutionsquebec.ca',
        region: 'CA',
        plan: 'Pro',
        amount: 30,
        currency: 'CAD',
        provider: 'Stripe',
        status: 'succeeded',
        createdAt: iso(8),
      },
      {
        id: 'pay-905',
        userEmail: 'julie@lavoiedesign.ca',
        region: 'CA',
        plan: 'Start',
        amount: 15,
        currency: 'CAD',
        provider: 'Stripe',
        status: 'disputed',
        createdAt: iso(10),
      },
      {
        id: 'pay-906',
        userEmail: 'olivier@roylabs.ca',
        region: 'CA',
        plan: 'Start',
        amount: 15,
        currency: 'CAD',
        provider: 'Stripe',
        status: 'succeeded',
        createdAt: iso(12),
      },
    ],
    coupons: [
      {
        id: 'cpn-1',
        code: 'CANADA2026',
        discountPercent: 20,
        maxUses: 100,
        usedCount: 14,
        expiresAt: '2026-12-31',
        active: true,
      },
      {
        id: 'cpn-2',
        code: 'PILOTE50',
        discountPercent: 50,
        maxUses: 25,
        usedCount: 9,
        expiresAt: '2026-09-30',
        active: true,
      },
    ],
    invoices: [
      {
        id: 'inv-101',
        number: 'FACT-2026-1042',
        userId: 'usr-ca-001',
        userEmail: 'demo@startbill.ca',
        clientName: 'Éditions Laurentides Inc.',
        region: 'CA',
        amount: 1450,
        currency: 'CAD',
        status: 'paid',
        flaggedFraud: false,
        createdAt: iso(0, 5),
      },
      {
        id: 'inv-102',
        number: 'FACT-2026-1041',
        userId: 'usr-ca-003',
        userEmail: 'nadia@montrealstudio.ca',
        clientName: 'Clinique Saint-Denis',
        region: 'CA',
        amount: 3280,
        currency: 'CAD',
        status: 'paid',
        flaggedFraud: false,
        createdAt: iso(1),
      },
      {
        id: 'inv-103',
        number: 'FACT-2026-1040',
        userId: 'usr-ca-006',
        userEmail: 'felix@solutionsquebec.ca',
        clientName: 'Groupe Boréal Logistique',
        region: 'CA',
        amount: 2150,
        currency: 'CAD',
        status: 'pending',
        flaggedFraud: false,
        createdAt: iso(2),
      },
      {
        id: 'inv-104',
        number: 'FACT-2026-1039',
        userId: 'usr-ca-002',
        userEmail: 'mbouchard@ateliernord.ca',
        clientName: 'Bistro du Port',
        region: 'CA',
        amount: 640,
        currency: 'CAD',
        status: 'overdue',
        flaggedFraud: false,
        createdAt: iso(9),
      },
      {
        id: 'inv-105',
        number: 'FACT-2026-1038',
        userId: 'usr-ca-005',
        userEmail: 'julie@lavoiedesign.ca',
        clientName: 'Import-Export Anonyme',
        region: 'CA',
        amount: 19800,
        currency: 'CAD',
        status: 'pending',
        flaggedFraud: true,
        flagReason: 'Montant inhabituellement élevé pour nouveau compte non vérifié',
        createdAt: iso(11),
      },
      {
        id: 'inv-106',
        number: 'FACT-2026-1037',
        userId: 'usr-af-001',
        userEmail: 'test-af@startbill.ca',
        clientName: 'Kaboré Logistique SARL',
        region: 'AF',
        amount: 125000,
        currency: 'XOF',
        status: 'paid',
        flaggedFraud: false,
        createdAt: iso(18),
      },
      {
        id: 'inv-107',
        number: 'FACT-2026-1036',
        userId: 'usr-ht-001',
        userEmail: 'test-ht@startbill.ca',
        clientName: 'Atelier Caraïbes Création',
        region: 'HT',
        amount: 18500,
        currency: 'HTG',
        status: 'paid',
        flaggedFraud: false,
        createdAt: iso(21),
      },
    ],
    cms: {
      heroTitleLine1: 'Nous simplifions la facturation',
      heroTitleLine2: 'pour les entrepreneurs et les PME',
      heroSubtitle:
        'STARTBILL — Ton assistant financier. Factures, dépenses et finances, en un seul endroit.',
      videoUrl: '/assets/videos/startbill-hero.mp4',
      marqueeText:
        'Nous simplifions la facturation pour les entrepreneurs et les PME. • Suis tes revenus et dépenses en temps réel. • Prépare ta saison des impôts sans stress. • Entreprends sereinement au Canada.',
      legalPages: {
        cgu: "Conditions Générales d'Utilisation STARTBILL Canada (v2026.1) — Droit applicable : Québec & Canada.",
        privacy:
          'Politique de confidentialité — Données hébergées et traitées dans le respect strict des lois canadiennes.',
        lPRPDE:
          'Conformité LPRPDE (PIPEDA) & Loi 25 (Québec) : consentement explicite, droit à la portabilité, chiffrement au repos et journalisation des accès administratifs.',
      },
      announcements: [
        {
          id: 'post-1',
          title: 'Lancement de la version MVP Canada (CAD)',
          category: 'Annonce produit',
          status: 'published',
          excerpt:
            'Ouverture officielle de la phase pilote pour les entrepreneurs canadiens avec calcul automatisé TPS/TVQ.',
          updatedAt: iso(3),
        },
        {
          id: 'post-2',
          title: 'Feuille de route T3 : Rapprochement bancaire Interac',
          category: 'Roadmap',
          status: 'scheduled',
          scheduledFor: '2026-12-01',
          excerpt:
            'Préparation de la synchronisation automatisée des encaissements Interac pour les forfaits Start et Pro.',
          updatedAt: iso(1),
        },
      ],
    },
    emailCampaigns: [
      {
        id: 'cmp-1',
        subject: 'Bienvenue dans la phase pilote StartBill Canada',
        targetType: 'region',
        targetValue: 'CA',
        recipientCount: 8,
        body: 'Bonjour, votre accès en avant-première à StartBill Canada (CAD) est activé.',
        sentAt: iso(4),
        sentBy: SUPER_ADMIN_EMAIL,
      },
    ],
    pushNotifications: [
      {
        id: 'push-1',
        title: 'Export TPS / TVQ disponible',
        message: 'Préparez votre déclaration trimestrielle en un clic depuis le simulateur.',
        targetRegion: 'CA',
        createdAt: iso(2),
      },
    ],
    tickets: [
      {
        id: 'TKT-2041',
        userEmail: 'demo@startbill.ca',
        userName: 'Sophie Tremblay',
        region: 'CA',
        subject: 'Question sur la configuration TVQ sur les devis',
        status: 'en_cours',
        priority: 'haute',
        assignedTo: 'Équipe Support CA',
        createdAt: iso(1, 6),
        updatedAt: iso(0, 3),
        replies: [
          {
            id: 'rep-1',
            author: 'Sophie Tremblay',
            isAdmin: false,
            message:
              'Bonjour, comment enregistrer notre numéro de TVQ par défaut sur les nouveaux devis ?',
            createdAt: iso(1, 6),
          },
        ],
      },
      {
        id: 'TKT-2040',
        userEmail: 'olivier@roylabs.ca',
        userName: 'Olivier Roy',
        region: 'CA',
        subject: 'Demande de facture annuelle avec rabais -20 %',
        status: 'ouvert',
        priority: 'normale',
        assignedTo: 'Non assigné',
        createdAt: iso(2),
        updatedAt: iso(2),
        replies: [
          {
            id: 'rep-2',
            author: 'Olivier Roy',
            isAdmin: false,
            message: 'Je souhaite basculer mon forfait Start mensuel vers la facturation annuelle.',
            createdAt: iso(2),
          },
        ],
      },
      {
        id: 'TKT-2039',
        userEmail: 'nadia@montrealstudio.ca',
        userName: 'Nadia Benali',
        region: 'CA',
        subject: 'Ajout d’un second collaborateur sur le compte Pro',
        status: 'resolu',
        priority: 'normale',
        assignedTo: 'Super Admin',
        createdAt: iso(6),
        updatedAt: iso(4),
        replies: [
          {
            id: 'rep-3',
            author: 'Super Admin',
            isAdmin: true,
            message: 'Votre second accès collaborateur a été activé sur Montréal Studio.',
            createdAt: iso(4),
          },
        ],
      },
    ],
    auditLogs: [
      {
        id: 'aud-1',
        actorEmail: SUPER_ADMIN_EMAIL,
        action: 'SEED_SUPER_ADMIN',
        target: SUPER_ADMIN_EMAIL,
        details: 'Initialisation du compte Super Administrateur unique (immutable)',
        ip: '127.0.0.1',
        userAgent: 'StartBill-Seed/1.0',
        timestamp: iso(10),
      },
      {
        id: 'aud-2',
        actorEmail: SUPER_ADMIN_EMAIL,
        action: 'REGION_MVP_LOCK',
        target: 'CA',
        details: 'Verrouillage MVP sur Canada (CA / CAD) activé',
        ip: '127.0.0.1',
        userAgent: 'StartBill-Admin/1.0',
        timestamp: iso(5),
      },
    ],
    loginHistory: [
      {
        id: 'log-1',
        email: SUPER_ADMIN_EMAIL,
        role: 'super_admin',
        success: true,
        ip: '142.169.44.12',
        browser: 'Chrome 130 / macOS',
        location: 'Montréal, QC, Canada',
        timestamp: iso(1),
      },
      {
        id: 'log-2',
        email: 'demo@startbill.ca',
        role: 'pro',
        success: true,
        ip: '70.82.19.104',
        browser: 'Safari / iOS',
        location: 'Québec, QC, Canada',
        timestamp: iso(1, 3),
      },
      {
        id: 'log-3',
        email: 'inconnu@scanner-test.org',
        role: 'user',
        success: false,
        ip: '185.220.101.9',
        browser: 'curl/8.4.0',
        location: 'Inconnue (VPN)',
        timestamp: iso(0, 8),
      },
    ],
    securityAlerts: [
      {
        id: 'sec-1',
        severity: 'warning',
        title: 'Tentative d’accès /admin non autorisée bloquée (403)',
        description: 'Requête refusée sans privilèges Super Administrateur depuis IP externe.',
        sourceIp: '185.220.101.9',
        resolved: false,
        createdAt: iso(0, 8),
      },
      {
        id: 'sec-2',
        severity: 'info',
        title: 'Conformité LPRPDE vérifiée',
        description: 'Sauvegarde chiffrée et masquage des clés API opérationnels.',
        sourceIp: '127.0.0.1',
        resolved: true,
        createdAt: iso(2),
      },
    ],
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
  };
}

let cachedDb: StartBillDatabase | null = null;

export function getDb(): StartBillDatabase {
  if (cachedDb) return cachedDb;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let existingAdmin: DbUser | undefined;
  let partialDb: Partial<StartBillDatabase> | null = null;

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      partialDb = JSON.parse(fs.readFileSync(DB_FILE_PATH, 'utf8')) as Partial<StartBillDatabase>;
      if (Array.isArray(partialDb.users)) {
        existingAdmin = partialDb.users.find(
          (u) => String(u.email).toLowerCase() === SUPER_ADMIN_EMAIL
        );
      }
    } catch {
      partialDb = null;
    }
  }

  const defaults = buildInitialSeed(existingAdmin);

  if (partialDb && Array.isArray(partialDb.users) && partialDb.users.length > 1) {
    cachedDb = {
      ...defaults,
      ...partialDb,
      users: partialDb.users,
    };
  } else {
    // Si seul l'admin a été créé par scripts/seedAdmin.js, fusionner avec les collections complètes
    cachedDb = defaults;
    if (partialDb?.users) {
      const extraUsers = partialDb.users.filter(
        (u) => String(u.email).toLowerCase() !== SUPER_ADMIN_EMAIL
      );
      cachedDb.users = [...defaults.users, ...extraUsers];
    }
    saveDb(cachedDb);
  }

  return cachedDb;
}

export function saveDb(db?: StartBillDatabase): void {
  const target = db || cachedDb;
  if (!target) return;
  cachedDb = target;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(target, null, 2), { mode: 0o600 });
}

export function sanitizeUserForClient(user: DbUser) {
  const { passwordHash: _ph, totpSecret: _ts, ...safeUser } = user;
  return safeUser;
}

export function appendAuditLog(entry: Omit<AuditLogRecord, 'id' | 'timestamp'>): AuditLogRecord {
  const db = getDb();
  const record: AuditLogRecord = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  db.auditLogs.unshift(record);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDb(db);
  return record;
}
