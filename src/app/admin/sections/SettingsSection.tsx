import React, { useState } from 'react';
import { Save, DatabaseBackup, AlertTriangle } from 'lucide-react';
import type { PlatformSettingsView } from '../types';

interface SettingsSectionProps {
  settings: PlatformSettingsView;
  onSaveSettings: (payload: Record<string, unknown>) => Promise<void>;
  onCreateBackup: () => Promise<void>;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  settings,
  onSaveSettings,
  onCreateBackup,
}) => {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(settings.maintenanceMessage);

  const [smtpHost, setSmtpHost] = useState(settings.smtp.host);
  const [smtpPort, setSmtpPort] = useState(settings.smtp.port);
  const [smtpFrom, setSmtpFrom] = useState(settings.smtp.fromEmail);

  const [deepseekInput, setDeepseekInput] = useState('');
  const [stripeInput, setStripeInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  return (
    <div className="space-y-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            await onSaveSettings({
              siteName,
              logoUrl,
              faviconUrl,
              maintenanceMode,
              maintenanceMessage,
              smtp: {
                host: smtpHost,
                port: smtpPort,
                fromEmail: smtpFrom,
                secure: true,
              },
              deepseekApiKey: deepseekInput || undefined,
              stripeApiKey: stripeInput || undefined,
            });
            setDeepseekInput('');
            setStripeInput('');
          } finally {
            setSaving(false);
          }
        }}
        className="space-y-6"
      >
        {/* Identité & Mode maintenance */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Identité visuelle & Mode maintenance
            </h2>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Sauvegarde...' : 'Enregistrer les paramètres'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
                Nom du site
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
                Logo URL
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
                Favicon URL
              </label>
              <input
                type="text"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Mode maintenance (ON / OFF)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-blue-300">
                  Bloque l’accès public avec le message ci-dessous tout en gardant l’accès /admin actif.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                maintenanceMode
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-200 dark:bg-blue-900 text-slate-700 dark:text-blue-200'
              }`}
            >
              {maintenanceMode ? 'Maintenance ON' : 'Maintenance OFF'}
            </button>
          </div>

          <input
            type="text"
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            placeholder="Message affiché pendant la maintenance"
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        {/* Clés API & SMTP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Clés API (stockage masqué côté serveur)
            </h2>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-600 dark:text-blue-200">
                  DeepSeek API Key
                </span>
                <span className="font-mono text-slate-500">
                  {settings.apiKeys.deepseekMasked}
                </span>
              </div>
              <input
                type="password"
                value={deepseekInput}
                onChange={(e) => setDeepseekInput(e.target.value)}
                placeholder="Saisir une nouvelle clé DeepSeek pour remplacer..."
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-600 dark:text-blue-200">
                  Stripe Secret Key
                </span>
                <span className="font-mono text-slate-500">
                  {settings.apiKeys.stripeMasked}
                </span>
              </div>
              <input
                type="password"
                value={stripeInput}
                onChange={(e) => setStripeInput(e.target.value)}
                placeholder="Saisir une nouvelle clé Stripe (sk_live_...)..."
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Emails transactionnels (SMTP)
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
                  Serveur SMTP
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
                Adresse d’expédition
              </label>
              <input
                type="email"
                value={smtpFrom}
                onChange={(e) => setSmtpFrom(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Sauvegardes manuelles */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Sauvegardes manuelles (Backups LPRPDE)
            </h2>
            <p className="text-xs text-slate-500 dark:text-blue-300">
              Instantané complet de la base sans exposition de secrets.
            </p>
          </div>
          <button
            type="button"
            disabled={backingUp}
            onClick={async () => {
              setBackingUp(true);
              try {
                await onCreateBackup();
              } finally {
                setBackingUp(false);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold hover:opacity-90"
          >
            <DatabaseBackup className="w-3.5 h-3.5" />
            <span>{backingUp ? 'Sauvegarde...' : 'Créer une sauvegarde'}</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-blue-900/40 text-xs">
          {settings.backups.map((b) => (
            <div key={b.id} className="py-2.5 flex items-center justify-between gap-3">
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {b.label}
              </span>
              <span className="text-slate-500 dark:text-blue-300 tabular-nums">
                {b.sizeKb} Ko · {new Date(b.createdAt).toLocaleString('fr-CA')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
