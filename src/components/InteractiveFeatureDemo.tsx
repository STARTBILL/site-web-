import React, { useState } from 'react';
import { FileText, Users, Receipt, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type CurrencyMode = 'CAD' | 'XOF' | 'HTG';

export const InteractiveFeatureDemo: React.FC = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('facturation');
  const [currency, setCurrency] = useState<CurrencyMode>('CAD');

  // Facturation simulator state
  const [items, setItems] = useState([
    {
      id: 1,
      desc: lang === 'fr' ? 'Conseil en gestion de projet' : 'Project Management Consulting',
      qty: 10,
      rate: 85,
    },
    {
      id: 2,
      desc: lang === 'fr' ? 'Configuration des flux de facturation' : 'Invoicing Workflow Setup',
      qty: 1,
      rate: 450,
    },
  ]);

  const currencyConfig = {
    CAD: {
      symbol: '$ CAD',
      taxName: lang === 'fr' ? 'TPS (5%) + TVQ (9.975%)' : 'GST (5%) + QST (9.975%)',
      taxRate: 0.14975,
      rateMultiplier: 1,
      locale: lang === 'fr' ? 'fr-CA' : 'en-CA',
    },
    XOF: {
      symbol: 'FCFA',
      taxName: lang === 'fr' ? 'TVA (18%)' : 'VAT (18%)',
      taxRate: 0.18,
      rateMultiplier: 450,
      locale: lang === 'fr' ? 'fr-FR' : 'en-US',
    },
    HTG: {
      symbol: 'HTG (Gourdes)',
      taxName: lang === 'fr' ? 'TCA / Retenue (10%)' : 'TCA / Withholding (10%)',
      taxRate: 0.10,
      rateMultiplier: 95,
      locale: lang === 'fr' ? 'fr-HT' : 'en-US',
    },
  };

  const currentCfg = currencyConfig[currency];

  const subtotal = items.reduce(
    (sum, item) => sum + item.qty * item.rate * (currency === 'CAD' ? 1 : currentCfg.rateMultiplier / 10),
    0
  );
  const taxAmount = subtotal * currentCfg.taxRate;
  const total = subtotal + taxAmount;

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        desc: lang === 'fr' ? 'Nouvelle prestation commerciale' : 'New Commercial Service',
        qty: 1,
        rate: 120,
      },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  const updateItem = (id: number, field: 'desc' | 'qty' | 'rate', value: string | number) => {
    setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  return (
    <div className="bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-100 dark:border-blue-900/60">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {lang === 'fr' ? "Simulateur d'expérience en cours de conception" : 'Interactive Experience Simulator'}
          </span>
          <h3 className="text-xl font-bold text-blue-950 dark:text-white mt-1">
            {lang === 'fr' ? 'Explorer les capacités STARTBILL' : 'Explore STARTBILL Capabilities'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-blue-200 mt-0.5">
            {lang === 'fr'
              ? "Testez l’ergonomie imaginée pour simplifier le quotidien financier d'un entrepreneur."
              : 'Test the intuitive interface designed to streamline daily financial administration.'}
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-blue-50 dark:bg-blue-950/60 rounded-lg shrink-0 border border-blue-100 dark:border-blue-900/50">
          <span className="text-xs font-medium text-blue-900/70 dark:text-blue-300 px-2">
            {lang === 'fr' ? 'Région / Devise :' : 'Region / Currency:'}
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
          {
            id: 'facturation',
            label: lang === 'fr' ? 'Facturation & Devis' : 'Invoices & Estimates',
            icon: <FileText className="w-4 h-4" />,
          },
          {
            id: 'clients',
            label: lang === 'fr' ? 'Gestion des clients' : 'Client Management',
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: 'depenses',
            label: lang === 'fr' ? 'Suivi des dépenses' : 'Expense Tracking',
            icon: <Receipt className="w-4 h-4" />,
          },
          {
            id: 'tresorerie',
            label: lang === 'fr' ? 'Trésorerie & Rapports' : 'Cash Flow & Reports',
            icon: <TrendingUp className="w-4 h-4" />,
          },
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
                <span className="text-xs text-blue-900/70 dark:text-blue-300">
                  {lang === 'fr' ? 'Émetteur' : 'Issuer'}
                </span>
                <p className="text-sm font-semibold text-blue-950 dark:text-white">
                  Studio Conseil Entrepreneur Inc. (Montréal, QC)
                </p>
                <p className="text-xs text-slate-500 dark:text-blue-300">NEQ: 117892345 · Invoice N° FACT-2026-0042</p>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-blue-900/70 dark:text-blue-300">
                  {lang === 'fr' ? 'Client destinataire' : 'Recipient Client'}
                </span>
                <p className="text-sm font-semibold text-blue-950 dark:text-white">
                  Société Partenaire & Associés
                </p>
                <p className="text-xs text-slate-500 dark:text-blue-300">
                  {lang === 'fr' ? 'Échéance : 30 jours nets' : 'Payment Term: Net 30 days'}
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-blue-100 dark:border-blue-900/60 text-slate-500 dark:text-blue-300 font-medium">
                    <th className="pb-3 w-1/2">
                      {lang === 'fr' ? 'Description de la prestation' : 'Item Description'}
                    </th>
                    <th className="pb-3 text-right">
                      {lang === 'fr' ? 'Quantité / Heures' : 'Qty / Hours'}
                    </th>
                    <th className="pb-3 text-right">
                      {lang === 'fr' ? 'Tarif unitaire' : 'Unit Price'}
                    </th>
                    <th className="pb-3 text-right">
                      {lang === 'fr' ? 'Montant' : 'Amount'}
                    </th>
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
                          {unitPrice.toLocaleString(currentCfg.locale, { maximumFractionDigits: 2 })} {currentCfg.symbol}
                        </td>
                        <td className="py-3 text-right font-medium tabular-nums text-blue-950 dark:text-white">
                          {rowTotal.toLocaleString(currentCfg.locale, { maximumFractionDigits: 2 })} {currentCfg.symbol}
                        </td>
                        <td className="py-3 text-center">
                          {items.length > 1 && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title={lang === 'fr' ? 'Supprimer la ligne' : 'Delete line'}
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
                <span>{lang === 'fr' ? 'Ajouter une ligne au document' : 'Add item row'}</span>
              </button>

              <div className="w-full sm:w-64 space-y-1.5 text-xs sm:text-sm bg-blue-50/40 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-100 dark:border-blue-900/60">
                <div className="flex justify-between text-slate-600 dark:text-blue-200">
                  <span>{lang === 'fr' ? 'Sous-total HT' : 'Subtotal Excl. Tax'}</span>
                  <span className="tabular-nums font-medium text-blue-950 dark:text-white">
                    {subtotal.toLocaleString(currentCfg.locale, { maximumFractionDigits: 2 })} {currentCfg.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-blue-200">
                  <span>{currentCfg.taxName}</span>
                  <span className="tabular-nums font-medium text-blue-950 dark:text-white">
                    {taxAmount.toLocaleString(currentCfg.locale, { maximumFractionDigits: 2 })} {currentCfg.symbol}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800 font-bold text-sm sm:text-base text-blue-950 dark:text-white">
                  <span>{lang === 'fr' ? 'Total à payer' : 'Total Due'}</span>
                  <span className="tabular-nums text-blue-600 dark:text-blue-400">
                    {total.toLocaleString(currentCfg.locale, { maximumFractionDigits: 2 })} {currentCfg.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-blue-200">
              {lang === 'fr'
                ? 'Organisation centralisée de vos fiches clients et suivi des documents associés :'
                : 'Centralized client directory with real-time status and invoices:'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  name: 'Kaboré Logistique SARL',
                  region: 'Ouagadougou, BF',
                  invoices: 4,
                  balance: lang === 'fr' ? 'À jour' : 'Up to date',
                },
                {
                  name: 'Éditions Laurentides',
                  region: 'Montréal, QC',
                  invoices: 2,
                  balance: lang === 'fr' ? 'En attente (15j)' : 'Pending (15d)',
                },
                {
                  name: 'Atelier Caraïbes Création',
                  region: 'Port-au-Prince, HT',
                  invoices: 6,
                  balance: lang === 'fr' ? 'À jour' : 'Up to date',
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-white dark:bg-[#081730]"
                >
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{c.region}</span>
                  <h4 className="font-semibold text-sm text-blue-950 dark:text-white mt-0.5">{c.name}</h4>
                  <div className="mt-3 pt-2 border-t border-blue-50 dark:border-blue-900/40 flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-blue-300">
                      {c.invoices} {lang === 'fr' ? 'factures' : 'invoices'}
                    </span>
                    <span
                      className={`font-semibold ${
                        c.balance.includes('attente') || c.balance.includes('Pending')
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
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
              {lang === 'fr'
                ? 'Consignation hebdomadaire des charges pour conserver une vue structurée des sorties :'
                : 'Weekly logging of business expenses to keep structured visibility on cash outflows:'}
            </p>
            <div className="space-y-2">
              {[
                {
                  label: lang === 'fr' ? 'Fournitures de bureau et équipement' : 'Office supplies and equipment',
                  cat: lang === 'fr' ? 'Matériel' : 'Hardware',
                  amount: '185,00 $ CAD',
                  date: lang === 'fr' ? 'Hier' : 'Yesterday',
                },
                {
                  label: lang === 'fr' ? 'Abonnement télécoms et fibre' : 'Telecom & internet subscription',
                  cat: 'Services',
                  amount: '75,00 $ CAD',
                  date: lang === 'fr' ? 'Il y a 3 jours' : '3 days ago',
                },
                {
                  label: lang === 'fr' ? 'Déplacement rendez-vous client' : 'Client meeting travel expenses',
                  cat: 'Transport',
                  amount: '42,50 $ CAD',
                  date: lang === 'fr' ? 'Il y a 5 jours' : '5 days ago',
                },
              ].map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-blue-100 dark:border-blue-900/60 bg-white dark:bg-[#081730] text-xs"
                >
                  <div>
                    <span className="font-semibold text-blue-950 dark:text-white block">{d.label}</span>
                    <span className="text-slate-500 dark:text-blue-300">
                      {d.cat} · {d.date}
                    </span>
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
                <span className="text-xs text-slate-500 dark:text-blue-300">
                  {lang === 'fr' ? 'Total encaissé ce mois' : 'Collected this month'}
                </span>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">+4 850 $ CAD</p>
              </div>
              <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-white dark:bg-[#081730]">
                <span className="text-xs text-slate-500 dark:text-blue-300">
                  {lang === 'fr' ? 'Dépenses engagées' : 'Expenses incurred'}
                </span>
                <p className="text-lg font-bold text-slate-700 dark:text-blue-200 tabular-nums mt-1">-1 240 $ CAD</p>
              </div>
              <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-white dark:bg-[#081730]">
                <span className="text-xs text-slate-500 dark:text-blue-300">
                  {lang === 'fr' ? 'Factures en attente' : 'Pending invoices'}
                </span>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">2 100 $ CAD</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-blue-300 italic">
              {lang === 'fr'
                ? "Rappel : Les indicateurs et synthèses visuelles facilitent le suivi de l'activité mais ne remplacent pas une comptabilité professionnelle."
                : 'Note: Visual metrics and summaries facilitate day-to-day oversight but do not replace certified CPA accounting.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
