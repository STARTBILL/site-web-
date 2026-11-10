import React from 'react';
import { ArrowLeft, Handshake, Building2, CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { PARTENARIATS_CONTENT } from '../data/content';

interface PartnersPageProps {
  onNavigate: (pageId: string) => void;
  onPartnerInquiry: () => void;
}

export const PartnersPage: React.FC<PartnersPageProps> = ({ onNavigate, onPartnerInquiry }) => {
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
            <span>Retour à l'accueil</span>
          </button>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-blue-300">
            <span>STARTBILL</span>
            <span aria-hidden="true">/</span>
            <span className="text-blue-950 dark:text-white">Partenariats</span>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Écosystème & Coopération
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            {PARTENARIATS_CONTENT.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            {PARTENARIATS_CONTENT.introduction}
          </p>
          <p className="text-sm sm:text-base text-slate-700 dark:text-blue-200 leading-relaxed">
            {PARTENARIATS_CONTENT.courtTexte}
          </p>
        </div>

        {/* 3 Partnership Axes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-3">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Axe 01</span>
            <h3 className="text-xl font-bold text-blue-950 dark:text-white">Incubateurs & Accélérateurs</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
              Mise à disposition d'outils simplifiés et d'ateliers pratiques de gestion pour vos cohortes de créateurs d'entreprises.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-3">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Axe 02</span>
            <h3 className="text-xl font-bold text-blue-950 dark:text-white">Cabinets comptables</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
              Réception de données propres et traçables de vos clients (factures, reçus, écritures de vente) pour fluidifier les bilans.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-3">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Axe 03</span>
            <h3 className="text-xl font-bold text-blue-950 dark:text-white">Chambres & Associations</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
              Programmes de sensibilisation conjointe via STARTBILL Academy et diffusion de contenus pédagogiques adaptés aux marchés locaux.
            </p>
          </div>
        </div>

        {/* Invitation card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-950 text-white dark:bg-[#081730] border border-blue-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold">
              {PARTENARIATS_CONTENT.invitation.title}
            </h2>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              {PARTENARIATS_CONTENT.invitation.text}
            </p>
          </div>

          <button
            onClick={onPartnerInquiry}
            className="px-8 py-3.5 rounded-xl bg-white text-blue-950 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors whitespace-nowrap self-start md:self-auto shrink-0 shadow-sm"
          >
            {PARTENARIATS_CONTENT.invitation.action} →
          </button>
        </div>
      </div>
    </div>
  );
};
