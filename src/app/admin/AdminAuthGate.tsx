import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Smartphone,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Copy,
  Check,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { SUPER_ADMIN_EMAIL } from '../../hooks/useSuperAdmin';
import { adminApiRequest } from '../../utils/adminClient';
import {
  activateOrResetAdminCloudPassword,
  signInAdminWithEmailPassword,
  signInAdminWithGoogle,
} from '../../utils/firebaseAdminAdapter';
import firebaseConfig from '../../../firebase-applet-config.json';

export interface AdminSessionState {
  authenticated: boolean;
  setupRequired?: boolean;
  envManaged?: boolean;
  staticHostDetected?: boolean;
  authMode?: 'node' | 'firebase';
  backendError?: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    region: string;
  } | null;
  mustChangePassword: boolean;
  totpEnabled: boolean;
  totpVerified: boolean;
  csrfToken: string;
}

interface AdminAuthGateProps {
  sessionState: AdminSessionState;
  nonAdminLoggedInEmail?: string | null;
  onClearStandardSession?: () => Promise<void> | void;
  onSessionUpdated: (next: AdminSessionState) => void;
  onRetrySession?: () => void;
  onExitAdmin: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  sessionState,
  nonAdminLoggedInEmail,
  onClearStandardSession,
  onSessionUpdated,
  onRetrySession,
  onExitAdmin,
}) => {
  const [email, setEmail] = useState(SUPER_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Étape activation initiale (First-run Admin Claim)
  const [setupFullName, setSetupFullName] = useState('Ferline Zogni — Admin STARTBILL');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);

  // Étape changement mot de passe initial
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Étape 2FA TOTP (uniquement si 2FA activée par l'administrateur)
  const [totpCode, setTotpCode] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [emailProviderDisabled, setEmailProviderDisabled] = useState(false);
  const [showCloudActivation, setShowCloudActivation] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const isForbiddenStandardUser =
    Boolean(nonAdminLoggedInEmail) &&
    nonAdminLoggedInEmail?.toLowerCase() !== SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (
      sessionState.authenticated &&
      !sessionState.mustChangePassword &&
      sessionState.totpEnabled &&
      !sessionState.totpVerified &&
      sessionState.csrfToken
    ) {
      let active = true;
      adminApiRequest('/api/auth/admin/totp/setup', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': sessionState.csrfToken,
        },
      })
        .then(({ data }) => {
          if (!active || !data) return;
          if (data.alreadyEnrolled) {
            setAlreadyEnrolled(true);
          } else if (data.qrDataUrl) {
            setAlreadyEnrolled(false);
            setQrDataUrl(data.qrDataUrl);
            setManualSecret(data.secret);
          }
        })
        .catch(() => {
          // Ignore silent setup retry
        });
      return () => {
        active = false;
      };
    }
  }, [
    sessionState.authenticated,
    sessionState.mustChangePassword,
    sessionState.totpEnabled,
    sessionState.totpVerified,
    sessionState.csrfToken,
  ]);

  if (isForbiddenStandardUser && !sessionState.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#071328] p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#0c1e3d] border border-red-200 dark:border-red-900 rounded-2xl p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              403 Forbidden — Accès refusé
            </h1>
            <p className="text-sm text-slate-600 dark:text-blue-200">
              Le compte <span className="font-semibold">{nonAdminLoggedInEmail}</span> ne dispose pas des privilèges Super Administrateur.
            </p>
          </div>
          <div className="space-y-2.5">
            {onClearStandardSession && (
              <button
                type="button"
                onClick={() => onClearStandardSession()}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>Déconnecter ce compte et me connecter en Admin</span>
              </button>
            )}
            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-slate-700 dark:text-blue-200 border border-slate-200 dark:border-blue-800 hover:bg-slate-50 dark:hover:bg-blue-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retourner à l’accueil</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSetupClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (setupPassword !== setupConfirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const { status, data } = await adminApiRequest('/api/auth/admin/setup', {
        method: 'POST',
        body: JSON.stringify({
          email: SUPER_ADMIN_EMAIL,
          fullName: setupFullName.trim(),
          password: setupPassword,
        }),
      });
      if (status >= 400 || !data?.success) {
        setError(data?.error || 'Impossible d’activer le compte administrateur.');
        return;
      }
      setSetupPassword('');
      setSetupConfirm('');
      onSessionUpdated({
        authenticated: true,
        setupRequired: false,
        user: data.user,
        mustChangePassword: false,
        totpEnabled: Boolean(data.totpEnabled),
        totpVerified: Boolean(data.totpVerified),
        csrfToken: data.csrfToken,
      });
    } catch {
      setError('Erreur lors de la création du compte administrateur.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setUnauthorizedDomain(null);
    setEmailProviderDisabled(false);
    setShowCloudActivation(false);
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const { status, data } = await adminApiRequest('/api/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      if (data?.staticHostDetected || data?.isNonJson) {
        const fbRes = await signInAdminWithEmailPassword(cleanEmail, password);
        if (!fbRes.ok || !fbRes.user) {
          if (fbRes.emailProviderDisabled) {
            setEmailProviderDisabled(true);
          } else {
            setError(fbRes.error || 'Authentification administrateur refusée.');
            if (fbRes.invalidCredentials) {
              setShowCloudActivation(true);
            }
          }
          return;
        }
        setPassword('');
        onSessionUpdated({
          authenticated: true,
          setupRequired: false,
          staticHostDetected: true,
          authMode: 'firebase',
          backendError: null,
          user: {
            id: fbRes.user.uid,
            fullName: fbRes.user.displayName || 'Ferline Zogni — Admin STARTBILL',
            email: fbRes.user.email || SUPER_ADMIN_EMAIL,
            role: 'super_admin',
            region: 'CA',
          },
          mustChangePassword: false,
          totpEnabled: false,
          totpVerified: true,
          csrfToken: 'firebase-auth',
        });
        return;
      }
      if (data?.setupRequired) {
        onSessionUpdated({
          ...sessionState,
          setupRequired: true,
        });
        setError(data.error || 'Veuillez définir votre mot de passe administrateur initial.');
        return;
      }
      if (status >= 400 || !data?.success) {
        setError(data?.error || 'Authentification refusée.');
        return;
      }
      setCurrentPassword(password);
      setPassword('');
      onSessionUpdated({
        authenticated: true,
        setupRequired: false,
        authMode: 'node',
        user: data.user,
        mustChangePassword: Boolean(data.mustChangePassword),
        totpEnabled: Boolean(data.totpEnabled),
        totpVerified: Boolean(data.totpVerified),
        csrfToken: data.csrfToken,
      });
    } catch {
      setError('Erreur lors de la connexion administrateur.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCloudPassword = async () => {
    setError(null);
    setInfo(null);
    setEmailProviderDisabled(false);
    setLoading(true);
    try {
      const res = await activateOrResetAdminCloudPassword(password);
      if (res.emailProviderDisabled) {
        setEmailProviderDisabled(true);
        return;
      }
      if (!res.ok) {
        setError(res.error || 'Impossible d’activer le mot de passe Cloud.');
        return;
      }
      setShowCloudActivation(false);
      setInfo(res.message || 'Action effectuée. Vérifiez votre boîte Gmail.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setError(null);
    setInfo(null);
    setEmailProviderDisabled(false);
    setLoading(true);
    try {
      const res = await activateOrResetAdminCloudPassword();
      if (res.emailProviderDisabled) {
        setEmailProviderDisabled(true);
        return;
      }
      if (!res.ok) {
        setError(res.error || 'Impossible d’envoyer le lien de réinitialisation.');
        return;
      }
      setShowCloudActivation(false);
      setInfo(res.message || `Lien de réinitialisation envoyé à ${SUPER_ADMIN_EMAIL}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const { status, data } = await adminApiRequest('/api/auth/admin/change-password', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': sessionState.csrfToken,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (status >= 400 || !data?.success) {
        setError(data?.error || 'Impossible de modifier le mot de passe.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setInfo('Mot de passe mis à jour avec succès.');
      onSessionUpdated({
        ...sessionState,
        user: data.user,
        mustChangePassword: false,
      });
    } catch {
      setError('Erreur lors du changement de mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { status, data } = await adminApiRequest('/api/auth/admin/totp/verify', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': sessionState.csrfToken,
        },
        body: JSON.stringify({ code: totpCode.trim() }),
      });
      if (status >= 400 || !data?.success) {
        setError(data?.error || 'Code 2FA invalide.');
        return;
      }
      setTotpCode('');
      onSessionUpdated({
        ...sessionState,
        user: data.user,
        totpEnabled: true,
        totpVerified: true,
        csrfToken: data.csrfToken,
      });
    } catch {
      setError('Erreur lors de la vérification 2FA.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setInfo(null);
    setUnauthorizedDomain(null);
    setLoading(true);
    try {
      const res = await signInAdminWithGoogle();
      if (!res.ok || !res.user) {
        if (res.unauthorizedDomain) {
          setUnauthorizedDomain(res.unauthorizedDomain);
        } else {
          setError(res.error || 'Connexion Google refusée.');
        }
        return;
      }
      onSessionUpdated({
        authenticated: true,
        setupRequired: false,
        staticHostDetected: sessionState.staticHostDetected,
        authMode: 'firebase',
        backendError: null,
        user: {
          id: res.user.uid,
          fullName: res.user.displayName || 'Ferline Zogni — Admin STARTBILL',
          email: res.user.email || SUPER_ADMIN_EMAIL,
          role: 'super_admin',
          region: 'CA',
        },
        mustChangePassword: false,
        totpEnabled: false,
        totpVerified: true,
        csrfToken: 'firebase-auth',
      });
    } catch {
      setError('Erreur lors de la connexion Google Administrateur.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDomain = async () => {
    const domainToCopy = unauthorizedDomain || 'startbill.app';
    try {
      await navigator.clipboard.writeText(domainToCopy);
      setCopiedDomain(true);
      window.setTimeout(() => setCopiedDomain(false), 2500);
    } catch {
      // Ignore clipboard failures
    }
  };

  const isStaticCloudOnly = Boolean(sessionState.staticHostDetected);
  const visibleError = error || (!isStaticCloudOnly ? sessionState.backendError : null);
  const firebaseAuthSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;
  const firebaseAuthProvidersUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#071328] px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* En-tête conforme */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-800 flex items-center justify-center shrink-0">
                <img
                  src="/assets/aistudio/logo_icon.webp"
                  alt="STARTBILL"
                  className="h-6 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Espace Administrateur
                </h1>
                <p className="text-xs text-slate-500 dark:text-blue-300 mt-0.5">
                  Accès sécurisé · STARTBILL
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-blue-300 dark:hover:text-white transition-colors whitespace-nowrap pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour</span>
            </button>
          </div>

          {unauthorizedDomain && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-100 space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="font-semibold">
                    Domaine « {unauthorizedDomain} » à autoriser dans Firebase
                  </p>
                  <p className="text-amber-900/85 dark:text-amber-200/90 leading-relaxed">
                    Pour activer la connexion Google sur votre domaine de production :
                  </p>
                </div>
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-[11px] text-amber-900/90 dark:text-amber-200">
                <li>
                  Ouvrez <strong>Firebase Console</strong> → <strong>Authentication</strong> →{' '}
                  <strong>Settings</strong> → <strong>Authorized domains</strong>.
                </li>
                <li>
                  Cliquez sur <strong>Add domain</strong> et ajoutez{' '}
                  <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 font-mono">
                    {unauthorizedDomain}
                  </code>
                  .
                </li>
                <li>Revenez ici et cliquez sur <strong>Continuer avec Google</strong>.</li>
              </ol>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 hover:bg-amber-100/60 transition-colors"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Domaine copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier {unauthorizedDomain}</span>
                    </>
                  )}
                </button>
                <a
                  href={firebaseAuthSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                >
                  <span>Ouvrir Firebase Auth</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {emailProviderDisabled && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-100 space-y-3">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="font-semibold">
                    Activez la connexion E-mail/Mot de passe dans Firebase
                  </p>
                  <p className="text-amber-900/85 dark:text-amber-200/90 leading-relaxed">
                    Pour autoriser la connexion directe par courriel et mot de passe sur{' '}
                    <strong>{typeof window !== 'undefined' ? window.location.hostname : 'startbill.app'}</strong> :
                  </p>
                </div>
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-[11px] text-amber-900/90 dark:text-amber-200">
                <li>
                  Ouvrez <strong>Firebase Console</strong> → <strong>Authentication</strong> →{' '}
                  <strong>Sign-in method</strong>.
                </li>
                <li>
                  Cliquez sur <strong>Add new provider</strong> (ou <strong>E-mail/Mot de passe</strong>) et activez <strong>Email/Password</strong>, puis cliquez sur <strong>Save</strong>.
                </li>
                <li>Revenez ici et cliquez sur <strong>Se connecter</strong>.</li>
              </ol>
              <div className="pt-1">
                <a
                  href={firebaseAuthProvidersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                >
                  <span>Ouvrir Sign-in providers</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {visibleError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{visibleError}</span>
              </div>
              {!isStaticCloudOnly && sessionState.backendError && onRetrySession && (
                <button
                  type="button"
                  onClick={onRetrySession}
                  className="text-[11px] font-semibold underline hover:text-red-900 dark:hover:text-red-100"
                >
                  Réessayer
                </button>
              )}
            </div>
          )}

          {info && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>{info}</span>
            </div>
          )}

          {/* ÉTAPE 0 : Activation initiale du compte Super Admin */}
          {!sessionState.authenticated && !isStaticCloudOnly && sessionState.setupRequired && (
            <form onSubmit={handleSetupClaim} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold">Activation du compte Super Administrateur</p>
                  <p className="mt-0.5 text-blue-800/80 dark:text-blue-300">
                    Définissez votre mot de passe personnel pour accéder à la gestion complète de la plateforme.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Courriel administrateur
                </label>
                <input
                  type="email"
                  readOnly
                  value={SUPER_ADMIN_EMAIL}
                  className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-blue-950/70 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-600 dark:text-blue-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={setupFullName}
                    onChange={(e) => setSetupFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Mot de passe (12+ car., majuscule, minuscule, chiffre, symbole)
                </label>
                <div className="relative">
                  <input
                    type={showSetupPassword ? 'text' : 'password'}
                    required
                    minLength={12}
                    autoComplete="new-password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupPassword(!showSetupPassword)}
                    aria-label="Afficher ou masquer le mot de passe"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type={showSetupPassword ? 'text' : 'password'}
                  required
                  minLength={12}
                  autoComplete="new-password"
                  value={setupConfirm}
                  onChange={(e) => setSetupConfirm(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Activation...' : 'Activer le compte administrateur'}</span>
              </button>
            </form>
          )}

          {/* ÉTAPE 1 : Espace de connexion conforme (Email/Mot de passe + Google) */}
          {!sessionState.authenticated && (isStaticCloudOnly || !sessionState.setupRequired) && (
            <div className="space-y-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1.5">
                    Adresse courriel administrateur
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    placeholder="contact.startbill@gmail.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-medium text-slate-700 dark:text-blue-200">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCloudActivation(!showCloudActivation)}
                      className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      1re activation / Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Afficher ou masquer le mot de passe"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {showCloudActivation && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-blue-950/50 border border-slate-200 dark:border-blue-800 space-y-2.5 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-blue-100">
                      Initialiser ou réinitialiser votre accès par mot de passe
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-blue-300 leading-relaxed">
                      Première connexion sur ce domaine ? Saisissez le mot de passe souhaité ci-dessus (8+ caractères), puis activez l’accès Cloud ou recevez un lien par courriel sur{' '}
                      <span className="font-medium">{SUPER_ADMIN_EMAIL}</span>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleActivateCloudPassword}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Activer avec ce mot de passe</span>
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleSendResetEmail}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-semibold border border-slate-300 dark:border-blue-700 bg-white dark:bg-blue-950 text-slate-700 dark:text-blue-100 hover:bg-slate-100 dark:hover:bg-blue-900 disabled:opacity-60 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Recevoir un lien par courriel</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
                </button>
              </form>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-blue-900" />
                <span className="mx-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-blue-400">
                  ou
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-blue-900" />
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg text-sm font-semibold border border-slate-300 dark:border-blue-700 bg-white dark:bg-blue-950/60 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-blue-900/60 disabled:opacity-60 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                    />
                  </svg>
                  <span>Continuer avec Google</span>
                </button>
                <p className="text-[11px] text-center text-slate-500 dark:text-blue-300/80">
                  Compte autorisé : <span className="font-medium">{SUPER_ADMIN_EMAIL}</span>
                </p>
              </div>
            </div>
          )}

        {/* ÉTAPE 2 : Changement obligatoire du mot de passe si demandé */}
        {sessionState.authenticated && sessionState.mustChangePassword && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Veuillez définir un nouveau mot de passe personnel (12+ caractères, majuscule, minuscule, chiffre et symbole).
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                Mot de passe actuel
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Mise à jour...' : 'Enregistrer le nouveau mot de passe'}
            </button>
          </form>
        )}

        {/* ÉTAPE 3 : Validation 2FA TOTP (lorsqu'activée) */}
        {sessionState.authenticated &&
          !sessionState.mustChangePassword &&
          sessionState.totpEnabled &&
          !sessionState.totpVerified && (
            <form onSubmit={handleVerifyTotp} className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <Smartphone className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <span>
                  {alreadyEnrolled
                    ? 'Saisissez le code à 6 chiffres généré par Google Authenticator.'
                    : 'Scannez ce QR Code avec Google Authenticator pour valider la double authentification.'}
                </span>
              </div>

              {!alreadyEnrolled && qrDataUrl && (
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-blue-950/30 border border-slate-200 dark:border-blue-900">
                  <img
                    src={qrDataUrl}
                    alt="QR Code Google Authenticator STARTBILL"
                    className="w-44 h-44 rounded-lg bg-white p-2 border border-slate-200"
                  />
                  {manualSecret && (
                    <div className="text-center">
                      <span className="text-[11px] text-slate-500 dark:text-blue-300 block">
                        Clé manuelle (Base32) :
                      </span>
                      <code className="text-xs font-mono font-bold text-slate-900 dark:text-white select-all break-all">
                        {manualSecret}
                      </code>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Code TOTP à 6 chiffres
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-3 py-2.5 text-center text-lg font-mono tracking-[0.35em] bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {loading ? 'Vérification 2FA...' : 'Valider et accéder au panneau'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
