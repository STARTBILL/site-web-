import React, { useState, useMemo } from 'react';
import { Search, Flag } from 'lucide-react';
import type { InvoiceView, AnalyticsView } from '../types';

interface InvoicesSectionProps {
  invoices: InvoiceView[];
  analytics: AnalyticsView;
  onToggleFlag: (invoiceId: string, flaggedFraud: boolean, reason?: string) => Promise<void>;
}

export const InvoicesSection: React.FC<InvoicesSectionProps> = ({
  invoices,
  analytics,
  onToggleFlag,
}) => {
  const [query, setQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (regionFilter !== 'ALL' && inv.region !== regionFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${inv.number} ${inv.userEmail} ${inv.clientName} ${inv.amount} ${inv.createdAt.slice(
          0,
          10
        )}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [invoices, query, regionFilter]);

  return (
    <div className="space-y-5">
      {/* Statistiques globales factures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <p className="text-xs text-slate-500 dark:text-blue-300">Montant moyen (CAD)</p>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {analytics.invoiceStats.avgAmountCad.toLocaleString('fr-CA')} $ CAD
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <p className="text-xs text-slate-500 dark:text-blue-300">Devise dominante</p>
          <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {analytics.invoiceStats.dominantCurrency}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <p className="text-xs text-slate-500 dark:text-blue-300">
            Factures suspectes (fraude)
          </p>
          <p className="text-xl font-bold font-mono tabular-nums text-red-600 dark:text-red-400 mt-1">
            {invoices.filter((i) => i.flaggedFraud).length}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par numéro, montant, date (YYYY-MM-DD) ou utilisateur..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-800 dark:text-white"
        >
          <option value="ALL">Toutes régions</option>
          <option value="CA">CA</option>
          <option value="AF">AF</option>
          <option value="HT">HT</option>
        </select>
      </div>

      {/* Table globale */}
      <div className="rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-blue-950/60 border-b border-slate-200 dark:border-blue-900 text-slate-600 dark:text-blue-200">
              <tr>
                <th className="py-3 px-4">Numéro</th>
                <th className="py-3 px-3">Émetteur / Client</th>
                <th className="py-3 px-3">Région</th>
                <th className="py-3 px-3 text-right">Montant</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-4 text-right">Fraude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/40">
              {filtered.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                    {inv.number}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-900 dark:text-white block">
                      {inv.userEmail}
                    </span>
                    <span className="text-slate-500 dark:text-blue-300">{inv.clientName}</span>
                  </td>
                  <td className="py-3 px-3 font-mono">{inv.region}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    {inv.amount.toLocaleString('fr-CA')} {inv.currency}
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-slate-500 dark:text-blue-300">
                    {new Date(inv.createdAt).toLocaleDateString('fr-CA')}
                  </td>
                  <td className="py-3 px-3 font-semibold">{inv.status}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        onToggleFlag(
                          inv.id,
                          !inv.flaggedFraud,
                          !inv.flaggedFraud ? 'Signalée manuellement pour contrôle' : undefined
                        )
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold ${
                        inv.flaggedFraud
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                          : 'bg-slate-100 dark:bg-blue-950 text-slate-600 dark:text-blue-300 hover:text-red-600'
                      }`}
                    >
                      <Flag className="w-3 h-3" />
                      <span>{inv.flaggedFraud ? 'Suspecte' : 'Signaler'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
