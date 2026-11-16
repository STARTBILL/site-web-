import React from 'react';
import { Check, XCircle } from 'lucide-react';
import type {
  AuditLogView,
  LoginHistoryView,
  SecurityAlertView,
  ActiveSessionView,
} from '../types';

interface LogsSectionProps {
  auditLogs: AuditLogView[];
  loginHistory: LoginHistoryView[];
  securityAlerts: SecurityAlertView[];
  activeSessions: ActiveSessionView[];
  onResolveAlert: (alertId: string) => Promise<void>;
  onRevokeSession: (sessionId: string) => Promise<void>;
}

export const LogsSection: React.FC<LogsSectionProps> = ({
  auditLogs,
  loginHistory,
  securityAlerts,
  activeSessions,
  onResolveAlert,
  onRevokeSession,
}) => {
  return (
    <div className="space-y-6">
      {/* Alertes de sécurité & Sessions actives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Alertes de sécurité ({securityAlerts.filter((a) => !a.resolved).length} actives)
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-blue-900/40">
            {securityAlerts.slice(0, 8).map((alert) => (
              <div key={alert.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <span
                    className={`font-semibold ${
                      alert.severity === 'critical'
                        ? 'text-red-600 dark:text-red-400'
                        : alert.severity === 'warning'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    [{alert.severity.toUpperCase()}] {alert.title}
                  </span>
                  <p className="text-slate-600 dark:text-blue-200 mt-0.5">{alert.description}</p>
                  <p className="text-slate-400 font-mono tabular-nums mt-0.5">
                    IP {alert.sourceIp} · {new Date(alert.createdAt).toLocaleString('fr-CA')}
                  </p>
                </div>
                {!alert.resolved ? (
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-blue-950 text-slate-700 dark:text-blue-200 hover:bg-emerald-600 hover:text-white text-[11px] font-semibold shrink-0"
                  >
                    <Check className="w-3 h-3" />
                    <span>Résoudre</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                    Résolue
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Sessions Admin actives ({activeSessions.length})
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-blue-900/40">
            {activeSessions.map((sess) => (
              <div key={sess.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {sess.email}
                  </p>
                  <p className="text-slate-500 dark:text-blue-300 font-mono truncate">
                    IP {sess.ip} · 2FA {sess.totpVerified ? 'OK' : 'En attente'}
                  </p>
                  <p className="text-slate-400 tabular-nums">
                    Dernière activité : {new Date(sess.lastActivityAt).toLocaleTimeString('fr-CA')}
                  </p>
                </div>
                <button
                  onClick={() => onRevokeSession(sess.id)}
                  title="Révoquer cette session"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Révoquer</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-blue-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Journal d’audit administrateur (traçabilité LPRPDE)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-blue-950/60 border-b border-slate-200 dark:border-blue-900 text-slate-600 dark:text-blue-200">
              <tr>
                <th className="py-2.5 px-4">Date & Heure</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Cible</th>
                <th className="py-2.5 px-3">Détails</th>
                <th className="py-2.5 px-4 text-right">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/40">
              {auditLogs.slice(0, 20).map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500 dark:text-blue-300 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('fr-CA')}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 dark:text-white">{log.target}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-blue-200">{log.details}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historique des connexions */}
      <div className="rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-blue-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Historique des connexions (IP, navigateur, localisation)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-blue-950/60 border-b border-slate-200 dark:border-blue-900 text-slate-600 dark:text-blue-200">
              <tr>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3">IP</th>
                <th className="py-2.5 px-3">Navigateur</th>
                <th className="py-2.5 px-3">Localisation</th>
                <th className="py-2.5 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/40">
              {loginHistory.slice(0, 15).map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {item.email}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        item.success
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {item.success ? 'Succès' : 'Échec'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{item.ip}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-blue-200">
                    {item.browser}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-blue-200">
                    {item.location}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-500">
                    {new Date(item.timestamp).toLocaleString('fr-CA')}
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
