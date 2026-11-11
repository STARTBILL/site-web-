/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WaitlistModal } from './components/WaitlistModal';
import { ArticleModal } from './components/ArticleModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { Article } from './data/content';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

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

export type PageId = typeof VALID_PAGES[number];

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedLegal, setSelectedLegal] = useState<LegalDocType | null>(null);
  const [contactSubject, setContactSubject] = useState<string>('Information générale');
  const { lang } = useLanguage();

  // Initialize theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Keep page in sync with URL hash changes (browser back/forward & direct links)
  useEffect(() => {
    const handleHashChange = () => {
      const page = getPageFromHash();
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Multi-page navigation handler
  const handleNavigate = (pageId: string) => {
    const targetPage = VALID_PAGES.includes(pageId as PageId)
      ? (pageId as PageId)
      : 'accueil';

    setCurrentPage(targetPage);
    window.location.hash = targetPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePartnerInquiry = () => {
    setContactSubject(lang === 'fr' ? 'Partenariat' : 'Partnership');
    handleNavigate('contact');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#071328] text-slate-900 dark:text-blue-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors">
      {/* 3-Zone Navigation Header with Active Page indicator & Language Switcher */}
      <Header
        activeSection={currentPage}
        onNavigate={handleNavigate}
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Dynamic Multi-Page Router View */}
      <main className="flex-1">
        {currentPage === 'accueil' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenWaitlist={() => setIsWaitlistOpen(true)}
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
