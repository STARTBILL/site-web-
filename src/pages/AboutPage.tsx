import React from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Heart, Sparkles, Target, Compass, Users } from 'lucide-react';
import { A_PROPOS_CONTENT, SITE_METADATA } from '../data/content';

interface AboutPageProps {
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenWaitlist }) => {
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
            <span>Retour à l'accueil</span>
          </button>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-blue-300">
            <span>STARTBILL</span>
            <span aria-hidden="true">/</span>
            <span className="text-blue-950 dark:text-white">À propos</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Notre identité & Nos convictions
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            {A_PROPOS_CONTENT.quiSommesNous.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            {A_PROPOS_CONTENT.quiSommesNous.content}
          </p>
        </div>

        {/* Mission & Vision split cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-blue-50/50 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              Notre cap
            </span>
            <h2 className="text-2xl font-bold text-blue-950 dark:text-white">
              {A_PROPOS_CONTENT.mission.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
              {A_PROPOS_CONTENT.mission.content}
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-blue-50/50 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              Notre vision
            </span>
            <h2 className="text-2xl font-bold text-blue-950 dark:text-white">
              {A_PROPOS_CONTENT.vision.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
              {A_PROPOS_CONTENT.vision.content}
            </p>
          </div>
        </div>

        {/* 3 Core Values (Short Version requested) */}
        <div className="space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Socle éthique
            </span>
            <h2 className="text-3xl font-extrabold text-blue-950 dark:text-white mt-1">
              Nos 3 valeurs fondamentales
            </h2>
            <p className="text-slate-600 dark:text-blue-200 text-sm mt-2">
              Une démarche allégée et directe, orientée vers l'utilité concrète de chaque fonctionnalité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {A_PROPOS_CONTENT.valeurs.map((val, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                  0{i + 1}. VALEUR
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
            (L'apprentissage et l'amélioration continue restent présents via STARTBILL Academy et le blogue.)
          </div>
        </div>

        {/* Notre Ambition */}
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-950 text-white dark:bg-[#081730] border border-blue-900 shadow-xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Écosystème & Évolution
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold">
            {A_PROPOS_CONTENT.ambition.title}
          </h2>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-3xl">
            {A_PROPOS_CONTENT.ambition.content}
          </p>

          <div className="pt-6 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('academy')}
              className="px-6 py-3 rounded-xl bg-white text-blue-950 font-semibold text-xs sm:text-sm hover:bg-blue-50 transition-colors"
            >
              Découvrir STARTBILL Academy →
            </button>
            <button
              onClick={onOpenWaitlist}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-700 transition-colors"
            >
              Rejoindre la liste d'attente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
