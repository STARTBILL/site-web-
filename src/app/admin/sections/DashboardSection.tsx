import React from 'react';
import type { AnalyticsView, RegionSettingView } from '../types';

interface DashboardSectionProps {
  analytics: AnalyticsView;
  regions: RegionSettingView[];
  onNavigateSection: (section: 'users' | 'regions' | 'billing' | 'invoices') => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  analytics,
  regions,
  onNavigateSection,
}) => {
  const maxInvoices = Math.max(1, ...analytics.activitySeries.map((d) => d.invoices));
  const maxSignups = Math.max(1, ...analytics.activitySeries.map((d) => d.signups));

  return (
    <div className="space-y-6">
      {/* KPI Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <p className="text-xs font-medium text-slate-500 dark:text-blue-300">
            Utilisateurs totaux
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {analytics.totalUsers}
          </p>
          <p className="text-xs text-slate-500 dark:text-blue-300 tabular-nums mt-2">
            CA {analytics.usersByRegion.CA} · AF {analytics.usersByRegion.AF} · HT{' '}
            {analytics.usersByRegion.HT}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <p className="text-xs font-medium text-slate-500 dark:text-blue-300">
            Factures créées (J / S / M)
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {analytics.invoicesCreated.day} / {analytics.invoicesCreated.week} /{' '}
            {analytics.invoicesCreated.month}
          </p>
          <p className="text-xs text-slate-500 dark:text-blue-300 tabular-nums mt-2">
            Total cumulé : {analytics.invoicesCreated.total} factures
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <p className="text-xs font-medium text-slate-500 dark:text-blue-300">
            Chiffre d’affaires total (CAD)
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">
            {analytics.totalRevenueCad.toLocaleString('fr-CA')} $ CAD
          </p>
          <p className="text-xs text-slate-500 dark:text-blue-300 tabular-nums mt-2">
            MRR actif : {analytics.mrrCad.toLocaleString('fr-CA')} $ CAD / mois
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <p className="text-xs font-medium text-slate-500 dark:text-blue-300">
            Conversion Free → Pro
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            {analytics.conversionFreeToPro} %
          </p>
          <p className="text-xs text-slate-500 dark:text-blue-300 mt-2">
            Factures signalées : {analytics.invoiceStats.flaggedCount}
          </p>
        </div>
      </div>

      {/* Graphiques d'activité + État des régions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Activité hebdomadaire : Nouveaux inscrits & Factures générées
              </h2>
              <p className="text-xs text-slate-500 dark:text-blue-300">
                Suivi consolidé sur les 4 dernières semaines
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-blue-200">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
                Factures
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                Inscrits
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 items-end h-48 pt-4 border-t border-slate-100 dark:border-blue-900/40">
            {analytics.activitySeries.map((item) => {
              const invHeight = Math.max(12, Math.round((item.invoices / maxInvoices) * 130));
              const sigHeight = Math.max(12, Math.round((item.signups / maxSignups) * 130));

              return (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-2 h-36">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-blue-200">
                        {item.invoices}
                      </span>
                      <div
                        style={{ height: `${invHeight}px` }}
                        className="w-6 rounded-t-md bg-blue-600 dark:bg-blue-500 transition-all"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-blue-200">
                        {item.signups}
                      </span>
                      <div
                        style={{ height: `${sigHeight}px` }}
                        className="w-6 rounded-t-md bg-emerald-500 dark:bg-emerald-400 transition-all"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-blue-200">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Répartition régionale */}
        <div className="lg:col-span-4 p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Utilisateurs par région
            </h2>
            <button
              onClick={() => onNavigateSection('regions')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Gérer
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-blue-900/40">
            {regions.map((reg) => {
              const count = analytics.usersByRegion[reg.code] ?? 0;
              return (
                <div key={reg.code} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {reg.label} ({reg.code})
                    </p>
                    <p className="text-xs text-slate-500 dark:text-blue-300">
                      {reg.devise} · {reg.active ? 'Active' : 'En attente'}
                    </p>
                  </div>
                  <span className="text-sm font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-blue-900/40 flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateSection('users')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Voir les utilisateurs →
            </button>
            <span className="text-slate-300 dark:text-blue-800">·</span>
            <button
              onClick={() => onNavigateSection('invoices')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Voir les factures →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
