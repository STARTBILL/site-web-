import React, { useState } from 'react';
import { Send } from 'lucide-react';
import type { SupportTicketView } from '../types';

interface SupportSectionProps {
  tickets: SupportTicketView[];
  onUpdateTicket: (
    ticketId: string,
    payload: { status?: 'ouvert' | 'en_cours' | 'resolu'; assignedTo?: string }
  ) => Promise<void>;
  onReplyTicket: (ticketId: string, message: string) => Promise<void>;
}

export const SupportSection: React.FC<SupportSectionProps> = ({
  tickets,
  onUpdateTicket,
  onReplyTicket,
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const filtered = tickets.filter((t) =>
    statusFilter === 'ALL' ? true : t.status === statusFilter
  );

  const activeTicket =
    filtered.find((t) => t.id === selectedTicketId) || filtered[0] || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Boîte de réception */}
      <div className="lg:col-span-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-blue-900 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Tickets ({filtered.length})
          </h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded text-slate-800 dark:text-white"
          >
            <option value="ALL">Tous</option>
            <option value="ouvert">Ouverts</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolus</option>
          </select>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-blue-900/40">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTicketId(t.id)}
              className={`w-full text-left p-4 transition-colors ${
                activeTicket?.id === t.id
                  ? 'bg-blue-50/70 dark:bg-blue-950/60'
                  : 'hover:bg-slate-50 dark:hover:bg-blue-950/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {t.id}
                </span>
                <span
                  className={`font-semibold ${
                    t.status === 'ouvert'
                      ? 'text-red-600 dark:text-red-400'
                      : t.status === 'en_cours'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
                {t.subject}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-blue-300 mt-0.5">
                {t.userName} ({t.region}) · Assigné : {t.assignedTo}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Détail & Réponse */}
      <div className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
        {!activeTicket ? (
          <p className="text-xs text-slate-500 dark:text-blue-300">
            Sélectionnez un ticket pour le consulter.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-blue-900/40">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeTicket.subject}
                </h3>
                <p className="text-xs text-slate-500 dark:text-blue-300 mt-0.5">
                  {activeTicket.userEmail} · Priorité {activeTicket.priority}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={activeTicket.status}
                  onChange={(e) =>
                    onUpdateTicket(activeTicket.id, {
                      status: e.target.value as 'ouvert' | 'en_cours' | 'resolu',
                    })
                  }
                  className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="ouvert">Ouvert</option>
                  <option value="en_cours">En cours</option>
                  <option value="resolu">Résolu</option>
                </select>

                <select
                  value={activeTicket.assignedTo}
                  onChange={(e) =>
                    onUpdateTicket(activeTicket.id, { assignedTo: e.target.value })
                  }
                  className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Non assigné">Non assigné</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Équipe Support CA">Équipe Support CA</option>
                  <option value="Agent Facturation">Agent Facturation</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activeTicket.replies.map((rep) => (
                <div
                  key={rep.id}
                  className={`p-3 rounded-lg text-xs border ${
                    rep.isAdmin
                      ? 'bg-blue-50/70 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-blue-950/30 border-slate-200 dark:border-blue-900/50'
                  }`}
                >
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {rep.author}
                    </span>
                    <span className="text-slate-400 tabular-nums">
                      {new Date(rep.createdAt).toLocaleString('fr-CA')}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-blue-100">{rep.message}</p>
                </div>
              ))}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!replyText.trim()) return;
                setSending(true);
                try {
                  await onReplyTicket(activeTicket.id, replyText.trim());
                  setReplyText('');
                } finally {
                  setSending(false);
                }
              }}
              className="space-y-2 pt-2"
            >
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Rédiger une réponse officielle au client..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Envoi...' : 'Répondre au ticket'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
