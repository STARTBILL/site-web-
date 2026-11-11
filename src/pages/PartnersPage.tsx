import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';

interface PartnersPageProps {
  onNavigate: (pageId: string) => void;
  onPartnerInquiry: () => void;
}

export const PartnersPage: React.FC<PartnersPageProps> = ({ onNavigate, onPartnerInquiry }) => {
  const { lang } = useLanguage();
  const partnerships = TRANSLATIONS[lang].partnerships;
  const common = TRANSLATIONS[lang].common;
  const nav = TRANSLATIONS[lang].nav;

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('accueil')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{common.backToHome}</span>
          </button>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-blue-300">
            <span>STARTBILL</span>
            <span aria-hidden="true">/</span>
            <span className="text-blue-950 dark:text-white">{nav.partenariats}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {lang === 'fr' ? 'Écosystème & Coopération' : 'Ecosystem & Cooperation'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            {partnerships.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            {partnerships.introduction}
          </p>
          <p className="text-sm sm:text-base text-slate-700 dark:text-blue-200 leading-relaxed">
            {partnerships.courtTexte}
          </p>
        </div>

        {/* 3 Partnership Axes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-3">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {lang === 'fr' ? 'Axe 01' : 'Pillar 01'}
            </span>
            <h3 className="text-xl font-bold text-blue-950 dark:text-white">
              {lang === 'fr' ? 'Incubateurs & Accélérateurs' : 'Incubators & Accelerators'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
              {lang === 'fr'
                ? "Mise à disposition d'outils simplifiés et d'ateliers pratiques de gestion pour vos cohortes de créateurs d'entreprises."
                : 'Providing practical management software and workshops for your entrepreneur cohorts.'}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-3">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {lang === 'fr' ? 'Axe 02' : 'Pillar 02'}
            </span>
            <h3 className="text-xl font-bold text-blue-950 dark:text-white">
              {lang === 'fr' ? 'Cabinets comptables' : 'Accounting & CPA Firms'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
              {lang === 'fr'
                ? 'Réception de données propres et traçables de vos clients (factures, reçus, écritures de vente) pour fluidifier les bilans.'
                : 'Receive structured, auditable data from your clients (invoices, receipts, sales ledgers) to streamline fiscal year-ends.'}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-3">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {lang === 'fr' ? 'Axe 03' : 'Pillar 03'}
            </span>
            <h3 className="text-xl font-bold text-blue-950 dark:text-white">
              {lang === 'fr' ? 'Chambres & Associations' : 'Chambers & Trade Associations'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
              {lang === 'fr'
                ? 'Programmes de sensibilisation conjointe via STARTBILL Academy et diffusion de contenus pédagogiques adaptés aux marchés locaux.'
                : 'Joint educational awareness programs via STARTBILL Academy and distribution of localized guides.'}
            </p>
          </div>
        </div>

        {/* Invitation card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-950 text-white dark:bg-[#081730] border border-blue-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold">
              {partnerships.invitation.title}
            </h2>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              {partnerships.invitation.text}
            </p>
          </div>

          <button
            onClick={onPartnerInquiry}
            className="px-8 py-3.5 rounded-xl bg-white text-blue-950 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors whitespace-nowrap self-start md:self-auto shrink-0 shadow-sm"
          >
            {partnerships.invitation.action} →
          </button>
        </div>
      </div>
    </div>
  );
};
