import React, { useState, useEffect } from 'react';
import { X, Mail, User, MapPin, Briefcase, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import {
  ACTIVE_REGIONS,
  ALL_REGIONS,
  DEFAULT_REGION_CODE,
  RegionCode,
} from '../config/regions';
import { useLanguage } from '../context/LanguageContext';
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
  const [profile, setProfile] = useState('autonome');
  const [region, setRegion] = useState<RegionCode>(DEFAULT_REGION_CODE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Filtrage strict par Feature Flag : seules les régions dans ACTIVE_REGIONS sont affichées au choix d'inscription
  const selectableRegions = ALL_REGIONS.filter((r) => ACTIVE_REGIONS.includes(r.code));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.requiresAdminAuth && onRouteToAdmin) {
        onClose();
        onRouteToAdmin();
        return;
      }
      if (!response.ok || !data.user) {
        setError(
          data.error ||
            (lang === 'fr' ? 'Impossible de se connecter.' : 'Unable to sign in.')
        );
        return;
      }
      onAuthSuccess(data.user);
      onClose();
    } catch {
      setError(
        lang === 'fr'
          ? 'Erreur réseau lors de la connexion.'
          : 'Network error during login.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          profile,
          region,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.user) {
        setError(
          data.error ||
            "StartBill n'est pas encore disponible dans votre région."
        );
        return;
      }
      onAuthSuccess(data.user);
      onClose();
    } catch {
      setError(
        lang === 'fr'
          ? "Erreur réseau lors de l'inscription."
          : 'Network error during sign-up.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTestAccount = (testEmail: string) => {
    setTab('login');
    setError(null);
    setEmail(testEmail);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          aria-label={lang === 'fr' ? 'Fermer' : 'Close'}
          className="absolute top-5 right-5 text-slate-400 hover:text-blue-950 dark:hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900 mb-6 mr-8">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
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
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
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
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
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
                  ? 'Connectez-vous avec votre courriel ou testez un profil régional.'
                  : 'Sign in with your email or test a regional profile.'}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@startbill.ca"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                />
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

            {/* Comptes de test pour vérifier le verrouillage CA vs blocage AF/HT */}
            <div className="pt-3 border-t border-blue-100 dark:border-blue-900/60 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-blue-300 block">
                {lang === 'fr' ? 'Comptes de test MVP :' : 'MVP Test Accounts:'}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.ca"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                />
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
                    {selectableRegions.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.flag} {lang === 'fr' ? r.label : r.labelEn} ({r.devise})
                      </option>
                    ))}
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
          </form>
        )}
      </div>
    </div>
  );
};
