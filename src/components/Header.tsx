import React, { useState } from 'react';
import { Menu, X, Sun, Moon, LogIn, LogOut, UserCheck, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';
import { ACTIVE_REGIONS, ALL_REGIONS, IS_MULTI_REGION } from '../config/regions';
import { RegionBadge } from './RegionBadge';
import type { AuthUser } from './RegionBlockedScreen';
import { useSuperAdmin } from '../hooks/useSuperAdmin';

interface HeaderProps {
  activeSection: string;
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: (tab?: 'login' | 'signup') => void;
  onLogout?: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
  onOpenWaitlist,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const t = TRANSLATIONS[lang];
  const { isSuperAdmin } = useSuperAdmin(currentUser);

  const navLinks = [
    { id: 'accueil', label: t.nav.accueil },
    { id: 'simulateur', label: t.nav.simulateur },
    { id: 'a-propos', label: t.nav.aPropos },
    { id: 'fonctionnalites', label: t.nav.fonctionnalites },
    { id: 'solutions', label: t.nav.solutions },
    { id: 'tarifs', label: t.nav.tarifs },
    { id: 'academy', label: t.nav.academy },
    { id: 'blogue', label: t.nav.blogue },
    { id: 'partenariats', label: t.nav.partenariats },
    { id: 'faq', label: t.nav.faq },
    { id: 'contact', label: t.nav.contact },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#071328]/95 backdrop-blur-md border-b border-blue-100 dark:border-blue-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Official Logo & Brand */}
        <button
          onClick={() => handleLinkClick('accueil')}
          className="flex items-center gap-2.5 hover:opacity-95 transition-opacity text-left shrink-0 py-1"
        >
          <img
            src="/assets/aistudio/logo_icon.webp"
            alt="Emblème STARTBILL"
            className="h-9 sm:h-10 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-extrabold tracking-tight leading-none">
              <span className="text-[#0A2540] dark:text-white">START</span>
              <span className="text-blue-600 dark:text-blue-400">BILL</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-blue-300 font-medium tracking-normal mt-0.5">
              {t.common.tagline}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Multi-page tabs) */}
        <nav className="hidden xl:flex items-center gap-3.5 2xl:gap-4.5 text-[13px] font-medium text-slate-600 dark:text-blue-200/80">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeSection === link.id
                  ? 'text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400'
                  : 'hover:text-blue-700 dark:hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Region Badge + Language Selector + Theme toggle + Auth/CTA + Mobile trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sélecteur multi-région masqué en mono-région ; remplacé par le badge statique 🇨🇦 Canada */}
          {IS_MULTI_REGION ? (
            <div className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-xs font-semibold">
              {ALL_REGIONS.filter((r) => ACTIVE_REGIONS.includes(r.code)).map((r) => (
                <span key={r.code} className="px-1.5 py-0.5 text-blue-950 dark:text-blue-100">
                  {r.flag} {lang === 'fr' ? r.label : r.labelEn}
                </span>
              ))}
            </div>
          ) : (
            <RegionBadge className="hidden md:inline-flex" />
          )}

          {/* Language Switcher Pill */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-xs font-bold">
            <button
              onClick={() => setLang('fr')}
              className={`px-2 py-1 rounded-md transition-colors ${
                lang === 'fr'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-blue-300 hover:text-blue-950 dark:hover:text-white'
              }`}
              title="Passer en Français"
            >
              FR
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-md transition-colors ${
                lang === 'en'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-blue-300 hover:text-blue-950 dark:hover:text-white'
              }`}
              title="Switch to English"
            >
              EN
            </button>
          </div>

          <button
            onClick={onToggleDarkMode}
            aria-label="Basculer le thème"
            className="p-2 text-blue-900/70 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-700" />}
          </button>

          {onOpenAuth && (
            currentUser ? (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-950 dark:text-white">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="max-w-[90px] truncate">{currentUser.fullName}</span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title={lang === 'fr' ? 'Se déconnecter' : 'Log out'}
                    className="p-0.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-900 dark:text-blue-100 bg-blue-50/70 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{lang === 'fr' ? 'Connexion' : 'Sign in'}</span>
              </button>
            )
          )}

          {/* Bouton Administration : visible EXCLUSIVEMENT pour contact.startbill@gmail.com (super_admin) */}
          {isSuperAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0A2540] hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Shield className="w-3.5 h-3.5 text-blue-300" />
              <span>Administration</span>
            </button>
          )}

          <button
            onClick={onOpenWaitlist}
            className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs active:scale-[0.98]"
          >
            {t.nav.joinWaitlist}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-blue-100 dark:border-blue-950 bg-white dark:bg-[#071328] px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <div className="flex items-center justify-between px-3 pb-2 border-b border-blue-100 dark:border-blue-900">
            <span className="text-[11px] font-bold text-slate-400 dark:text-blue-400 uppercase tracking-wider">
              {t.nav.pageTitle}
            </span>
            <div className="inline-flex items-center p-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              <button
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  lang === 'fr' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-blue-300'
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-blue-300'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`block w-full text-left py-2 px-3 text-sm font-medium rounded-xl transition-colors ${
                  activeSection === link.id
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-slate-700 dark:text-blue-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/30'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-blue-100 dark:border-blue-900 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <RegionBadge showCurrency />
              {onOpenAuth && (
                currentUser ? (
                  onLogout && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? 'Se déconnecter' : 'Log out'}</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? 'Connexion / Inscription' : 'Sign in / Sign up'}</span>
                  </button>
                )
              )}
            </div>
            {isSuperAdmin && onOpenAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-white bg-[#0A2540] hover:bg-blue-900 rounded-lg transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-blue-300" />
                <span>Administration</span>
              </button>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWaitlist();
              }}
              className="w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              {t.nav.joinWaitlist}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
