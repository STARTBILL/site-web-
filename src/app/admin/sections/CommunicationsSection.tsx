import React, { useState } from 'react';
import { Send, Bell } from 'lucide-react';
import type { EmailCampaignView, PushNotificationView } from '../types';

interface CommunicationsSectionProps {
  campaigns: EmailCampaignView[];
  pushNotifications: PushNotificationView[];
  onSendEmail: (payload: {
    subject: string;
    body: string;
    targetType: 'all' | 'region' | 'plan';
    targetValue: string;
  }) => Promise<void>;
  onSendPush: (payload: {
    title: string;
    message: string;
    targetRegion: 'ALL' | 'CA' | 'AF' | 'HT';
  }) => Promise<void>;
}

export const CommunicationsSection: React.FC<CommunicationsSectionProps> = ({
  campaigns,
  pushNotifications,
  onSendEmail,
  onSendPush,
}) => {
  const [targetType, setTargetType] = useState<'all' | 'region' | 'plan'>('all');
  const [targetValue, setTargetValue] = useState('ALL');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const [pushTitle, setPushTitle] = useState('');
  const [pushMsg, setPushMsg] = useState('');
  const [pushRegion, setPushRegion] = useState<'ALL' | 'CA' | 'AF' | 'HT'>('CA');
  const [sendingPush, setSendingPush] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Newsletter / Email ciblé */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!subject.trim() || !body.trim()) return;
            setSendingEmail(true);
            try {
              await onSendEmail({
                subject: subject.trim(),
                body: body.trim(),
                targetType,
                targetValue: targetType === 'all' ? 'ALL' : targetValue,
              });
              setSubject('');
              setBody('');
            } finally {
              setSendingEmail(false);
            }
          }}
          className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4"
        >
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Newsletter & Emails ciblés (par région ou forfait)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
                Ciblage
              </label>
              <select
                value={targetType}
                onChange={(e) => {
                  const val = e.target.value as 'all' | 'region' | 'plan';
                  setTargetType(val);
                  if (val === 'region') setTargetValue('CA');
                  else if (val === 'plan') setTargetValue('Pro');
                  else setTargetValue('ALL');
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="all">Tous les utilisateurs (Newsletter)</option>
                <option value="region">Par région</option>
                <option value="plan">Par forfait</option>
              </select>
            </div>

            {targetType !== 'all' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
                  Segment
                </label>
                <select
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                >
                  {targetType === 'region' ? (
                    <>
                      <option value="CA">Canada (CA)</option>
                      <option value="AF">Afrique (AF)</option>
                      <option value="HT">Haïti (HT)</option>
                    </>
                  ) : (
                    <>
                      <option value="Free">Free</option>
                      <option value="Start">Start</option>
                      <option value="Pro">Pro</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet de l'email"
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          />

          <textarea
            rows={4}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Contenu du message..."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          />

          <button
            type="submit"
            disabled={sendingEmail}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sendingEmail ? 'Envoi...' : 'Envoyer la campagne'}</span>
          </button>
        </form>

        {/* Notifications Push In-App */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!pushTitle.trim() || !pushMsg.trim()) return;
            setSendingPush(true);
            try {
              await onSendPush({
                title: pushTitle.trim(),
                message: pushMsg.trim(),
                targetRegion: pushRegion,
              });
              setPushTitle('');
              setPushMsg('');
            } finally {
              setSendingPush(false);
            }
          }}
          className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4"
        >
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Notification Push In-App
          </h2>

          <select
            value={pushRegion}
            onChange={(e) => setPushRegion(e.target.value as 'ALL' | 'CA' | 'AF' | 'HT')}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="ALL">Toutes régions</option>
            <option value="CA">Canada (CA)</option>
            <option value="AF">Afrique (AF)</option>
            <option value="HT">Haïti (HT)</option>
          </select>

          <input
            type="text"
            required
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
            placeholder="Titre de la notification"
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          />

          <textarea
            rows={3}
            required
            value={pushMsg}
            onChange={(e) => setPushMsg(e.target.value)}
            placeholder="Message court affiché dans l'application..."
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          />

          <button
            type="submit"
            disabled={sendingPush}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{sendingPush ? 'Publication...' : 'Diffuser la notification'}</span>
          </button>

          <div className="pt-3 border-t border-slate-100 dark:border-blue-900/40 space-y-2">
            {pushNotifications.slice(0, 3).map((p) => (
              <div key={p.id} className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white">{p.title}</span>
                <span className="text-slate-400 ml-2 font-mono">{p.targetRegion}</span>
              </div>
            ))}
          </div>
        </form>
      </div>

      {/* Historique des emails envoyés */}
      <div className="rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-blue-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Historique des emails envoyés ({campaigns.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-blue-900/40">
          {campaigns.map((c) => (
            <div key={c.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{c.subject}</p>
                <p className="text-slate-500 dark:text-blue-300">{c.body}</p>
              </div>
              <div className="text-right shrink-0 tabular-nums text-slate-500 dark:text-blue-300">
                <span className="font-mono font-semibold text-slate-900 dark:text-white block">
                  {c.recipientCount} destinataire(s) ({c.targetType}:{c.targetValue})
                </span>
                <span>{new Date(c.sentAt).toLocaleString('fr-CA')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
