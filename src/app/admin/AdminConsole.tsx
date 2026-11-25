import React, { useState, useEffect, useCallback, useRef, Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, Clock, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AdminSidebar, ADMIN_NAV_ITEMS } from './AdminSidebar';
import { AdminAuthGate, type AdminSessionState } from './AdminAuthGate';
import { SUPER_ADMIN_EMAIL, useSuperAdmin, useIdleLogout } from '../../hooks/useSuperAdmin';
import {
  adminApiRequest,
  downloadAdminCsv,
  readLocalWaitlistCandidates,
} from '../../utils/adminClient';
import { auth } from '../../firebase';
import {
  createManagedUserInFirestore,
  deleteManagedUserInFirestore,
  exportUsersCsvLocally,
  importWaitlistInFirestore,
  inviteManagedUserInFirestore,
  isFirebaseSuperAdminUser,
  loadAdminOverviewFromFirestore,
  signOutFirebaseAdmin,
  subscribeFirebaseAdminAuth,
  updateManagedUserInFirestore,
  updatePlatformConfigInFirestore,
} from '../../utils/firebaseAdminAdapter';
import type { AdminOverviewData, AdminSectionId } from './types';

import { DashboardSection } from './sections/DashboardSection';
import { UsersSection, isWaitlistEntry } from './sections/UsersSection';
import { RegionsSection } from './sections/RegionsSection';
import { BillingSection } from './sections/BillingSection';
import { InvoicesSection } from './sections/InvoicesSection';
import { ContentSection } from './sections/ContentSection';
import { CommunicationsSection } from './sections/CommunicationsSection';
import { SupportSection } from './sections/SupportSection';
import { LogsSection } from './sections/LogsSection';
import { SettingsSection } from './sections/SettingsSection';
import { AnalyticsSection } from './sections/AnalyticsSection';
import { AdminAccountSection } from './sections/AdminAccountSection';

interface AdminErrorBoundaryProps {
  onExitAdmin: () => void;
  children: ReactNode;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  state: AdminErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    let message = error.message || 'Une erreur inattendue est survenue.';
    try {
      const parsed = JSON.parse(message);
      if (parsed && typeof parsed === 'object' && parsed.error) {
        message = `${parsed.error}${parsed.path ? ` (${parsed.path})` : ''}`;
      }
    } catch {
      // Keep raw message
    }
    return { hasError: true, message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('AdminErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#071328] p-6">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1e3d] border border-red-200 dark:border-red-900 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Erreur dans la console administrateur
            </h2>
            <p className="text-xs text-slate-600 dark:text-blue-200 break-words">
              {this.state.message}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, message: '' })}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
              >
                Réessayer
              </button>
              <button
                type="button"
                onClick={this.props.onExitAdmin}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-blue-200 border border-slate-200 dark:border-blue-800"
              >
                Retour à l’accueil
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface AdminConsoleProps {
  section: AdminSectionId;
  onSelectSection: (section: AdminSectionId) => void;
  onExitAdmin: () => void;
  nonAdminLoggedInEmail?: string | null;
  onClearStandardSession?: () => Promise<void> | void;
  onPublicConfigChanged?: () => void;
  onAdminSessionUserChange?: (user: AdminSessionState['user'] | null) => void;
}

