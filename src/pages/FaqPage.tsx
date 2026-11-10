import React, { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, HelpCircle, ArrowRight } from 'lucide-react';
import { FAQ_CONTENT } from '../data/content';

interface FaqPageProps {
  onNavigate: (pageId: string) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQ_CONTENT.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
            <span className="text-blue-950 dark:text-white">FAQ</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Questions & Réponses officielles
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            Foire aux questions
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            Retrouvez ici toutes les informations sur la disponibilité de STARTBILL, les tarifs régionaux, l'essai gratuit de 5 jours et les fonctionnalités incluses.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto pt-2">
            <Search className="w-4 h-4 text-blue-500 absolute left-3.5 top-5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une question ou un terme..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0c1e3d] border border-blue-200 dark:border-blue-900 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
            />
          </div>
        </div>

        {/* 5 Questions Accordion */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-blue-100 dark:border-blue-900/60 rounded-2xl bg-white dark:bg-[#0c1e3d] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-blue-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold shrink-0">
                      Q{idx + 1}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-blue-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm sm:text-base text-slate-600 dark:text-blue-100 border-t border-blue-100 dark:border-blue-900/40 pt-4 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="p-8 rounded-3xl bg-blue-50/50 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 text-center space-y-3">
          <h3 className="font-bold text-lg text-blue-950 dark:text-white">
            Vous ne trouvez pas la réponse à votre question ?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 max-w-md mx-auto">
            Notre équipe est à votre disposition pour vous orienter et répondre à vos questions particulières.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <span>Poser une question via le formulaire de contact</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
