/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WaitlistModal } from './components/WaitlistModal';
import { AuthModal } from './components/AuthModal';
import { RegionBlockedScreen, AuthUser } from './components/RegionBlockedScreen';
import { ArticleModal } from './components/ArticleModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { Article } from './data/content';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { isRegionActive } from './config/regions';
import { AdminConsole } from './app/admin/AdminConsole';
import type { AdminSectionId } from './app/admin/types';
import { adminApiRequest } from './utils/adminClient';
import { Wrench } from 'lucide-react';

// Dedicated Pages
import { HomePage } from './pages/HomePage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AboutPage } from './pages/AboutPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { SolutionsPage } from './pages/SolutionsPage';
import { PricingPage } from './pages/PricingPage';
import { AcademyPage } from './pages/AcademyPage';
import { BlogPage } from './pages/BlogPage';
import { PartnersPage } from './pages/PartnersPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';

export const VALID_PAGES = [
  'accueil',
  'simulateur',
  'a-propos',
  'fonctionnalites',
  'solutions',
  'tarifs',
  'academy',
  'blogue',
  'partenariats',
  'faq',
  'contact',
] as const;

export const VALID_ADMIN_SECTIONS: AdminSectionId[] = [
  'dashboard',
  'users',
  'regions',
  'billing',
  'invoices',
  'content',
  'communications',
  'support',
  'logs',
  'settings',
  'analytics',
];

export type PageId = typeof VALID_PAGES[number];

interface PublicConfigState {
  siteName: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  cms?: {
    heroTitleLine1?: string;
    heroTitleLine2?: string;
    heroSubtitle?: string;
    videoUrl?: string;
    marqueeText?: string;
  } | null;
}

