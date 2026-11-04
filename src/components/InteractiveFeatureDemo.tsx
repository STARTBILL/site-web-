import React, { useState } from 'react';
import { FileText, Users, ShoppingBag, Receipt, CreditCard, TrendingUp, BarChart3, Globe, Sparkles, Plus, Trash2 } from 'lucide-react';
import { FONCTIONNALITES_CONTENT } from '../data/content';

type CurrencyMode = 'CAD' | 'XOF' | 'HTG';

export const InteractiveFeatureDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('facturation');
  const [currency, setCurrency] = useState<CurrencyMode>('CAD');

  // Facturation simulator state
  const [items, setItems] = useState([
    { id: 1, desc: 'Conseil en gestion de projet', qty: 10, rate: 85 },
    { id: 2, desc: 'Configuration des flux de facturation', qty: 1, rate: 450 },
  ]);

  const currencyConfig = {
    CAD: {
      symbol: '$ CAD',
      taxName: 'TPS (5%) + TVQ (9.975%)',
      taxRate: 0.14975,
      rateMultiplier: 1,
      locale: 'fr-CA',
    },
    XOF: {
      symbol: 'FCFA',
      taxName: 'TVA (18%)',
      taxRate: 0.18,
      rateMultiplier: 450,
      locale: 'fr-FR',
    },
    HTG: {
      symbol: 'HTG (Gourdes)',
      taxName: 'TCA / Retenue (10%)',
      taxRate: 0.10,
      rateMultiplier: 95,
      locale: 'fr-HT',
    },
  };

  const currentCfg = currencyConfig[currency];

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate * (currency === 'CAD' ? 1 : currentCfg.rateMultiplier / 10), 0);
  const taxAmount = subtotal * currentCfg.taxRate;
  const total = subtotal + taxAmount;

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), desc: 'Nouvelle prestation commerciale', qty: 1, rate: 120 },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  const updateItem = (id: number, field: 'desc' | 'qty' | 'rate', value: string | number) => {
    setItems(
      items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  return (
    <div className="bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-100 dark:border-blue-900/60">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Simulateur d'expérience en cours de conception
          </span>
          <h3 className="text-xl font-bold text-blue-950 dark:text-white mt-1">
            Explorer les capacités STARTBILL
          </h3>
          <p className="text-xs text-slate-500 dark:text-blue-200 mt-0.5">
            Testez l’ergonomie imaginée pour simplifier le quotidien financier d'un entrepreneur.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-blue-50 dark:bg-blue-950/60 rounded-lg shrink-0 border border-blue-100 dark:border-blue-900/50">
          <span className="text-xs font-medium text-blue-900/70 dark:text-blue-300 px-2">
            Région / Devise :
          </span>
          {(['CAD', 'XOF', 'HTG'] as CurrencyMode[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                currency === c
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-blue-900 dark:text-blue-200 hover:text-blue-700 dark:hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none border-b border-blue-100 dark:border-blue-900/40">
        {[
          { id: 'facturation', label: 'Facturation & Devis', icon: <FileText className="w-4 h-4" /> },
          { id: 'clients', label: 'Gestion des clients', icon: <Users className="w-4 h-4" /> },
          { id: 'depenses', label: 'Suivi des dépenses', icon: <Receipt className="w-4 h-4" /> },
          { id: 'tresorerie', label: 'Trésorerie & Rapports', icon: <TrendingUp className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/40'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Feature Simulator Body */}
      <div className="pt-6">
        {activeTab === 'facturation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-blue-50/40 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/60">
              <div>
                <span className="text-xs text-blue-900/70 dark:text-blue-300">Émetteur</span>
                <p className="text-sm font-semibold text-blue-950 dark:text-white">
                  Studio Conseil Entrepreneur Inc. (Montréal, QC)
                </p>
                <p className="text-xs text-slate-500 dark:text-blue-300">NEQ: 117892345 · Facture N° FACT-2026-0042</p>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-blue-900/70 dark:text-blue-300">Client destinataire</span>
                <p className="text-sm font-semibold text-blue-950 dark:text-white">
                  Société Partenaire & Associés
                </p>
                <p className="text-xs text-slate-500 dark:text-blue-300">Échéance : 30 jours nets</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-blue-100 dark:border-blue-900/60 text-slate-500 dark:text-blue-300 font-medium">
                    <th className="pb-3 w-1/2">Description de la prestation</th>
                    <th className="pb-3 text-right">Quantité / Heures</th>
                    <th className="pb-3 text-right">Tarif unitaire</th>
                    <th className="pb-3 text-right">Montant</th>
                    <th className="pb-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50 dark:divide-blue-900/30">
                  {items.map((item) => {
                    const unitPrice = item.rate * (currency === 'CAD' ? 1 : currentCfg.rateMultiplier / 10);
                    const rowTotal = item.qty * unitPrice;
                    return (
                      <tr key={item.id} className="group">
                        <td className="py-3 pr-2">
                          <input
                            type="text"
                            value={item.desc}
                            onChange={(e) => updateItem(item.id, 'desc', e.target.value)}
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 focus:outline-hidden p-1 text-xs sm:text-sm text-blue-950 dark:text-white"
                          />
                        </td>
                        <td className="py-3 text-right">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 text-right bg-blue-50/60 dark:bg-blue-950/80 rounded px-1.5 py-0.5 focus:outline-hidden text-xs sm:text-sm tabular-nums text-blue-950 dark:text-white border border-blue-100 dark:border-blue-900"
                          />
                        </td>
                        <td className="py-3 text-right tabular-nums text-slate-600 dark:text-blue-200">
                          {unitPrice.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {currentCfg.symbol}
                        </td>
                        <td className="py-3 text-right font-medium tabular-nums text-blue-950 dark:text-white">
                          {rowTotal.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {currentCfg.symbol}
                        </td>
                        <td className="py-3 text-center">
                          {items.length > 1 && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title="Supprimer la ligne"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors py-1.5 px-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une ligne au document</span>
              </button>

              <div className="w-full sm:w-64 space-y-1.5 text-xs sm:text-sm bg-blue-50/40 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-100 dark:border-blue-900/60">
                <div className="flex justify-between text-slate-600 dark:text-blue-200">
                  <span>Sous-total HT</span>
                  <span className="tabular-nums font-medium text-blue-950 dark:text-white">
                    {subtotal.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {currentCfg.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-blue-200">
                  <span>{currentCfg.taxName}</span>
                  <span className="tabular-nums font-medium text-blue-950 dark:text-white">
                    {taxAmount.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {currentCfg.symbol}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800 font-bold text-sm sm:text-base text-blue-950 dark:text-white">
                  <span>Total à payer</span>
                  <span className="tabular-nums text-blue-600 dark:text-blue-400">
                    {total.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {currentCfg.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-blue-200">
              Organisation centralisée de vos fiches clients et suivi des documents associés :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { name: 'Kaboré Logistique SARL', region: 'Ouagadougou, BF', invoices: 4, balance: 'À jour' },
                { name: 'Éditions Laurentides', region: 'Montréal, QC', invoices: 2, balance: 'En attente (15j)' },
                { name: 'Atelier Caraïbes Création', region: 'Port-au-Prince, HT', invoices: 6, balance: 'À jour' },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-white dark:bg-[#081730]">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{c.region}</span>
                  <h4 className="font-semibold text-sm text-blue-950 dark:text-white mt-0.5">{c.name}</h4>
                  <div className="mt-3 pt-2 border-t border-blue-50 dark:border-blue-900/40 flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-blue-300">{c.invoices} factures</span>
                    <span className={`font-semibold ${c.balance.includes('attente') ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {c.balance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'depenses' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-blue-200">
              Consignation hebdomadaire des charges pour conserver une vue structurée des sorties :
            </p>
            <div className="space-y-2">
              {[
                { label: 'Fournitures de bureau et équipement', cat: 'Matériel', amount: '185,00 $ CAD', date: 'Hier' },
                { label: 'Abonnement télécoms et fibre', cat: 'Services', amount: '75,00 $ CAD', date: 'Il y a 3 jours' },
                { label: 'Déplacement rendez-vous client', cat: 'Transport', amount: '42,50 $ CAD', date: 'Il y a 5 jours' },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-blue-100 dark:border-blue-900/60 bg-white dark:bg-[#081730] text-xs">
                  <div>
                    <span className="font-semibold text-blue-950 dark:text-white block">{d.label}</span>
                    <span className="text-slate-500 dark:text-blue-300">{d.cat} · {d.date}</span>
                  </div>
                  <span className="font-bold text-blue-950 dark:text-white tabular-nums">{d.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tresorerie' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-white dark:bg-[#081730]">
                <span className="text-xs text-slate-500 dark:text-blue-300">Total encaissé ce mois</span>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">+4 850 $ CAD</p>
              </div>
              <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-white dark:bg-[#081730]">
                <span className="text-xs text-slate-500 dark:text-blue-300">Dépenses engagées</span>
                <p className="text-lg font-bold text-slate-700 dark:text-blue-200 tabular-nums mt-1">-1 240 $ CAD</p>
              </div>
              <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-white dark:bg-[#081730]">
                <span className="text-xs text-slate-500 dark:text-blue-300">Factures en attente</span>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">2 100 $ CAD</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-blue-300 italic">
              Rappel : Les indicateurs et synthèses visuelles facilitent le suivi de l'activité mais ne remplacent pas une comptabilité professionnelle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
