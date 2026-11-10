import React from 'react';
import {
  Calculator,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  FileText,
  DollarSign,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { InteractiveFeatureDemo } from '../components/InteractiveFeatureDemo';

interface SimulatorPageProps {
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({ onNavigate, onOpenWaitlist }) => {
  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
            <span className="text-blue-950 dark:text-white">Simulateur</span>
          </div>
        </div>

        {/* Header Hero */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Outil interactif de test</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            Simulateur de facture en direct
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            Testez la simplicité de l'interface STARTBILL : saisissez vos articles, adaptez la devise et les taxes locales (Canada, Afrique francophone, Haïti) et simulez le suivi des encaissements.
          </p>
        </div>

        {/* 4 Steps Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-2xs">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Étape 01</span>
            <h3 className="font-bold text-sm text-blue-950 dark:text-white mt-1">Sélectionnez la région</h3>
            <p className="text-xs text-slate-500 dark:text-blue-300 mt-1">
              Devises automatiques : CAD, FCFA ou HTG avec leurs régimes fiscaux correspondants.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-2xs">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Étape 02</span>
            <h3 className="font-bold text-sm text-blue-950 dark:text-white mt-1">Ajoutez vos prestations</h3>
            <p className="text-xs text-slate-500 dark:text-blue-300 mt-1">
              Modifiez les descriptions, quantités et tarifs unitaires sans calculatrice.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-2xs">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Étape 03</span>
            <h3 className="font-bold text-sm text-blue-950 dark:text-white mt-1">Suivez les statuts</h3>
            <p className="text-xs text-slate-500 dark:text-blue-300 mt-1">
              Testez les états : Payée, Non payée, Partiellement payée ou En retard.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-2xs">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Étape 04</span>
            <h3 className="font-bold text-sm text-blue-950 dark:text-white mt-1">Générez le rendu</h3>
            <p className="text-xs text-slate-500 dark:text-blue-300 mt-1">
              Visualisez instantanément la facture finale prête à être expédiée à votre client.
            </p>
          </div>
        </div>

        {/* The Interactive Demo Simulator */}
        <div className="border border-blue-100 dark:border-blue-900/60 rounded-3xl p-4 sm:p-8 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs">
          <InteractiveFeatureDemo />
        </div>

        {/* Information & Trial Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-base text-blue-950 dark:text-white">
                Essai gratuit de 5 jours
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
              Dès l'ouverture des accès, bénéficiez de 5 jours complets pour tester STARTBILL gratuitement dans votre activité réelle, sans aucune carte de crédit requise.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-blue-950 text-white dark:bg-[#081730] border border-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base">Convaincu par la démonstration ?</h3>
              <p className="text-xs text-blue-200 mt-1">
                Rejoignez les entrepreneurs inscrits sur la liste d'attente prioritaire.
              </p>
            </div>
            <button
              onClick={onOpenWaitlist}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shadow-xs"
            >
              Rejoindre la liste d'attente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
