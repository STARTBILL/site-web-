import React from 'react';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';

interface AcademyPageProps {
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
}

export const AcademyPage: React.FC<AcademyPageProps> = ({ onNavigate, onOpenWaitlist }) => {
  const { lang } = useLanguage();
  const academy = TRANSLATIONS[lang].academy;
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
            <span className="text-blue-950 dark:text-white">{nav.academy}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{lang === 'fr' ? 'Sensibilisation & Formation continue' : 'Education & Continuous Training'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
              {academy.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-700 dark:text-blue-100 leading-relaxed">
              {academy.presentation}
            </p>
            <p className="text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
              {academy.ceQueVousYTrouverez}
            </p>

            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
              <strong className="text-blue-950 dark:text-white block mb-1">
                {lang === 'fr' ? 'Notre approche :' : 'Our Approach:'}
              </strong>
              {academy.notreApproche}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden border border-blue-100 dark:border-blue-900 shadow-xl aspect-4/3">
              <img
                src="/assets/images/academy_study.webp"
                alt="Entrepreneur se formant aux bases de la gestion financière"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 4 Interactive Educational Modules */}
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 dark:text-white">
            {lang === 'fr' ? 'Nos modules de sensibilisation' : 'Our Educational Modules'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {academy.modules.map((mod, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                    Module 0{i + 1}
                  </span>
                  <h3 className="text-lg font-bold text-blue-950 dark:text-white mt-1 mb-2">
                    {mod.titre}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed mb-4">
                    {mod.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-blue-100 dark:border-blue-900/60">
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase block mb-1.5">
                    {lang === 'fr' ? 'Notions abordées :' : 'Key Concepts:'}
                  </span>
                  <div className="space-y-1">
                    {mod.notions.map((n, idx) => (
                      <div key={idx} className="text-xs text-slate-700 dark:text-blue-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invitation block */}
        <div className="text-center max-w-3xl mx-auto p-8 rounded-3xl bg-blue-50/50 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 space-y-4">
          <h3 className="text-xl font-bold text-blue-950 dark:text-white">
            {lang === 'fr' ? 'Participez aux futures publications' : 'Contribute to Future Publications'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 max-w-xl mx-auto">
            {academy.invitation}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              {lang === 'fr'
                ? 'Proposer un thème à l’équipe pédagogique'
                : 'Suggest a topic to the academic team'}
            </button>
            <button
              onClick={() => onNavigate('blogue')}
              className="px-6 py-3 text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100 bg-white dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 transition-colors"
            >
              {lang === 'fr' ? 'Consulter nos articles de blogue →' : 'Read our blog articles →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
