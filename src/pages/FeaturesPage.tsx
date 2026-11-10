import React from 'react';
import { ArrowLeft, ArrowRight, ShieldAlert, Sparkles, Calculator, CheckCircle2 } from 'lucide-react';
import { FONCTIONNALITES_CONTENT } from '../data/content';

interface FeaturesPageProps {
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate, onOpenWaitlist }) => {
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
            <span>Retour à l'accueil</span>
          </button>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-blue-300">
            <span>STARTBILL</span>
            <span aria-hidden="true">/</span>
            <span className="text-blue-950 dark:text-white">Fonctionnalités</span>
          </div>
        </div>

        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Plateforme tout-en-un
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            Les capacités de la plateforme
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            De l'émission d'un premier devis jusqu'à l'encaissement effectif, découvrez l'ensemble des modules prévus pour simplifier la vie financière des entrepreneurs.
          </p>
        </div>

        {/* Disclaimer banner */}
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Note de statut de conception :</span>
            {FONCTIONNALITES_CONTENT.note}
          </div>
        </div>

        {/* 8 Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FONCTIONNALITES_CONTENT.items.map((feat) => (
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
                  Objectif : {feat.objectif}
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

        {/* À plus long terme notice */}
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-blue-950 dark:text-white">
              {FONCTIONNALITES_CONTENT.longTerme.title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
            {FONCTIONNALITES_CONTENT.longTerme.text}
          </p>
        </div>

        {/* Bottom Banner to Simulator */}
        <div className="p-8 rounded-3xl bg-blue-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Envie de voir ces fonctionnalités en action ?</h3>
            <p className="text-xs sm:text-sm text-blue-100">
              Découvrez notre simulateur interactif pour tester l'interface en direct.
            </p>
          </div>
          <button
            onClick={() => onNavigate('simulateur')}
            className="px-6 py-3 rounded-xl bg-white text-blue-950 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors whitespace-nowrap shadow-sm"
          >
            Ouvrir le simulateur de facture →
          </button>
        </div>
      </div>
    </div>
  );
};
