import React from 'react';
import { ArrowLeft, Target, Compass } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';

interface AboutPageProps {
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenWaitlist }) => {
  const { lang } = useLanguage();
  const about = TRANSLATIONS[lang].about;
  const values = TRANSLATIONS[lang].values;
  const common = TRANSLATIONS[lang].common;
  const nav = TRANSLATIONS[lang].nav;

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Breadcrumb & Navigation Back */}
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
            <span className="text-blue-950 dark:text-white">{nav.aPropos}</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {lang === 'fr' ? 'Notre identité & Nos convictions' : 'Our Identity & Core Beliefs'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            {about.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            {about.content}
          </p>
        </div>

        {/* Mission & Vision split cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-blue-50/50 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              {lang === 'fr' ? 'Notre cap' : 'Our Direction'}
            </span>
            <h2 className="text-2xl font-bold text-blue-950 dark:text-white">
              {about.missionTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
              {about.missionContent}
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-blue-50/50 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              {lang === 'fr' ? 'Notre vision' : 'Our Vision'}
            </span>
            <h2 className="text-2xl font-bold text-blue-950 dark:text-white">
              {about.visionTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
              {about.visionContent}
            </p>
          </div>
        </div>

        {/* 3 Core Values (Short Version) */}
        <div className="space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {values.sectionBadge}
            </span>
            <h2 className="text-3xl font-extrabold text-blue-950 dark:text-white mt-1">
              {values.title}
            </h2>
            <p className="text-slate-600 dark:text-blue-200 text-sm mt-2">
              {values.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.items.map((val, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                  0{i + 1}. {lang === 'fr' ? 'VALEUR' : 'VALUE'}
                </span>
                <h3 className="text-xl font-bold text-blue-950 dark:text-white mt-2 mb-3">
                  {val.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-slate-600 dark:text-blue-200 text-center">
            {values.note}
          </div>
        </div>

        {/* Notre Ambition */}
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-950 text-white dark:bg-[#081730] border border-blue-900 shadow-xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            {lang === 'fr' ? 'Écosystème & Évolution' : 'Ecosystem & Evolution'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold">
            {about.ambitionTitle}
          </h2>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-3xl">
            {about.ambitionContent}
          </p>

          <div className="pt-6 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('academy')}
              className="px-6 py-3 rounded-xl bg-white text-blue-950 font-semibold text-xs sm:text-sm hover:bg-blue-50 transition-colors"
            >
              {lang === 'fr' ? 'Découvrir STARTBILL Academy →' : 'Discover STARTBILL Academy →'}
            </button>
            <button
              onClick={onOpenWaitlist}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-700 transition-colors"
            >
              {common.earlyPreviewBadge} · {nav.joinWaitlist}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
