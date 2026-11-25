import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  UserCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { ActiveSessionView } from '../types';

interface AdminAccountSectionProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    region: string;
  } | null;
  totpEnabled: boolean;
  isFirebaseMode?: boolean;
  hasCloudPassword?: boolean;
  activeSessions: ActiveSessionView[];
  totalUsersCount: number;
  waitlistCount: number;
  onUpdateProfile: (fullName: string) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onInitTotpSetup: () => Promise<{
    alreadyEnrolled?: boolean;
    secret?: string;
    qrDataUrl?: string;
  }>;
  onVerifyTotp: (code: string) => Promise<void>;
  onDisableTotp: (currentPassword: string) => Promise<void>;
}

export const AdminAccountSection: React.FC<AdminAccountSectionProps> = ({
  user,
  totpEnabled,
  isFirebaseMode = false,
  hasCloudPassword = false,
  activeSessions,
  totalUsersCount,
  waitlistCount,
  onUpdateProfile,
  onChangePassword,
  onInitTotpSetup,
  onVerifyTotp,
  onDisableTotp,
}) => {
  const [fullName, setFullName] = useState(user?.fullName || 'Super Administrateur STARTBILL');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [disablePw, setDisablePw] = useState('');
  const [busy2fa, setBusy2fa] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSavingProfile(true);
    try {
      await onUpdateProfile(fullName.trim());
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }
    setSavingPassword(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erreur lors du changement.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleStart2fa = async () => {
    setBusy2fa(true);
    try {
      const res = await onInitTotpSetup();
      if (res.qrDataUrl) {
        setQrDataUrl(res.qrDataUrl);
        setManualSecret(res.secret || null);
      }
    } finally {
      setBusy2fa(false);
    }
  };

  const handleConfirm2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy2fa(true);
    try {
      await onVerifyTotp(totpCode.trim());
      setQrDataUrl(null);
      setManualSecret(null);
      setTotpCode('');
    } finally {
      setBusy2fa(false);
    }
  };

  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy2fa(true);
    try {
      await onDisableTotp(disablePw);
      setDisablePw('');
    } finally {
      setBusy2fa(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Carte Identité & Gouvernance */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {user?.fullName || 'Super Administrateur STARTBILL'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  super_admin (immuable)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-blue-300 mt-1">
                {user?.email} · Accès global Canada, Afrique & Haïti
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-900">
              <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                {totalUsersCount}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-blue-300">Comptes gérés</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-900">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                {waitlistCount}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-blue-300">Liste d’attente</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-900">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {activeSessions.length || 1}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-blue-300">Session active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profil Administrateur */}
        <form
          onSubmit={handleSaveProfile}
          className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4"
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Informations du compte administrateur
            </h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
              Adresse courriel (verrouillée RBAC)
            </label>
            <input
              type="email"
              readOnly
              value={user?.email || ''}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-blue-950/60 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-500 dark:text-blue-300 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
              Nom d’affichage de l’administrateur
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-60 transition-colors"
          >
            {savingProfile ? 'Enregistrement...' : 'Mettre à jour le profil'}
          </button>
        </form>

        {/* Changement ou liaison de mot de passe */}
        <form
          onSubmit={handleSavePassword}
          className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isFirebaseMode
                  ? hasCloudPassword
                    ? 'Modifier le mot de passe Cloud'
                    : 'Définir un mot de passe Cloud'
                  : 'Modifier le mot de passe administrateur'}
              </h3>
            </div>
            {isFirebaseMode && (
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  hasCloudPassword
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                {hasCloudPassword ? 'Mot de passe lié' : 'Non lié au compte Google'}
              </span>
            )}
          </div>

          {isFirebaseMode && !hasCloudPassword && (
            <p className="text-xs text-slate-600 dark:text-blue-200 leading-relaxed">
              Associez un mot de passe à votre compte pour pouvoir vous connecter directement par courriel sur tous vos domaines (y compris startbill.app).
            </p>
          )}

          {passwordError && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {(!isFirebaseMode || hasCloudPassword) && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
                Mot de passe actuel
              </label>
              <input
                type="password"
                required={!isFirebaseMode || hasCloudPassword}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
                {isFirebaseMode
                  ? 'Nouveau mot de passe (8+ car.)'
                  : 'Nouveau mot de passe (12+ car.)'}
              </label>
              <input
                type="password"
                required
                minLength={isFirebaseMode ? 8 : 12}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
                Confirmer
              </label>
              <input
                type="password"
                required
                minLength={isFirebaseMode ? 8 : 12}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-blue-600 hover:opacity-90 text-white text-xs font-semibold disabled:opacity-60 transition-colors"
          >
            {savingPassword
              ? 'Enregistrement...'
              : isFirebaseMode && !hasCloudPassword
              ? 'Associer ce mot de passe Cloud'
              : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>

      {/* Double authentification 2FA (Google Authenticator) */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Double authentification (2FA Google Authenticator)
              </h3>
              <p className="text-xs text-slate-500 dark:text-blue-300">
                Protégez l’accès à votre console administrateur avec un code temporaire TOTP à 6 chiffres.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
              totpEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-blue-950/60 text-slate-600 dark:text-blue-300 border border-slate-200 dark:border-blue-800'
            }`}
          >
            {totpEnabled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>2FA Active</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>2FA Inactive</span>
              </>
            )}
          </span>
        </div>

        {!totpEnabled && !qrDataUrl && (
          <button
            type="button"
            disabled={busy2fa}
            onClick={handleStart2fa}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-60"
          >
            {busy2fa ? 'Préparation...' : 'Configurer Google Authenticator (2FA)'}
          </button>
        )}

        {!totpEnabled && qrDataUrl && (
          <form
            onSubmit={handleConfirm2fa}
            className="p-4 rounded-xl bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-900 flex flex-col sm:flex-row items-center gap-5"
          >
            <img
              src={qrDataUrl}
              alt="QR Code Google Authenticator STARTBILL"
              className="w-36 h-36 rounded-lg bg-white p-2 border border-slate-200 shrink-0"
            />
            <div className="space-y-3 flex-1 w-full">
              {manualSecret && (
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-blue-300 block">
                    Clé manuelle Base32 :
                  </span>
                  <code className="font-mono font-bold text-slate-900 dark:text-white select-all break-all">
                    {manualSecret}
                  </code>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Code à 6 chiffres"
                  className="px-3 py-2 text-xs font-mono tracking-widest bg-white dark:bg-[#071328] border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={busy2fa || totpCode.length !== 6}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-60"
                >
                  Activer la 2FA
                </button>
              </div>
            </div>
          </form>
        )}

        {totpEnabled && (
          <form onSubmit={handleDisable2fa} className="flex flex-wrap items-center gap-2 pt-2">
            <input
              type="password"
              required
              value={disablePw}
              onChange={(e) => setDisablePw(e.target.value)}
              placeholder="Mot de passe admin pour désactiver la 2FA"
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white min-w-[240px]"
            />
            <button
              type="submit"
              disabled={busy2fa || !disablePw}
              className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold disabled:opacity-50"
            >
              Désactiver la 2FA
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
