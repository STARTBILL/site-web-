import React, { useState } from 'react';
import { Eye, Save, X } from 'lucide-react';
import type { RegionSettingView } from '../types';
import type { RegionCode } from '../../../config/regions';

interface RegionsSectionProps {
  regions: RegionSettingView[];
  usersByRegion: Record<RegionCode, number>;
  onUpdateRegion: (
    code: RegionCode,
    payload: Partial<RegionSettingView>
  ) => Promise<void>;
}

export const RegionsSection: React.FC<RegionsSectionProps> = ({
  regions,
  usersByRegion,
  onUpdateRegion,
}) => {
  const [editing, setEditing] = useState<Record<string, Partial<RegionSettingView>>>({});
  const [previewRegion, setPreviewRegion] = useState<RegionSettingView | null>(null);
  const [savingCode, setSavingCode] = useState<string | null>(null);

  const getDraft = (reg: RegionSettingView): RegionSettingView => ({
    ...reg,
    ...(editing[reg.code] || {}),
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {regions.map((reg) => {
          const draft = getDraft(reg);
          const count = usersByRegion[reg.code] ?? 0;

          return (
            <div
              key={reg.code}
              className="p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {reg.label} ({reg.code})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-blue-300 tabular-nums">
                    {count} utilisateur(s) inscrit(s)
                  </p>
                </div>

                <button
                  disabled={savingCode === reg.code}
                  onClick={async () => {
                    setSavingCode(reg.code);
                    try {
                      await onUpdateRegion(reg.code, { active: !reg.active });
                    } finally {
                      setSavingCode(null);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    reg.active
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-200 dark:bg-blue-950 text-slate-700 dark:text-blue-300 hover:bg-slate-300'
                  }`}
                >
                  {reg.active ? 'Active' : 'Désactivée'}
                </button>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-blue-900/40">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-blue-300 mb-1">
                    Devise
                  </label>
                  <select
                    value={draft.devise}
                    onChange={(e) =>
                      setEditing((prev) => ({
                        ...prev,
                        [reg.code]: {
                          ...prev[reg.code],
                          devise: e.target.value as RegionSettingView['devise'],
                        },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="CAD">CAD ($ canadien)</option>
                    <option value="XOF">XOF (Franc CFA)</option>
                    <option value="HTG">HTG (Gourde haïtienne)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-blue-300 mb-1">
                      Libellé taxes
                    </label>
                    <input
                      type="text"
                      value={draft.taxLabel}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          [reg.code]: { ...prev[reg.code], taxLabel: e.target.value },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-blue-300 mb-1">
                      Taux (%)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={draft.taxRate}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          [reg.code]: { ...prev[reg.code], taxRate: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-blue-300 mb-1">
                    Note de prévisualisation
                  </label>
                  <textarea
                    rows={2}
                    value={draft.previewNote}
                    onChange={(e) =>
                      setEditing((prev) => ({
                        ...prev,
                        [reg.code]: { ...prev[reg.code], previewNote: e.target.value },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => setPreviewRegion(draft)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-blue-200 hover:bg-slate-50 dark:hover:bg-blue-950"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Prévisualiser</span>
                </button>

                <button
                  disabled={savingCode === reg.code}
                  onClick={async () => {
                    setSavingCode(reg.code);
                    try {
                      await onUpdateRegion(reg.code, draft);
                    } finally {
                      setSavingCode(null);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {previewRegion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Prévisualisation — {previewRegion.label} ({previewRegion.code})
              </h3>
              <button
                onClick={() => setPreviewRegion(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-900 space-y-2 text-xs">
              <p>
                <span className="text-slate-500">Statut :</span>{' '}
                <strong className="text-slate-900 dark:text-white">
                  {previewRegion.active ? 'Ouverte au public' : 'Verrouillée (Bientôt disponible)'}
                </strong>
              </p>
              <p>
                <span className="text-slate-500">Devise appliquée :</span>{' '}
                <strong className="text-slate-900 dark:text-white">{previewRegion.devise}</strong>
              </p>
              <p>
                <span className="text-slate-500">Fiscalité configurée :</span>{' '}
                <strong className="text-slate-900 dark:text-white">
                  {previewRegion.taxLabel} ({previewRegion.taxRate}%)
                </strong>
              </p>
              <p className="text-slate-600 dark:text-blue-200 pt-1">{previewRegion.previewNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
