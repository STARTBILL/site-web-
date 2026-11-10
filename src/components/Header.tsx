import React, { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
  onOpenWaitlist,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'simulateur', label: 'Simulateur' },
    { id: 'a-propos', label: 'À propos' },
    { id: 'fonctionnalites', label: 'Fonctionnalités' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'tarifs', label: 'Tarifs' },
    { id: 'academy', label: 'Academy' },
    { id: 'blogue', label: 'Blogue' },
    { id: 'partenariats', label: 'Partenariats' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#071328]/95 backdrop-blur-md border-b border-blue-100 dark:border-blue-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
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
              Ton assistant financier
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Multi-page tabs) */}
        <nav className="hidden xl:flex items-center gap-4 2xl:gap-5 text-[13px] font-medium text-slate-600 dark:text-blue-200/80">
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

        {/* Zone 3: CTA + Dark mode + Mobile trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleDarkMode}
            aria-label="Basculer le thème"
            className="p-2 text-blue-900/70 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-700" />}
          </button>

          <button
            onClick={onOpenWaitlist}
            className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs active:scale-[0.98]"
          >
            Rejoindre la liste d’attente
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
        <div className="xl:hidden border-b border-blue-100 dark:border-blue-950 bg-white dark:bg-[#071328] px-4 pt-3 pb-6 space-y-1.5 shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 dark:text-blue-400 uppercase tracking-wider px-3 pb-1">
            Pages du site
          </div>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`block w-full text-left py-2.5 px-3 text-sm font-medium rounded-xl transition-colors ${
                activeSection === link.id
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
                  : 'text-slate-700 dark:text-blue-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/30'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-blue-100 dark:border-blue-900">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWaitlist();
              }}
              className="w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              Rejoindre la liste d’attente
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
