import React from 'react';
import { Download, Printer } from 'lucide-react';
import type { AnalyticsView } from '../types';

interface AnalyticsSectionProps {
  analytics: AnalyticsView;
  onExportCsv: () => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  analytics,
  onExportCsv,
}) => {
  const maxGrowth = Math.max(1, ...analytics.activitySeries.map((s) => s.signups));

  return (
    <div className="space-y-6">
      {/* Actions Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Rapports analytiques & Performance
          </h2>
          <p className="text-xs text-slate-500 dark:text-blue-300">
            Exportez les indicateurs plateforme au format CSV ou PDF imprimable.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-blue-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-blue-950"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Santé technique */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <p className="text-xs text-slate-500 dark:text-blue-300">Disponibilité plateforme</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {analytics.performance.uptimePercent} %
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <p className="text-xs text-slate-500 dark:text-blue-300">Taux d’erreur API</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {analytics.performance.errorRatePercent} %
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <p className="text-xs text-slate-500 dark:text-blue-300">Latence P95</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-1">
            {analytics.performance.p95LatencyMs} ms
          </p>
        </div>
      </div>

      {/* Croissance + Utilisation fonctionnalités */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Croissance des utilisateurs (4 dernières semaines)
          </h3>
          <div className="grid grid-cols-4 gap-4 items-end h-44 pt-4">
            {analytics.activitySeries.map((pt) => {
              const h = Math.max(16, Math.round((pt.signups / maxGrowth) * 120));
              return (
                <div key={pt.label} className="flex flex-col items-center gap-2">
                  <span className="text-xs font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                    +{pt.signups}
                  </span>
                  <div
                    style={{ height: `${h}px` }}
                    className="w-10 rounded-t-lg bg-blue-600 dark:bg-blue-500"
                  />
                  <span className="text-xs text-slate-500 dark:text-blue-300">{pt.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Utilisation des fonctionnalités (OCR, Conseiller IA, Rapports)
          </h3>
          <div className="space-y-3">
            {analytics.featureUsage.map((f) => (
              <div key={f.feature} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-blue-100">
                    {f.feature}
                  </span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-blue-300">
                    {f.percent} % ({f.sessions} sessions)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-blue-950 overflow-hidden">
                  <div
                    style={{ width: `${f.percent}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
