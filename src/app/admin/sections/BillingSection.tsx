import React, { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import type {
  SubscriptionView,
  PaymentView,
  CouponView,
  AnalyticsView,
} from '../types';

interface BillingSectionProps {
  subscriptions: SubscriptionView[];
  payments: PaymentView[];
  coupons: CouponView[];
  analytics: AnalyticsView;
  onUpdatePaymentStatus: (
    paymentId: string,
    status: 'succeeded' | 'refunded' | 'disputed'
  ) => Promise<void>;
  onCreateCoupon: (payload: {
    code: string;
    discountPercent: number;
    maxUses: number;
    expiresAt: string;
  }) => Promise<void>;
  onToggleCoupon: (couponId: string) => Promise<void>;
}

export const BillingSection: React.FC<BillingSectionProps> = ({
  subscriptions,
  payments,
  coupons,
  analytics,
  onUpdatePaymentStatus,
  onCreateCoupon,
  onToggleCoupon,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [maxUses, setMaxUses] = useState(50);
  const [expiresAt, setExpiresAt] = useState('2026-12-31');
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const maxPlanRev = Math.max(
    1,
    analytics.revenueByPlan.Start,
    analytics.revenueByPlan.Pro
  );

  return (
    <div className="space-y-6">
      {/* Revenus par plan + Coupons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Revenus récurrents par forfait (CAD)
          </h2>

          <div className="space-y-3">
            {[
              { name: 'Free (0 CAD)', amount: analytics.revenueByPlan.Free },
              { name: 'Start (15 CAD)', amount: analytics.revenueByPlan.Start },
              { name: 'Pro (30 CAD)', amount: analytics.revenueByPlan.Pro },
            ].map((row) => {
              const pct = Math.round((row.amount / maxPlanRev) * 100);
              return (
                <div key={row.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-blue-200">
                      {row.name}
                    </span>
                    <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {row.amount} $ CAD
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-blue-950 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coupons de réduction */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Coupons de réduction
          </h2>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!couponCode.trim()) return;
              setCreatingCoupon(true);
              try {
                await onCreateCoupon({
                  code: couponCode.trim(),
                  discountPercent,
                  maxUses,
                  expiresAt,
                });
                setCouponCode('');
              } finally {
                setCreatingCoupon(false);
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-5 gap-2"
          >
            <input
              type="text"
              required
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="CODE2026"
              className="sm:col-span-2 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
            />
            <input
              type="number"
              min={5}
              max={90}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              title="Réduction (%)"
            />
            <input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              title="Max utilisations"
            />
            <button
              type="submit"
              disabled={creatingCoupon}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer</span>
            </button>
          </form>

          <div className="divide-y divide-slate-100 dark:divide-blue-900/40 text-xs">
            {coupons.map((c) => (
              <div key={c.id} className="py-2 flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {c.code}
                  </span>
                  <span className="text-slate-500 dark:text-blue-300 ml-2 tabular-nums">
                    −{c.discountPercent}% · {c.usedCount}/{c.maxUses} utilisés · Exp. {c.expiresAt}
                  </span>
                </div>
                <button
                  onClick={() => onToggleCoupon(c.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                    c.active
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-blue-950 text-slate-500 dark:text-blue-300'
                  }`}
                >
                  {c.active ? 'Actif' : 'Inactif'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Abonnements actifs */}
      <div className="rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-blue-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Abonnements actifs ({subscriptions.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-blue-950/60 border-b border-slate-200 dark:border-blue-900 text-slate-600 dark:text-blue-200">
              <tr>
                <th className="py-2.5 px-4">Client</th>
                <th className="py-2.5 px-3">Plan</th>
                <th className="py-2.5 px-3 text-right">Montant</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-4 text-right">Prochaine échéance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/40">
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="py-2.5 px-4">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {sub.userName}
                    </span>
                    <span className="text-slate-500 dark:text-blue-300">{sub.userEmail}</span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-blue-100">
                    {sub.plan}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    {sub.amount} {sub.currency}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        sub.status === 'active'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-500 dark:text-blue-300">
                    {new Date(sub.nextBillingDate).toLocaleDateString('fr-CA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paiements, remboursements & litiges */}
      <div className="rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-blue-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Paiements, remboursements et litiges
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-blue-950/60 border-b border-slate-200 dark:border-blue-900 text-slate-600 dark:text-blue-200">
              <tr>
                <th className="py-2.5 px-4">ID / Email</th>
                <th className="py-2.5 px-3">Passerelle</th>
                <th className="py-2.5 px-3 text-right">Montant</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/40">
              {payments.map((pay) => (
                <tr key={pay.id}>
                  <td className="py-2.5 px-4">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white block">
                      {pay.id}
                    </span>
                    <span className="text-slate-500 dark:text-blue-300">{pay.userEmail}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-blue-200">
                    {pay.provider}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    {pay.amount} {pay.currency}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        pay.status === 'succeeded'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : pay.status === 'disputed'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {pay.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {pay.status !== 'refunded' ? (
                      <button
                        onClick={() => onUpdatePaymentStatus(pay.id, 'refunded')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Rembourser</span>
                      </button>
                    ) : (
                      <span className="text-slate-400">Remboursé</span>
                    )}
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
