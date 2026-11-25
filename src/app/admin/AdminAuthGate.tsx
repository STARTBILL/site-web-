import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { SUPER_ADMIN_EMAIL } from '../../hooks/useSuperAdmin';
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
  onExitAdmin,
}) => {
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [email, setEmail] = useState(SUPER_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showResetUsersHint, setShowResetUsersHint] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [emailProviderDisabled, setEmailProviderDisabled] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const isForbiddenStandardUser =
    Boolean(nonAdminLoggedInEmail) &&
    nonAdminLoggedInEmail?.toLowerCase() !== SUPER_ADMIN_EMAIL;

  if (isForbiddenStandardUser && !sessionState.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#071328] p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#0c1e3d] border border-red-200 dark:border-red-900 rounded-2xl p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Accès refusé
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

  const unlockFirebaseSession = (fbUser: {
    uid: string;
    displayName: string | null;
    email: string | null;
  }) => {
    onSessionUpdated({
      authenticated: true,
      setupRequired: false,
      staticHostDetected: true,
      authMode: 'firebase',
      backendError: null,
      user: {
        id: fbUser.uid,
        fullName: fbUser.displayName || 'Ferline Zogni — Admin STARTBILL',
        email: fbUser.email || SUPER_ADMIN_EMAIL,
        role: 'super_admin',
        region: 'CA',
      },
      mustChangePassword: false,
      totpEnabled: false,
      totpVerified: true,
      csrfToken: 'firebase-auth',
    });
  };

  const resetFeedback = () => {
    setError(null);
    setInfo(null);
    setShowResetUsersHint(false);
    setUnauthorizedDomain(null);
    setEmailProviderDisabled(false);
  };

  const switchMode = (nextMode: 'login' | 'create') => {
    setMode(nextMode);
    resetFeedback();
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setLoading(true);
    try {
      const res = await signInAdminWithEmailPassword(email.trim(), password);
      if (!res.ok || !res.user) {
        if (res.emailProviderDisabled) {
          setEmailProviderDisabled(true);
        } else {
          setError(res.error || 'Identifiants invalides.');
        }
        return;
      }
      setPassword('');
      unlockFirebaseSession(res.user);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const res = await activateOrResetAdminCloudPassword(password);
      if (res.emailProviderDisabled) {
        setEmailProviderDisabled(true);
        return;
      }
      if (!res.ok) {
        setError(res.error || 'Impossible de créer l’accès administrateur.');
        return;
      }
      setPassword('');
      setConfirmPassword('');
      setMode('login');
      if (res.mode === 'reset_sent') {
        setShowResetUsersHint(true);
      }
      setInfo(res.message || 'Vérifiez votre boîte Gmail pour confirmer votre accès.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    resetFeedback();
    setLoading(true);
    try {
      const res = await activateOrResetAdminCloudPassword();
      if (res.emailProviderDisabled) {
        setEmailProviderDisabled(true);
        return;
      }
      if (!res.ok) {
        setError(res.error || 'Impossible d’envoyer le courriel de réinitialisation.');
        return;
      }
      setShowResetUsersHint(true);
      setInfo(
        res.message ||
          `Un lien de réinitialisation a été envoyé à ${SUPER_ADMIN_EMAIL}.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    resetFeedback();
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
      unlockFirebaseSession(res.user);
    } catch {
      setError('Erreur lors de la connexion Google.');
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

  const firebaseAuthSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;
  const firebaseAuthProvidersUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
  const firebaseAuthUsersUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#071328] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* En-tête */}
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
                  Compte unique sécurisé · STARTBILL
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

          {/* Onglets simples : Se connecter / Créer mon accès */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-blue-950/70 border border-slate-200 dark:border-blue-900">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-blue-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => switchMode('create')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                mode === 'create'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-blue-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Créer mon mot de passe
            </button>
          </div>

          {unauthorizedDomain && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-100 space-y-2.5">
              <p className="font-semibold">
                Domaine « {unauthorizedDomain} » à autoriser pour Google Sign-In
              </p>
              <p className="text-[11px] text-amber-900/90 dark:text-amber-200 leading-relaxed">
                Ajoutez <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 font-mono">{unauthorizedDomain}</code> dans <strong>Firebase Authentication → Settings → Authorized domains</strong>.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copié</span>
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <span>Ouvrir Firebase Auth</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {emailProviderDisabled && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-100 space-y-2.5">
              <p className="font-semibold">
                Activez la méthode « E-mail/Mot de passe » dans Firebase
              </p>
              <p className="text-[11px] text-amber-900/90 dark:text-amber-200 leading-relaxed">
                Dans Firebase Console → Authentication → Sign-in method, activez <strong>Email/Password</strong> puis enregistrez.
              </p>
              <a
                href={firebaseAuthProvidersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-600 hover:bg-amber-700 text-white"
              >
                <span>Ouvrir Sign-in method</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <span className="leading-relaxed">{info}</span>
              </div>
              {showResetUsersHint && (
                <a
                  href={firebaseAuthUsersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:underline pl-6"
                >
                  <span>Gérer l’utilisateur dans Firebase Console → Users</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {mode === 'login' ? (
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
                    disabled={loading}
                    onClick={handleForgotPassword}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Mot de passe oublié ?</span>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-blue-200 leading-relaxed">
                Définissez votre mot de passe pour <span className="font-semibold">{SUPER_ADMIN_EMAIL}</span> afin de vous connecter directement partout.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1.5">
                  Courriel administrateur
                </label>
                <input
                  type="email"
                  readOnly
                  value={SUPER_ADMIN_EMAIL}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-blue-950/70 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-600 dark:text-blue-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1.5">
                  Mot de passe (8 caractères minimum)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Création...' : 'Créer mon accès Administrateur'}</span>
              </button>
            </form>
          )}

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-blue-900" />
            <span className="mx-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-blue-400">
              ou
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-blue-900" />
          </div>

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
        </div>
      </div>
    </div>
  );
};
