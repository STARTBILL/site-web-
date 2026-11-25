import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  User,
  MapPin,
  Briefcase,
  LogIn,
  UserPlus,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  ACTIVE_REGIONS,
  ALL_REGIONS,
  DEFAULT_REGION_CODE,
  RegionCode,
} from '../config/regions';
import { useLanguage } from '../context/LanguageContext';
import { SUPER_ADMIN_EMAIL } from '../hooks/useSuperAdmin';
import { submitUserLogin, submitUserSignup } from '../utils/authClient';
import { signInAdminWithEmailPassword } from '../utils/firebaseAdminAdapter';
import type { AuthUser } from './RegionBlockedScreen';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'signup';
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  onRouteToAdmin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onAuthSuccess,
  onRouteToAdmin,
}) => {
  const { lang } = useLanguage();
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState('autonome');
  const [region, setRegion] = useState<RegionCode>(DEFAULT_REGION_CODE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdminGateLink, setShowAdminGateLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
      setShowAdminGateLink(false);
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const switchTab = (nextTab: 'login' | 'signup') => {
    setTab(nextTab);
    setError(null);
    setShowAdminGateLink(false);
    setPassword('');
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowAdminGateLink(false);
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === SUPER_ADMIN_EMAIL) {
        if (!password) {
          if (onRouteToAdmin) {
            onClose();
            onRouteToAdmin();
          }
          return;
        }

        const fbRes = await signInAdminWithEmailPassword(cleanEmail, password);
        if (fbRes.ok && fbRes.user) {
          onAuthSuccess({
            id: fbRes.user.uid,
            fullName: fbRes.user.displayName || 'Ferline Zogni — Admin STARTBILL',
            email: fbRes.user.email || SUPER_ADMIN_EMAIL,
            role: 'super_admin',
            region: 'CA',
            currency: 'CAD',
            regionActive: true,
          });
          onClose();
          onRouteToAdmin?.();
          return;
        }

        setError(
          fbRes.error ||
            (lang === 'fr'
              ? 'Connexion administrateur impossible.'
              : 'Unable to sign in as admin.')
        );
        setShowAdminGateLink(true);
        return;
      }

      const result = await submitUserLogin({ email, password });
      if (result.requiresAdminAuth && onRouteToAdmin) {
        onClose();
        onRouteToAdmin();
        return;
      }
      if (!result.ok || !result.user) {
        setError(
          result.error ||
            (lang === 'fr' ? 'Impossible de se connecter.' : 'Unable to sign in.')
        );
        return;
      }
      onAuthSuccess(result.user);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await submitUserSignup({
        fullName,
        email,
        password,
        profile,
        region,
      });
      if (!result.ok || !result.user) {
        setError(
          result.error ||
            "StartBill n'est pas encore disponible dans votre région."
        );
        return;
      }
      onAuthSuccess(result.user);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTestAccount = async (testEmail: string) => {
    setTab('login');
    setError(null);
    setEmail(testEmail);
    setPassword('');
    setIsLoading(true);
    try {
      const result = await submitUserLogin({
        email: testEmail,
        isDemoQuickLogin: true,
      });
      if (result.ok && result.user) {
        onAuthSuccess(result.user);
        onClose();
        return;
      }
      setError(result.error || 'Connexion test indisponible.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'fr' ? 'Fermer' : 'Close'}
          className="absolute top-5 right-5 text-slate-400 hover:text-blue-950 dark:hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Onglets Connexion / Inscription */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900 mb-6 mr-8">
          <button
            type="button"
            onClick={() => switchTab('login')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              tab === 'login'
                ? 'bg-white dark:bg-blue-600 text-blue-950 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-blue-300'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Connexion' : 'Log in'}</span>
          </button>
          <button
            type="button"
            onClick={() => switchTab('signup')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              tab === 'signup'
                ? 'bg-white dark:bg-blue-600 text-blue-950 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-blue-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Inscription' : 'Sign up'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {showAdminGateLink && onRouteToAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRouteToAdmin();
                }}
                className="text-[11px] font-semibold underline hover:text-red-900 dark:hover:text-red-100"
              >
                {lang === 'fr'
                  ? 'Ouvrir l’assistant de connexion Admin →'
                  : 'Open Admin Sign-in Assistant →'}
              </button>
            )}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-blue-950 dark:text-white">
                {lang === 'fr' ? 'Accéder à votre espace' : 'Sign in to STARTBILL'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-blue-200 mt-1">
                {lang === 'fr'
                  ? 'Connectez-vous avec votre courriel et votre mot de passe.'
                  : 'Sign in with your email and password.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                {lang === 'fr' ? 'Adresse courriel *' : 'Email address *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.ca"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                {lang === 'fr' ? 'Mot de passe *' : 'Password *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={email.trim().toLowerCase() !== 'contact.startbill@gmail.com'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors shadow-xs"
            >
              {isLoading
                ? lang === 'fr'
                  ? 'Connexion...'
                  : 'Signing in...'
                : lang === 'fr'
                ? 'Se connecter'
                : 'Sign in'}
            </button>

            <p className="text-center text-xs text-slate-600 dark:text-blue-200">
              {lang === 'fr' ? 'Pas encore de compte ?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {lang === 'fr' ? 'Créer un compte Canada' : 'Create an account'}
              </button>
            </p>

            {/* Comptes de test pour vérifier le verrouillage CA vs blocage AF/HT en 1 clic */}
            <div className="pt-3 border-t border-blue-100 dark:border-blue-900/60 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-blue-300 block">
                {lang === 'fr' ? 'Accès rapide (comptes de test MVP) :' : 'Quick access (MVP test accounts):'}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickTestAccount('demo@startbill.ca')}
                  className="text-left px-3 py-1.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs text-blue-900 dark:text-blue-100 flex items-center justify-between transition-colors"
                >
                  <span>🇨🇦 demo@startbill.ca</span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    CA (Actif)
                  </span>
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickTestAccount('test-af@startbill.ca')}
                  className="text-left px-3 py-1.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs text-amber-950 dark:text-amber-200 flex items-center justify-between transition-colors"
                >
                  <span>🌍 test-af@startbill.ca</span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    AF (Bientôt)
                  </span>
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickTestAccount('test-ht@startbill.ca')}
                  className="text-left px-3 py-1.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs text-amber-950 dark:text-amber-200 flex items-center justify-between transition-colors"
                >
                  <span>🇭🇹 test-ht@startbill.ca</span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    HT (Bientôt)
                  </span>
                </button>
              </div>
            </div>

            {onRouteToAdmin && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRouteToAdmin();
                  }}
                  className="text-xs font-medium text-slate-500 dark:text-blue-300 hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  {lang === 'fr'
                    ? 'Espace Super Administrateur →'
                    : 'Super Admin Console →'}
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-blue-950 dark:text-white">
                {lang === 'fr' ? 'Créer un compte STARTBILL' : 'Create a STARTBILL account'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-blue-200 mt-1">
                {lang === 'fr'
                  ? 'Ouvert exclusivement aux entrepreneurs du Canada (CAD) pour la V1.'
                  : 'Exclusively open to Canadian businesses (CAD) for V1 launch.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                {lang === 'fr' ? 'Nom complet / Entreprise *' : 'Full name / Company *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sophie Tremblay"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                {lang === 'fr' ? 'Adresse courriel professionnelle *' : 'Work email *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.ca"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                {lang === 'fr'
                  ? 'Mot de passe * (minimum 8 caractères)'
                  : 'Password * (minimum 8 characters)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  {lang === 'fr' ? 'Profil' : 'Profile'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                  >
                    <option value="autonome">
                      {lang === 'fr' ? 'Travailleur autonome' : 'Freelancer'}
                    </option>
                    <option value="commercant">
                      {lang === 'fr' ? 'Commerçant' : 'Merchant'}
                    </option>
                    <option value="pme">PME / SMB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  {lang === 'fr' ? 'Région *' : 'Region *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as RegionCode)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                  >
                    {ALL_REGIONS.map((r) => {
                      const active = ACTIVE_REGIONS.includes(r.code);
                      return (
                        <option key={r.code} value={r.code} disabled={!active}>
                          {r.flag} {lang === 'fr' ? r.label : r.labelEn} ({r.devise})
                          {!active
                            ? lang === 'fr'
                              ? ' — Bientôt disponible'
                              : ' — Coming soon'
                            : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors shadow-xs"
            >
              {isLoading
                ? lang === 'fr'
                  ? 'Création...'
                  : 'Creating...'
                : lang === 'fr'
                ? 'Créer mon compte Canada'
                : 'Create Canada account'}
            </button>

            <p className="text-center text-xs text-slate-600 dark:text-blue-200">
              {lang === 'fr' ? 'Déjà inscrit ?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => switchTab('login')}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {lang === 'fr' ? 'Se connecter' : 'Sign in'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
