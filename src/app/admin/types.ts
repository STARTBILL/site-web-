import type { RegionCode, CurrencyCode } from '../../config/regions';

export type AdminSectionId =
  | 'dashboard'
  | 'users'
  | 'regions'
  | 'billing'
  | 'invoices'
  | 'content'
  | 'communications'
  | 'support'
  | 'logs'
  | 'settings'
  | 'analytics';

export interface DbUserView {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'pro' | 'admin' | 'super_admin';
  region: RegionCode;
  plan: 'Free' | 'Start' | 'Pro';
  status: 'actif' | 'suspendu';
  profile: string;
  currency: CurrencyCode;
  emailVerified: boolean;
  mustChangePassword?: boolean;
  immutable?: boolean;
  totpEnabled?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserActivityView {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface RegionSettingView {
  code: RegionCode;
  label: string;
  devise: CurrencyCode;
  active: boolean;
  taxLabel: string;
  taxRate: number;
  previewNote: string;
}

export interface SubscriptionView {
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

export interface PaymentView {
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

export interface CouponView {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export interface InvoiceView {
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

export interface BlogPostView {
  id: string;
  title: string;
  category: string;
  status: 'published' | 'scheduled' | 'draft';
  scheduledFor?: string;
  excerpt: string;
  updatedAt: string;
}

export interface CmsContentView {
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
  announcements: BlogPostView[];
}

export interface EmailCampaignView {
  id: string;
  subject: string;
  targetType: 'all' | 'region' | 'plan';
  targetValue: string;
  recipientCount: number;
  body: string;
  sentAt: string;
  sentBy: string;
}

export interface PushNotificationView {
  id: string;
  title: string;
  message: string;
  targetRegion: 'ALL' | RegionCode;
  createdAt: string;
}

export interface SupportTicketView {
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
  replies: Array<{
    id: string;
    author: string;
    isAdmin: boolean;
    message: string;
    createdAt: string;
  }>;
}

export interface AuditLogView {
  id: string;
  actorEmail: string;
  action: string;
  target: string;
  details: string;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export interface LoginHistoryView {
  id: string;
  email: string;
  role: string;
  success: boolean;
  ip: string;
  browser: string;
  location: string;
  timestamp: string;
}

export interface SecurityAlertView {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  sourceIp: string;
  resolved: boolean;
  createdAt: string;
}

export interface ActiveSessionView {
  id: string;
  email: string;
  ip: string;
  userAgent: string;
  totpVerified: boolean;
  createdAt: string;
  lastActivityAt: string;
}

export interface PlatformSettingsView {
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

export interface AnalyticsView {
  totalUsers: number;
  usersByRegion: Record<RegionCode, number>;
  invoicesCreated: {
    day: number;
    week: number;
    month: number;
    total: number;
  };
  totalRevenueCad: number;
  mrrCad: number;
  conversionFreeToPro: number;
  revenueByPlan: {
    Free: number;
    Start: number;
    Pro: number;
  };
  invoiceStats: {
    avgAmountCad: number;
    dominantCurrency: string;
    flaggedCount: number;
  };
  activitySeries: Array<{
    label: string;
    signups: number;
    invoices: number;
    ocrUsage: number;
    aiAdvisorUsage: number;
  }>;
  featureUsage: Array<{
    feature: string;
    percent: number;
    sessions: number;
  }>;
  performance: {
    uptimePercent: number;
    errorRatePercent: number;
    p95LatencyMs: number;
  };
}

export interface AdminOverviewData {
  analytics: AnalyticsView;
  users: DbUserView[];
  userActivities: UserActivityView[];
  regions: RegionSettingView[];
  subscriptions: SubscriptionView[];
  payments: PaymentView[];
  coupons: CouponView[];
  invoices: InvoiceView[];
  cms: CmsContentView;
  emailCampaigns: EmailCampaignView[];
  pushNotifications: PushNotificationView[];
  tickets: SupportTicketView[];
  auditLogs: AuditLogView[];
  loginHistory: LoginHistoryView[];
  securityAlerts: SecurityAlertView[];
  activeSessions: ActiveSessionView[];
  settings: PlatformSettingsView;
}
