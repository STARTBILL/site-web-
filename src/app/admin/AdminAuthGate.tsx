import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  Smartphone,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SUPER_ADMIN_EMAIL } from '../../hooks/useSuperAdmin';

export interface AdminSessionState {
  authenticated: boolean;
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
  onSessionUpdated: (next: AdminSessionState) => void;
  onExitAdmin: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  sessionState,
  nonAdminLoggedInEmail,
  onSessionUpdated,
  onExitAdmin,
}) => {
  const [email, setEmail] = useState(SUPER_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Étape changement mot de passe initial
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Étape 2FA TOTP
  const [totpCode, setTotpCode] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isForbiddenStandardUser =
    Boolean(nonAdminLoggedInEmail) &&
    nonAdminLoggedInEmail?.toLowerCase() !== SUPER_ADMIN_EMAIL;

  // Charger le QR Code TOTP si le mot de passe a été validé et changé
  useEffect(() => {
    if (
      sessionState.authenticated &&
      !sessionState.mustChangePassword &&
      !sessionState.totpVerified &&
      sessionState.csrfToken
    ) {
      let active = true;
      fetch('/api/auth/admin/totp/setup', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionState.csrfToken,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!active) return;
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
          <button
            onClick={onExitAdmin}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retourner à l’accueil</span>
          </button>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentification refusée.');
        return;
      }
      setCurrentPassword(password);
      setPassword('');
      onSessionUpdated({
        authenticated: true,
        user: data.user,
        mustChangePassword: Boolean(data.mustChangePassword),
        totpEnabled: Boolean(data.totpEnabled),
        totpVerified: Boolean(data.totpVerified),
        csrfToken: data.csrfToken,
      });
    } catch {
      setError('Erreur réseau lors de la connexion administrateur.');
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
      const res = await fetch('/api/auth/admin/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionState.csrfToken,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Impossible de modifier le mot de passe.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setInfo('Mot de passe mis à jour. Veuillez maintenant valider votre code 2FA.');
      onSessionUpdated({
        ...sessionState,
        user: data.user,
        mustChangePassword: false,
      });
    } catch {
      setError('Erreur réseau lors du changement de mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin/totp/verify', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionState.csrfToken,
        },
        body: JSON.stringify({ code: totpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Code 2FA invalide.');
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
      setError('Erreur réseau lors de la vérification 2FA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#071328] p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/logo_icon.webp"
              alt="STARTBILL"
              className="h-8 w-auto object-contain"
            />
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                Console Super Administrateur
              </h1>
              <p className="text-xs text-slate-500 dark:text-blue-300">
                Accès restreint RBAC · 2FA obligatoire
              </p>
            </div>
          </div>
          <button
            onClick={onExitAdmin}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
          >
            Retour
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        {/* ÉTAPE 1 : Connexion Email + Mot de passe */}
        {!sessionState.authenticated && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                Email Super Administrateur
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
              <span>{loading ? 'Vérification...' : 'Vérifier mes identifiants'}</span>
            </button>
          </form>
        )}

        {/* ÉTAPE 2 : Changement obligatoire du mot de passe initial */}
        {sessionState.authenticated && sessionState.mustChangePassword && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Première connexion : vous devez définir un nouveau mot de passe personnel (12+ caractères, majuscule, minuscule, chiffre et symbole).
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

        {/* ÉTAPE 3 : Validation 2FA TOTP obligatoire */}
        {sessionState.authenticated &&
          !sessionState.mustChangePassword &&
          !sessionState.totpVerified && (
            <form onSubmit={handleVerifyTotp} className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <Smartphone className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <span>
                  {alreadyEnrolled
                    ? 'Saisissez le code à 6 chiffres généré par Google Authenticator.'
                    : 'Scannez ce QR Code avec Google Authenticator pour activer la double authentification obligatoire.'}
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
  );
};
