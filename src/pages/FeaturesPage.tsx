import React from 'react';
import { ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';

interface FeaturesPageProps {
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate, onOpenWaitlist }) => {
  const { lang } = useLanguage();
  const features = TRANSLATIONS[lang].features;
  const common = TRANSLATIONS[lang].common;
  const nav = TRANSLATIONS[lang].nav;

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
            <span className="text-blue-950 dark:text-white">{nav.fonctionnalites}</span>
          </div>
        </div>

        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {features.badge}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            {features.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            {lang === 'fr'
              ? "De l'émission d'un premier devis jusqu'à l'encaissement effectif, découvrez l'ensemble des modules prévus pour simplifier la vie financière des entrepreneurs."
              : 'From issuing a first quote to actual cash collection, discover all modular tools designed to simplify financial management.'}
          </p>
        </div>

        {/* Disclaimer banner */}
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">
              {lang === 'fr' ? 'Note de statut de conception :' : 'Design Status Notice:'}
            </span>
            {features.note}
          </div>
        </div>

        {/* 8 Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.items.map((feat) => (
            <div
              key={feat.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-blue-950 dark:text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-100/80 leading-relaxed mb-3">
                  {feat.resume}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  {lang === 'fr' ? 'Objectif :' : 'Objective:'} {feat.objectif}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-blue-100 dark:border-blue-900/60 flex flex-wrap gap-1.5">
                {feat.tags.map((t, i) => (
                  <span key={i} className="text-[11px] text-slate-500 dark:text-blue-300">
                    {i > 0 && '· '}
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Long term notice */}
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-blue-950 dark:text-white">
              {features.longTermTitle}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
            {features.longTermDesc}
          </p>
        </div>

        {/* Bottom Banner to Simulator */}
        <div className="p-8 rounded-3xl bg-blue-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">
              {lang === 'fr'
                ? 'Envie de voir ces fonctionnalités en action ?'
                : 'Want to experience these features in action?'}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100">
              {lang === 'fr'
                ? "Découvrez notre simulateur interactif pour tester l'interface en direct."
                : 'Try our interactive simulator to test the interface directly.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('simulateur')}
            className="px-6 py-3 rounded-xl bg-white text-blue-950 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors whitespace-nowrap shadow-sm"
          >
            {lang === 'fr' ? 'Ouvrir le simulateur de facture →' : 'Open invoice simulator →'}
          </button>
        </div>
      </div>
    </div>
  );
};