const getAdminSectionFromLocation = (): AdminSectionId | null => {
  if (typeof window === 'undefined') return null;
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.replace(/^#/, '').toLowerCase();

  const candidate = pathname.startsWith('/admin')
    ? pathname
    : hash.startsWith('/admin') || hash.startsWith('admin')
    ? hash.startsWith('/')
      ? hash
      : `/${hash}`
    : null;

  if (!candidate) return null;
  const parts = candidate.split('/').filter(Boolean); // ['admin', 'dashboard'...]
  const sec = (parts[1] || 'dashboard') as AdminSectionId;
  return VALID_ADMIN_SECTIONS.includes(sec) ? sec : 'dashboard';
};

const getPageFromHash = (): PageId => {
  if (typeof window === 'undefined') return 'accueil';
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (VALID_PAGES.includes(hash as PageId)) {
    return hash as PageId;
  }
  return 'accueil';
};

function MainApp() {
  const [currentPage, setCurrentPage] = useState<PageId>(getPageFromHash);
  const [adminSection, setAdminSection] = useState<AdminSectionId | null>(
    getAdminSectionFromLocation
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('startbill_user');
      return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [publicConfig, setPublicConfig] = useState<PublicConfigState | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedLegal, setSelectedLegal] = useState<LegalDocType | null>(null);
  const [contactSubject, setContactSubject] = useState<string>('Information générale');
  const { lang } = useLanguage();

  const loadPublicConfig = useCallback(() => {
    fetch('/api/public/config')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setPublicConfig(data);
        }
      })
      .catch(() => {
        // Fallback silently on network failure
      });
  }, []);

  useEffect(() => {
    loadPublicConfig();
  }, [loadPublicConfig]);

  // Synchroniser la session Super Admin si elle existe déjà
  useEffect(() => {
    adminApiRequest('/api/auth/admin/session')
      .then(({ data }) => {
        if (
          data?.authenticated &&
          data?.totpVerified &&
          !data?.mustChangePassword &&
          data?.user
        ) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        // Ignore silent session check failure
      });
  }, []);

  // Initialize theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Keep page & /admin/* routes synced with URL hash and browser history
  useEffect(() => {
    const handleRouteChange = () => {
      const adminSec = getAdminSectionFromLocation();
      if (adminSec) {
        setAdminSection(adminSec);
        return;
      }
      setAdminSection(null);
      const page = getPageFromHash();
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Multi-page navigation handler
  const handleNavigate = (pageId: string) => {
    setAdminSection(null);
    const targetPage = VALID_PAGES.includes(pageId as PageId)
      ? (pageId as PageId)
      : 'accueil';

    setCurrentPage(targetPage);
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState({}, '', `/#${targetPage}`);
    } else {
      window.location.hash = targetPage;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAdmin = (section: AdminSectionId = 'dashboard') => {
    setAdminSection(section);
    window.location.hash = `/admin/${section}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePartnerInquiry = () => {
    setContactSubject(lang === 'fr' ? 'Partenariat' : 'Partnership');
    handleNavigate('contact');
  };

  const handleOpenAuth = (tab: 'login' | 'signup' = 'login') => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('startbill_user', JSON.stringify(user));
    } catch {
      // Ignore storage errors
    }
  };

  const handleLogout = async () => {
    if (currentUser?.role === 'super_admin') {
      try {
        await adminApiRequest('/api/auth/admin/logout', {
          method: 'POST',
        });
      } catch {
        // Ignore logout failure
      }
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('startbill_user');
    } catch {
      // Ignore storage errors
    }
  };

  // Routes /admin/* : protégées côté serveur ET via AdminAuthGate / useSuperAdmin()
  if (adminSection) {
    return (
      <AdminConsole
        section={adminSection}
        onSelectSection={(sec) => handleNavigateAdmin(sec)}
        onExitAdmin={() => handleNavigate('accueil')}
        nonAdminLoggedInEmail={currentUser?.email || null}
        onPublicConfigChanged={loadPublicConfig}
        onAdminSessionUserChange={(adminUser) => {
          if (adminUser) {
            setCurrentUser(adminUser);
          } else if (currentUser?.role === 'super_admin') {
            setCurrentUser(null);
          }
        }}
      />
    );
  }

  // Mode Maintenance activé depuis le panneau Admin (bloque le site public uniquement)
  if (publicConfig?.maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#071328] p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {publicConfig.siteName} — Maintenance en cours
          </h1>
          <p className="text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
            {publicConfig.maintenanceMessage}
          </p>
        </div>
      </div>
    );
  }

  // Blocage à la Connexion (Login) : si l'utilisateur appartient à une région inactive (ex: AF ou HT)
  if (currentUser && !isRegionActive(currentUser.region)) {
    return <RegionBlockedScreen user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#071328] text-slate-900 dark:text-blue-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors">
      {/* 3-Zone Navigation Header with Active Page indicator & Language Switcher */}
      <Header
        activeSection={currentPage}
        onNavigate={handleNavigate}
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenAdmin={() => handleNavigateAdmin('dashboard')}
      />

      {/* Dynamic Multi-Page Router View */}
      <main className="flex-1">
        {currentPage === 'accueil' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenWaitlist={() => setIsWaitlistOpen(true)}
            cmsOverrides={publicConfig?.cms || null}
          />
        )}

        {currentPage === 'simulateur' && (
          <SimulatorPage
            onNavigate={handleNavigate}
            onOpenWaitlist={() => setIsWaitlistOpen(true)}
          />
        )}

        {currentPage === 'a-propos' && (
          <AboutPage
            onNavigate={handleNavigate}
            onOpenWaitlist={() => setIsWaitlistOpen(true)}
          />
        )}

        {currentPage === 'fonctionnalites' && (
          <FeaturesPage
            onNavigate={handleNavigate}
            onOpenWaitlist={() => setIsWaitlistOpen(true)}
          />
        )}

        {currentPage === 'solutions' && (
          <SolutionsPage
            onNavigate={handleNavigate}
            onOpenWaitlist={() => setIsWaitlistOpen(true)}
          />
        )}

        {currentPage === 'tarifs' && (
          <PricingPage
            onNavigate={handleNavigate}
            onOpenWaitlist={() => setIsWaitlistOpen(true)}
          />
        )}

        {currentPage === 'academy' && (
          <AcademyPage
            onNavigate={handleNavigate}
            onOpenWaitlist={() => setIsWaitlistOpen(true)}
          />
        )}

        {currentPage === 'blogue' && (
          <BlogPage
            onNavigate={handleNavigate}
            onSelectArticle={(art) => setSelectedArticle(art)}
          />
        )}

        {currentPage === 'partenariats' && (
          <PartnersPage
            onNavigate={handleNavigate}
            onPartnerInquiry={handlePartnerInquiry}
          />
        )}

        {currentPage === 'faq' && (
          <FaqPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'contact' && (
          <ContactPage
            onNavigate={handleNavigate}
            initialSubject={contactSubject}
          />
        )}
      </main>

      {/* Global Multi-page Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenLegal={(type) => setSelectedLegal(type)}
      />

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />

      {/* Auth Modal (Login / Sign-up verrouillé Canada + routage sécurisé Admin) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authTab}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onRouteToAdmin={() => handleNavigateAdmin('dashboard')}
      />

      {/* Blog Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onOpenAcademy={() => handleNavigate('academy')}
      />

      {/* Legal Documents Modal */}
      <LegalModal
        type={selectedLegal}
        onClose={() => setSelectedLegal(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