const AdminConsoleInner: React.FC<AdminConsoleProps> = ({
  section,
  onSelectSection,
  onExitAdmin,
  nonAdminLoggedInEmail,
  onClearStandardSession,
  onPublicConfigChanged,
  onAdminSessionUserChange,
}) => {
  const [sessionState, setSessionState] = useState<AdminSessionState>({
    authenticated: false,
    setupRequired: false,
    user: null,
    mustChangePassword: false,
    totpEnabled: false,
    totpVerified: false,
    csrfToken: '',
  });
  const [checkingSession, setCheckingSession] = useState(true);
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const { isSuperAdmin } = useSuperAdmin(sessionState.user);
  const isFullyUnlocked =
    sessionState.authenticated &&
    isSuperAdmin &&
    !sessionState.mustChangePassword &&
    (!sessionState.totpEnabled || sessionState.totpVerified);

  const notify = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 4000);
  };

  const onAdminSessionUserChangeRef = useRef(onAdminSessionUserChange);
  onAdminSessionUserChangeRef.current = onAdminSessionUserChange;
  const onExitAdminRef = useRef(onExitAdmin);
  onExitAdminRef.current = onExitAdmin;

  const checkAdminSession = useCallback(async () => {
    setCheckingSession(true);
    try {
      const { status, data } = await adminApiRequest('/api/auth/admin/session');
      const staticHostDetected = Boolean(data?.staticHostDetected);
      const fbUser = auth.currentUser;

      if (data?.authenticated) {
        const next: AdminSessionState = {
          authenticated: true,
          setupRequired: Boolean(data.setupRequired),
          envManaged: Boolean(data.envManaged),
          staticHostDetected,
          authMode: 'node',
          backendError: null,
          user: data.user || null,
          mustChangePassword: Boolean(data.mustChangePassword),
          totpEnabled: Boolean(data.totpEnabled),
          totpVerified: Boolean(data.totpVerified),
          csrfToken: data.csrfToken || '',
        };
        setSessionState(next);
        onAdminSessionUserChangeRef.current?.(
          !next.totpEnabled || next.totpVerified ? next.user : null
        );
        return;
      }

      if (isFirebaseSuperAdminUser(fbUser) && fbUser) {
        const fbAdminUser = {
          id: fbUser.uid,
          fullName: fbUser.displayName || 'Ferline Zogni — Admin STARTBILL',
          email: fbUser.email || SUPER_ADMIN_EMAIL,
          role: 'super_admin',
          region: 'CA',
        };
        setSessionState({
          authenticated: true,
          setupRequired: false,
          staticHostDetected,
          authMode: 'firebase',
          backendError: null,
          user: fbAdminUser,
          mustChangePassword: false,
          totpEnabled: false,
          totpVerified: true,
          csrfToken: 'firebase-auth',
        });
        onAdminSessionUserChangeRef.current?.(fbAdminUser);
        return;
      }

      const backendError =
        !staticHostDetected && (data?.isNonJson || status === 0 || status >= 500)
          ? data?.error || 'Serveur d’administration inaccessible.'
          : null;

      setSessionState({
        authenticated: false,
        setupRequired: Boolean(data?.setupRequired),
        envManaged: Boolean(data?.envManaged),
        staticHostDetected,
        authMode: undefined,
        backendError,
        user: null,
        mustChangePassword: false,
        totpEnabled: false,
        totpVerified: false,
        csrfToken: data?.csrfToken || '',
      });
      onAdminSessionUserChangeRef.current?.(null);
    } catch {
      setSessionState((prev) => ({
        ...prev,
        staticHostDetected: true,
        backendError: null,
      }));
    } finally {
      setCheckingSession(false);
    }
  }, []);

  // Vérifier la session admin existante au montage et écouter Firebase Auth
  useEffect(() => {
    checkAdminSession();
    const unsubscribe = subscribeFirebaseAdminAuth((fbUser) => {
      if (isFirebaseSuperAdminUser(fbUser) && fbUser) {
        setSessionState((prev) => {
          if (prev.authenticated && prev.authMode === 'node') return prev;
          const fbAdminUser = {
            id: fbUser.uid,
            fullName: fbUser.displayName || 'Ferline Zogni — Admin STARTBILL',
            email: fbUser.email || SUPER_ADMIN_EMAIL,
            role: 'super_admin',
            region: 'CA',
          };
          onAdminSessionUserChangeRef.current?.(fbAdminUser);
          return {
            authenticated: true,
            setupRequired: false,
            staticHostDetected: prev.staticHostDetected,
            authMode: 'firebase',
            backendError: null,
            user: fbAdminUser,
            mustChangePassword: false,
            totpEnabled: false,
            totpVerified: true,
            csrfToken: 'firebase-auth',
          };
        });
      }
    });
    return () => unsubscribe();
  }, [checkAdminSession]);

  const handleLogout = useCallback(async () => {
    try {
      await signOutFirebaseAdmin();
    } catch {
      // Ignore Firebase sign-out error
    }
    try {
      await adminApiRequest('/api/auth/admin/logout', {
        method: 'POST',
      });
    } catch {
      // Ignore logout network error
    }
    setOverview(null);
    setSessionState({
      authenticated: false,
      user: null,
      mustChangePassword: false,
      totpEnabled: false,
      totpVerified: false,
      csrfToken: '',
    });
    onAdminSessionUserChangeRef.current?.(null);
    onExitAdminRef.current();
  }, []);

  // Déconnexion automatique après 30 minutes d'inactivité
  const { remainingMinutes } = useIdleLogout(isFullyUnlocked, () => {
    notify('err', "Session expirée après 30 minutes d'inactivité.");
    handleLogout();
  });

  const adminFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const { status, data } = await adminApiRequest(url, {
        ...options,
        headers: {
          'X-CSRF-Token': sessionState.csrfToken,
          ...(options.headers || {}),
        },
      });
      if (status === 401 || status === 403) {
        if (data?.code === 'SESSION_IDLE_EXPIRED') {
          await handleLogout();
        }
        throw new Error(data?.error || 'Accès refusé (403)');
      }
      if (status === 429) {
        throw new Error(data?.error || 'Limite de requêtes atteinte (10 req/min max).');
      }
      if (status >= 400) {
        throw new Error(data?.error || 'Erreur serveur');
      }
      return data;
    },
    [sessionState.csrfToken, handleLogout]
  );

  const isFirebaseMode = sessionState.authMode === 'firebase';

  const loadOverview = useCallback(async () => {
    setLoadingData(true);
    try {
      if (sessionState.authMode === 'firebase') {
        const fbUser = auth.currentUser;
        if (!fbUser || !isFirebaseSuperAdminUser(fbUser)) {
          throw new Error('Session Cloud expirée. Veuillez vous reconnecter.');
        }
        const data = await loadAdminOverviewFromFirestore(fbUser);
        setOverview(data);
      } else {
        const data = await adminFetch('/api/admin/overview');
        setOverview(data);
      }
    } catch (err) {
      let msg = err instanceof Error ? err.message : 'Erreur de chargement';
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.error) msg = parsed.error;
      } catch {
        // Keep plain message
      }
      notify('err', msg);
    } finally {
      setLoadingData(false);
    }
  }, [adminFetch, sessionState.authMode]);

  useEffect(() => {
    if (isFullyUnlocked) {
      loadOverview();
      onAdminSessionUserChangeRef.current?.(sessionState.user);
    }
  }, [isFullyUnlocked, loadOverview]);

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#071328] text-xs font-medium text-slate-500 dark:text-blue-200">
        Vérification des privilèges Super Administrateur...
      </div>
    );
  }

  if (!isFullyUnlocked) {
    return (
      <AdminAuthGate
        sessionState={sessionState}
        nonAdminLoggedInEmail={nonAdminLoggedInEmail}
        onClearStandardSession={onClearStandardSession}
        onSessionUpdated={(next: AdminSessionState) => {
          setSessionState({ ...next, backendError: null });
          if (next.authenticated && !next.mustChangePassword && (!next.totpEnabled || next.totpVerified)) {
            onAdminSessionUserChangeRef.current?.(next.user);
          }
        }}
        onRetrySession={checkAdminSession}
        onExitAdmin={onExitAdmin}
      />
    );
  }

  const currentNav = ADMIN_NAV_ITEMS.find((n) => n.id === section) || ADMIN_NAV_ITEMS[0];
  const existingEmailsSet = new Set(
    (overview?.users || []).map((u) => u.email.toLowerCase())
  );
  const unsyncedLocalWaitlist = readLocalWaitlistCandidates().filter(
    (c) => !existingEmailsSet.has(c.email.toLowerCase())
  );
  const pendingWaitlistCount = (overview?.users || []).filter(
    (u) => isWaitlistEntry(u) && u.waitlistStatus !== 'invite' && u.waitlistStatus !== 'converti'
  ).length;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#071328] text-slate-900 dark:text-blue-50">
      <AdminSidebar
        user={sessionState.user}
        activeSection={section}
        onSelectSection={onSelectSection}
        onExitAdmin={onExitAdmin}
        onLogout={handleLogout}
        pendingWaitlistCount={pendingWaitlistCount}
        unresolvedAlertsCount={
          overview?.securityAlerts.filter((a) => !a.resolved).length || 0
        }
        openTicketsCount={
          overview?.tickets.filter((t) => t.status !== 'resolu').length || 0
        }
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Admin */}
        <header className="h-16 px-6 bg-white dark:bg-[#081730] border-b border-slate-200 dark:border-blue-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
            <span className="text-slate-400 dark:text-blue-400">Administration</span>
            <span className="text-slate-300 dark:text-blue-800">/</span>
            <h1 className="font-bold text-slate-900 dark:text-white truncate">
              {currentNav.label}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-blue-300 tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              <span>Auto-logout : {remainingMinutes} min</span>
            </span>

            <button
              onClick={loadOverview}
              disabled={loadingData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-blue-800 text-xs font-medium text-slate-700 dark:text-blue-100 hover:bg-slate-50 dark:hover:bg-blue-950"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </header>

        {/* Notification Toast */}
        {toast && (
          <div className="px-6 pt-4">
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                toast.type === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}
            >
              {toast.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{toast.msg}</span>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {!overview ? (
            <div className="p-8 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 text-xs text-slate-500 dark:text-blue-300">
              Chargement des données de la plateforme...
            </div>
          ) : (
            <>
              {section === 'dashboard' && (
                <DashboardSection
                  analytics={overview.analytics}
                  regions={overview.regions}
                  onNavigateSection={(sec) => onSelectSection(sec)}
                />
              )}

              {section === 'users' && (
                <UsersSection
                  users={overview.users}
                  activities={overview.userActivities}
                  localWaitlistCount={unsyncedLocalWaitlist.length}
                  onSyncLocalWaitlist={async () => {
                    try {
                      if (isFirebaseMode) {
                        const res = await importWaitlistInFirestore(
                          overview.users,
                          unsyncedLocalWaitlist
                        );
                        notify(
                          'ok',
                          `${res.importedCount} contact(s) de la liste d’attente synchronisé(s).`
                        );
                      } else {
                        const res = await adminFetch('/api/admin/waitlist/import', {
                          method: 'POST',
                          body: JSON.stringify({ entries: unsyncedLocalWaitlist }),
                        });
                        notify(
                          'ok',
                          `${res.importedCount} contact(s) de la liste d’attente synchronisé(s).`
                        );
                      }
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur de synchronisation');
                    }
                  }}
                  onCreateUser={async (payload) => {
                    try {
                      if (isFirebaseMode) {
                        await createManagedUserInFirestore(payload);
                      } else {
                        await adminFetch('/api/admin/users', {
                          method: 'POST',
                          body: JSON.stringify(payload),
                        });
                      }
                      notify('ok', 'Contact / utilisateur enregistré.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Création impossible');
                    }
                  }}
                  onUpdateUser={async (userId, payload) => {
                    try {
                      if (isFirebaseMode) {
                        const targetUser = overview.users.find((u) => u.id === userId);
                        if (!targetUser) throw new Error('Utilisateur introuvable.');
                        await updateManagedUserInFirestore(targetUser, payload);
                      } else {
                        await adminFetch(`/api/admin/users/${userId}`, {
                          method: 'PATCH',
                          body: JSON.stringify(payload),
                        });
                      }
                      notify('ok', 'Utilisateur mis à jour.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                  onInviteWaitlistUser={async (userId) => {
                    try {
                      if (isFirebaseMode) {
                        const targetUser = overview.users.find((u) => u.id === userId);
                        if (!targetUser) throw new Error('Contact introuvable.');
                        await inviteManagedUserInFirestore(targetUser);
                      } else {
                        await adminFetch(`/api/admin/users/${userId}/invite`, {
                          method: 'POST',
                        });
                      }
                      notify('ok', 'Invitation liste d’attente enregistrée.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                  onImportWaitlist={async (entries) => {
                    try {
                      if (isFirebaseMode) {
                        const res = await importWaitlistInFirestore(overview.users, entries);
                        notify(
                          'ok',
                          `${res.importedCount} contact(s) importé(s), ${res.skippedCount} déjà présent(s).`
                        );
                      } else {
                        const res = await adminFetch('/api/admin/waitlist/import', {
                          method: 'POST',
                          body: JSON.stringify({ entries }),
                        });
                        notify(
                          'ok',
                          `${res.importedCount} contact(s) importé(s), ${res.skippedCount} déjà présent(s).`
                        );
                      }
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Import impossible');
                    }
                  }}
                  onDeleteUser={async (userId) => {
                    try {
                      if (isFirebaseMode) {
                        const targetUser = overview.users.find((u) => u.id === userId);
                        if (!targetUser) throw new Error('Utilisateur introuvable.');
                        await deleteManagedUserInFirestore(targetUser);
                      } else {
                        await adminFetch(`/api/admin/users/${userId}`, {
                          method: 'DELETE',
                        });
                      }
                      notify('ok', 'Utilisateur supprimé.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Suppression refusée');
                    }
                  }}
                  onExportCsv={async () => {
                    if (isFirebaseMode) {
                      exportUsersCsvLocally(overview.users);
                      notify('ok', 'Export CSV téléchargé.');
                      return;
                    }
                    const res = await downloadAdminCsv(
                      '/api/admin/users/export.csv',
                      'startbill-users.csv'
                    );
                    if (!res.ok) notify('err', res.error || 'Export CSV impossible.');
                  }}
                />
              )}

              {section === 'regions' && (
                <RegionsSection
                  regions={overview.regions}
                  usersByRegion={overview.analytics.usersByRegion}
                  onUpdateRegion={async (code, payload) => {
                    if (isFirebaseMode) {
                      notify('err', 'Configuration des régions réservée au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch(`/api/admin/regions/${code}`, {
                        method: 'PATCH',
                        body: JSON.stringify(payload),
                      });
                      notify('ok', `Région ${code} mise à jour.`);
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                />
              )}

              {section === 'billing' && (
                <BillingSection
                  subscriptions={overview.subscriptions}
                  payments={overview.payments}
                  coupons={overview.coupons}
                  analytics={overview.analytics}
                  onUpdatePaymentStatus={async (id, status) => {
                    if (isFirebaseMode) {
                      notify('err', 'Gestion des paiements réservée au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch(`/api/admin/billing/payments/${id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ status }),
                      });
                      notify('ok', 'Statut du paiement mis à jour.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                  onCreateCoupon={async (payload) => {
                    if (isFirebaseMode) {
                      notify('err', 'Création de coupons réservée au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch('/api/admin/billing/coupons', {
                        method: 'POST',
                        body: JSON.stringify(payload),
                      });
                      notify('ok', `Coupon ${payload.code} créé.`);
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                  onToggleCoupon={async (id) => {
                    if (isFirebaseMode) {
                      notify('err', 'Modification de coupons réservée au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch(`/api/admin/billing/coupons/${id}`, {
                        method: 'PATCH',
                      });
                      notify('ok', 'Statut du coupon modifié.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                />
              )}

              {section === 'invoices' && (
                <InvoicesSection
                  invoices={overview.invoices}
                  analytics={overview.analytics}
                  onToggleFlag={async (id, flaggedFraud, flagReason) => {
                    if (isFirebaseMode) {
                      notify('err', 'Signalement de factures réservé au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch(`/api/admin/invoices/${id}/flag`, {
                        method: 'PATCH',
                        body: JSON.stringify({ flaggedFraud, flagReason }),
                      });
                      notify(
                        'ok',
                        flaggedFraud ? 'Facture signalée comme suspecte.' : 'Signalement retiré.'
                      );
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                />
              )}

              {section === 'content' && (
                <ContentSection
                  cms={overview.cms}
                  onSaveCms={async (payload) => {
                    try {
                      if (isFirebaseMode) {
                        await updatePlatformConfigInFirestore({
                          siteName: overview.settings.siteName,
                          maintenanceMode: overview.settings.maintenanceMode,
                          maintenanceMessage: overview.settings.maintenanceMessage,
                          heroTitleLine1: payload.heroTitleLine1,
                          heroTitleLine2: payload.heroTitleLine2,
                          heroSubtitle: payload.heroSubtitle,
                          marqueeText: payload.marqueeText,
                        });
                      } else {
                        await adminFetch('/api/admin/cms', {
                          method: 'PUT',
                          body: JSON.stringify(payload),
                        });
                      }
                      notify('ok', 'Contenu CMS publié.');
                      onPublicConfigChanged?.();
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                  onCreatePost={async (payload) => {
                    if (isFirebaseMode) {
                      notify('err', 'Publication d’articles réservée au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch('/api/admin/cms/posts', {
                        method: 'POST',
                        body: JSON.stringify(payload),
                      });
                      notify('ok', 'Article / annonce enregistré.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                />
              )}

              {section === 'communications' && (
                <CommunicationsSection
                  campaigns={overview.emailCampaigns}
                  pushNotifications={overview.pushNotifications}
                  onSendEmail={async (payload) => {
                    if (isFirebaseMode) {
                      notify('err', 'Envoi d’emails groupés réservé au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch('/api/admin/communications/email', {
                        method: 'POST',
                        body: JSON.stringify(payload),
                      });
                      notify('ok', 'Campagne email envoyée.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                  onSendPush={async (payload) => {
                    if (isFirebaseMode) {
                      notify('err', 'Diffusion push réservée au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch('/api/admin/communications/push', {
                        method: 'POST',
                        body: JSON.stringify(payload),
                      });
                      notify('ok', 'Notification in-app diffusée.');
                      onPublicConfigChanged?.();
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                />
              )}

              {section === 'support' && (
                <SupportSection
                  tickets={overview.tickets}
                  onUpdateTicket={async (id, payload) => {
                    if (isFirebaseMode) {
                      notify('err', 'Gestion des tickets réservée au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch(`/api/admin/support/tickets/${id}`, {
                        method: 'PATCH',
                        body: JSON.stringify(payload),
                      });
                      notify('ok', 'Ticket mis à jour.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                  onReplyTicket={async (id, message) => {
                    if (isFirebaseMode) {
                      notify('err', 'Réponse aux tickets réservée au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch(`/api/admin/support/tickets/${id}/reply`, {
                        method: 'POST',
                        body: JSON.stringify({ message }),
                      });
                      notify('ok', 'Réponse transmise au client.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                />
              )}

              {section === 'logs' && (
                <LogsSection
                  auditLogs={overview.auditLogs}
                  loginHistory={overview.loginHistory}
                  securityAlerts={overview.securityAlerts}
                  activeSessions={overview.activeSessions}
                  onResolveAlert={async (id) => {
                    if (isFirebaseMode) {
                      notify('err', 'Résolution des alertes réservée au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch(`/api/admin/logs/alerts/${id}`, {
                        method: 'PATCH',
                      });
                      notify('ok', 'Alerte marquée comme résolue.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                  onRevokeSession={async (sessionId) => {
                    if (isFirebaseMode) {
                      notify('err', 'Révocation de session réservée au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch(`/api/admin/logs/sessions/${sessionId}/revoke`, {
                        method: 'POST',
                      });
                      notify('ok', 'Session révoquée.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                />
              )}

              {section === 'settings' && (
                <SettingsSection
                  settings={overview.settings}
                  onSaveSettings={async (payload) => {
                    try {
                      if (isFirebaseMode) {
                        await updatePlatformConfigInFirestore({
                          siteName:
                            typeof payload.siteName === 'string'
                              ? payload.siteName
                              : overview.settings.siteName,
                          maintenanceMode:
                            typeof payload.maintenanceMode === 'boolean'
                              ? payload.maintenanceMode
                              : overview.settings.maintenanceMode,
                          maintenanceMessage:
                            typeof payload.maintenanceMessage === 'string'
                              ? payload.maintenanceMessage
                              : overview.settings.maintenanceMessage,
                          heroTitleLine1: overview.cms.heroTitleLine1,
                          heroTitleLine2: overview.cms.heroTitleLine2,
                          heroSubtitle: overview.cms.heroSubtitle,
                          marqueeText: overview.cms.marqueeText,
                        });
                      } else {
                        await adminFetch('/api/admin/settings', {
                          method: 'PUT',
                          body: JSON.stringify(payload),
                        });
                      }
                      notify('ok', 'Paramètres plateforme sauvegardés.');
                      onPublicConfigChanged?.();
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                  onCreateBackup={async () => {
                    if (isFirebaseMode) {
                      notify('err', 'Sauvegarde serveur JSON réservée au serveur Node.js actif.');
                      return;
                    }
                    try {
                      await adminFetch('/api/admin/settings/backup', {
                        method: 'POST',
                      });
                      notify('ok', 'Sauvegarde manuelle générée.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                />
              )}

              {section === 'analytics' && (
                <AnalyticsSection
                  analytics={overview.analytics}
                  onExportCsv={async () => {
                    if (isFirebaseMode) {
                      exportUsersCsvLocally(overview.users);
                      notify('ok', 'Rapport utilisateurs exporté en CSV.');
                      return;
                    }
                    const res = await downloadAdminCsv(
                      '/api/admin/analytics/export.csv',
                      'startbill-analytics-report.csv'
                    );
                    if (!res.ok) notify('err', res.error || 'Export CSV impossible.');
                  }}
                />
              )}

              {section === 'account' && (
                <AdminAccountSection
                  user={sessionState.user}
                  totpEnabled={sessionState.totpEnabled}
                  activeSessions={overview.activeSessions}
                  totalUsersCount={overview.users.length}
                  waitlistCount={overview.users.filter((u) => isWaitlistEntry(u)).length}
                  onUpdateProfile={async (fullName) => {
                    if (isFirebaseMode) {
                      setSessionState((prev) => {
                        const updatedUser = prev.user
                          ? { ...prev.user, fullName: fullName.trim() }
                          : prev.user;
                        onAdminSessionUserChangeRef.current?.(updatedUser || null);
                        return { ...prev, user: updatedUser };
                      });
                      notify('ok', 'Nom administrateur mis à jour.');
                      return;
                    }
                    try {
                      const res = await adminFetch('/api/auth/admin/profile', {
                        method: 'PATCH',
                        body: JSON.stringify({ fullName }),
                      });
                      if (res?.user) {
                        setSessionState((prev) => ({ ...prev, user: res.user }));
                        onAdminSessionUserChange?.(res.user);
                      }
                      notify('ok', 'Profil administrateur mis à jour.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur');
                    }
                  }}
                  onChangePassword={async (currentPassword, newPassword) => {
                    if (isFirebaseMode) {
                      notify('err', 'Mot de passe géré directement via votre compte Google.');
                      return;
                    }
                    await adminFetch('/api/auth/admin/change-password', {
                      method: 'POST',
                      body: JSON.stringify({ currentPassword, newPassword }),
                    });
                    notify('ok', 'Mot de passe administrateur mis à jour.');
                  }}
                  onInitTotpSetup={async () => {
                    if (isFirebaseMode) {
                      notify('err', 'Double authentification gérée via Google Auth en mode Cloud.');
                      return {};
                    }
                    try {
                      return await adminFetch('/api/auth/admin/totp/setup', {
                        method: 'POST',
                      });
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Erreur 2FA');
                      return {};
                    }
                  }}
                  onVerifyTotp={async (code) => {
                    if (isFirebaseMode) {
                      notify('err', 'Double authentification gérée via Google Auth en mode Cloud.');
                      return;
                    }
                    try {
                      const res = await adminFetch('/api/auth/admin/totp/verify', {
                        method: 'POST',
                        body: JSON.stringify({ code }),
                      });
                      setSessionState((prev) => ({
                        ...prev,
                        totpEnabled: true,
                        totpVerified: true,
                        user: res.user || prev.user,
                      }));
                      notify('ok', 'Double authentification 2FA activée.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Code TOTP invalide');
                    }
                  }}
                  onDisableTotp={async (currentPassword) => {
                    if (isFirebaseMode) {
                      notify('err', 'Double authentification gérée via Google Auth en mode Cloud.');
                      return;
                    }
                    try {
                      const res = await adminFetch('/api/auth/admin/totp/disable', {
                        method: 'POST',
                        body: JSON.stringify({ currentPassword }),
                      });
                      setSessionState((prev) => ({
                        ...prev,
                        totpEnabled: false,
                        totpVerified: true,
                        user: res.user || prev.user,
                      }));
                      notify('ok', 'Double authentification 2FA désactivée.');
                      await loadOverview();
                    } catch (e) {
                      notify('err', e instanceof Error ? e.message : 'Mot de passe invalide');
                    }
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export const AdminConsole: React.FC<AdminConsoleProps> = (props) => (
  <AdminErrorBoundary onExitAdmin={props.onExitAdmin}>
    <AdminConsoleInner {...props} />
  </AdminErrorBoundary>
);
