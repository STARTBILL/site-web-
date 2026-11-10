import React, { useState } from 'react';
import { ArrowLeft, Check, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';
import { PRICING_CONTENT } from '../data/content';

interface PricingPageProps {
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, onOpenWaitlist }) => {
  const [pricingRegion, setPricingRegion] = useState<'canada' | 'afrique' | 'haiti'>('canada');
  const [isAnnualPricing, setIsAnnualPricing] = useState(false);

  const currentRegionPricing = PRICING_CONTENT.regions[pricingRegion];

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
            <span className="text-blue-950 dark:text-white">Tarifs</span>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Tarifs clairs & régionaux
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            {PRICING_CONTENT.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            {PRICING_CONTENT.subtitle}
          </p>

          <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-900 dark:text-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{PRICING_CONTENT.trialBadge}</span>
          </div>
        </div>

        {/* Controls: Region Selector + Monthly/Annual Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="inline-flex p-1 rounded-xl bg-blue-100/60 dark:bg-blue-950 border border-blue-200 dark:border-blue-900">
            <button
              onClick={() => setPricingRegion('canada')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                pricingRegion === 'canada'
                  ? 'bg-white dark:bg-blue-600 text-blue-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-blue-200 hover:text-blue-950 dark:hover:text-white'
              }`}
            >
              🇨🇦 Canada ($ CAD)
            </button>
            <button
              onClick={() => setPricingRegion('afrique')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                pricingRegion === 'afrique'
                  ? 'bg-white dark:bg-blue-600 text-blue-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-blue-200 hover:text-blue-950 dark:hover:text-white'
              }`}
            >
              🌍 Afrique francophone (FCFA)
            </button>
            <button
              onClick={() => setPricingRegion('haiti')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                pricingRegion === 'haiti'
                  ? 'bg-white dark:bg-blue-600 text-blue-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-blue-200 hover:text-blue-950 dark:hover:text-white'
              }`}
            >
              🇭🇹 Haïti (HTG)
            </button>
          </div>

          <div className="inline-flex items-center gap-2 p-1 px-3 rounded-xl bg-white dark:bg-[#0c1e3d] border border-blue-200 dark:border-blue-900 shadow-2xs">
            <button
              onClick={() => setIsAnnualPricing(false)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${
                !isAnnualPricing
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                  : 'text-slate-500 dark:text-blue-300'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsAnnualPricing(true)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                isAnnualPricing
                  ? 'text-white bg-blue-600'
                  : 'text-slate-500 dark:text-blue-300'
              }`}
            >
              <span>Annuel</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-400 text-blue-950 font-bold">
                −20 %
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {currentRegionPricing.plans.map((plan, idx) => {
            const isPopular = plan.popular;
            const price = isAnnualPricing ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={idx}
                className={`relative p-8 sm:p-10 rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'bg-white dark:bg-[#0c1e3d] border-2 border-blue-600 shadow-xl scale-[1.02] z-10'
                    : 'bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-xs">
                    Recommandé
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-blue-950 dark:text-white">
                      {plan.name}
                    </h2>
                    <span className="text-xs font-medium text-slate-500 dark:text-blue-300">
                      {currentRegionPricing.name}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 mb-6">
                    {plan.desc}
                  </p>

                  <div className="mb-6 pb-6 border-b border-blue-100 dark:border-blue-900/60">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-extrabold text-blue-950 dark:text-white tracking-tight">
                        {price}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-blue-300">
                        {plan.period}
                      </span>
                    </div>
                    {isAnnualPricing && plan.priceMonthly !== '0 $' && plan.priceMonthly !== '0 FCFA' && plan.priceMonthly !== '0 HTG' && (
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block mt-1.5">
                        Facturé annuellement avec −20 % de réduction
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-semibold text-blue-950 dark:text-white uppercase tracking-wider block">
                      Inclus dans ce forfait :
                    </span>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-blue-100">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onOpenWaitlist}
                  className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                    isPopular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      : 'bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-950 dark:text-blue-100 border border-blue-200 dark:border-blue-800'
                  }`}
                >
                  Rejoindre la liste d’attente
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ note on billing */}
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-blue-50/50 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 text-xs sm:text-sm text-slate-600 dark:text-blue-200 space-y-2">
          <strong className="text-blue-950 dark:text-white block font-bold">
            Note sur l'engagement et l'essai gratuit :
          </strong>
          <p>
            Les 5 jours d'essai gratuit sont appliqués sans carte de crédit lors de l'activation du compte. Aucun engagement de durée n'est exigé, vous êtes libre de faire évoluer votre forfait ou de revenir à la formule gratuite à tout moment.
          </p>
        </div>
      </div>
    </div>
  );
};
