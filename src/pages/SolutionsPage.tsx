import React from 'react';
import { ArrowLeft, ArrowRight, Check, MapPin, Building2, User, Store } from 'lucide-react';
import { SOLUTIONS_CONTENT } from '../data/content';

interface SolutionsPageProps {
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({ onNavigate, onOpenWaitlist }) => {
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
            <span className="text-blue-950 dark:text-white">Solutions</span>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {SOLUTIONS_CONTENT.subtitle}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            {SOLUTIONS_CONTENT.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            {SOLUTIONS_CONTENT.description}
          </p>
        </div>

        {/* 3 Profiles in full depth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SOLUTIONS_CONTENT.segments.map((seg, idx) => (
            <div
              key={seg.id}
              className="p-8 rounded-3xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                  {idx === 0 && <User className="w-6 h-6" />}
                  {idx === 1 && <Store className="w-6 h-6" />}
                  {idx === 2 && <Building2 className="w-6 h-6" />}
                </div>

                <h2 className="text-2xl font-bold text-blue-950 dark:text-white mb-3">
                  {seg.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-blue-100/80 leading-relaxed mb-6">
                  {seg.description}
                </p>

                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-950 dark:text-white block">
                    Bénéfices ciblés :
                  </span>
                  <ul className="space-y-2.5">
                    {seg.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-blue-100">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-8 border-t border-blue-100 dark:border-blue-900/60">
                <button
                  onClick={onOpenWaitlist}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-300 text-xs font-semibold transition-all text-center"
                >
                  Manifester mon intérêt pour ce profil
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* L'approche internationale */}
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-50/50 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Adaptation aux contextes réels
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-blue-950 dark:text-white">
                {SOLUTIONS_CONTENT.approcheInternationale.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
                {SOLUTIONS_CONTENT.approcheInternationale.content}
              </p>

              <div className="space-y-3 pt-2">
                {SOLUTIONS_CONTENT.approcheInternationale.zones.map((zone, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-blue-950 dark:text-white">{zone.nom} : </strong>
                      <span className="text-slate-600 dark:text-blue-200">{zone.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900 aspect-4/3 shadow-sm">
                <img
                  src="/assets/images/global_hubs.webp"
                  alt="Hubs économiques et écosystèmes entrepreneuriaux internationaux"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
