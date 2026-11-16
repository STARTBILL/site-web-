import React, { useState, useMemo } from 'react';
import { Search, Download, Eye, Ban, CheckCircle, Trash2, Shield, X } from 'lucide-react';
import type { DbUserView, UserActivityView } from '../types';
import { SUPER_ADMIN_EMAIL } from '../../../hooks/useSuperAdmin';

interface UsersSectionProps {
  users: DbUserView[];
  activities: UserActivityView[];
  onUpdateUser: (
    userId: string,
    payload: { role?: 'user' | 'pro' | 'admin'; status?: 'actif' | 'suspendu' }
  ) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onExportCsv: () => void;
}

export const UsersSection: React.FC<UsersSectionProps> = ({
  users,
  activities,
  onUpdateUser,
  onDeleteUser,
  onExportCsv,
}) => {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<DbUserView | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<DbUserView | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pageSize = 6;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (search.trim()) {
        const hay = `${u.email} ${u.fullName} ${u.region}`.toLowerCase();
        if (!hay.includes(search.trim().toLowerCase())) return false;
      }
      if (regionFilter !== 'ALL' && u.region !== regionFilter) return false;
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, regionFilter, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

  const selectedUserHistory = selectedUser
    ? activities.filter((a) => a.userId === selectedUser.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Barre de recherche & filtres */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par email, nom ou région..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-800 dark:text-white"
          >
            <option value="ALL">Toutes régions</option>
            <option value="CA">Canada (CA)</option>
            <option value="AF">Afrique (AF)</option>
            <option value="HT">Haïti (HT)</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-800 dark:text-white"
          >
            <option value="ALL">Tous rôles</option>
            <option value="user">user</option>
            <option value="pro">pro</option>
            <option value="admin">admin</option>
            <option value="super_admin">super_admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-800 dark:text-white"
          >
            <option value="ALL">Tous statuts</option>
            <option value="actif">Actif</option>
            <option value="suspendu">Suspendu</option>
          </select>

          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tableau paginé */}
      <div className="rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-blue-950/60 border-b border-slate-200 dark:border-blue-900 text-slate-600 dark:text-blue-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Utilisateur</th>
                <th className="py-3 px-3 font-semibold">Région</th>
                <th className="py-3 px-3 font-semibold">Rôle</th>
                <th className="py-3 px-3 font-semibold">Forfait</th>
                <th className="py-3 px-3 font-semibold">Statut</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/40">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-blue-300">
                    Aucun utilisateur ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                paginated.map((u) => {
                  const isProtectedAdmin =
                    u.email === SUPER_ADMIN_EMAIL || u.role === 'super_admin' || u.immutable;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-blue-950/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {u.fullName}
                        </p>
                        <p className="text-slate-500 dark:text-blue-300">{u.email}</p>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-800 dark:text-blue-100">
                        {u.region} ({u.currency})
                      </td>
                      <td className="py-3 px-3">
                        {isProtectedAdmin ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                            <Shield className="w-3.5 h-3.5" />
                            super_admin
                          </span>
                        ) : (
                          <select
                            disabled={busyId === u.id}
                            value={u.role}
                            onChange={async (e) => {
                              setBusyId(u.id);
                              try {
                                await onUpdateUser(u.id, {
                                  role: e.target.value as 'user' | 'pro' | 'admin',
                                });
                              } finally {
                                setBusyId(null);
                              }
                            }}
                            className="px-2 py-1 text-xs bg-slate-50 dark:bg-blue-950/50 border border-slate-200 dark:border-blue-800 rounded text-slate-800 dark:text-white"
                          >
                            <option value="user">user</option>
                            <option value="pro">pro</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-blue-100">
                        {u.plan}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold ${
                            u.status === 'actif'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {u.status === 'actif' ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedUser(u)}
                            title="Voir profil et historique"
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-blue-900/60 text-slate-600 dark:text-blue-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isProtectedAdmin && (
                            <>
                              <button
                                disabled={busyId === u.id}
                                onClick={async () => {
                                  setBusyId(u.id);
                                  try {
                                    await onUpdateUser(u.id, {
                                      status: u.status === 'actif' ? 'suspendu' : 'actif',
                                    });
                                  } finally {
                                    setBusyId(null);
                                  }
                                }}
                                title={
                                  u.status === 'actif'
                                    ? 'Suspendre le compte'
                                    : 'Réactiver le compte'
                                }
                                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-blue-900/60 text-amber-600 dark:text-amber-400"
                              >
                                {u.status === 'actif' ? (
                                  <Ban className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                disabled={busyId === u.id}
                                onClick={() => setConfirmDeleteUser(u)}
                                title="Supprimer l'utilisateur"
                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-blue-900 flex items-center justify-between text-xs text-slate-600 dark:text-blue-300">
          <span className="tabular-nums">
            {filteredUsers.length} utilisateur(s) · Page {safePage} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border border-slate-200 dark:border-blue-800 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded border border-slate-200 dark:border-blue-800 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Modale Profil & Historique d'activité */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedUser.fullName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-blue-300">
                  {selectedUser.email} · {selectedUser.region} · {selectedUser.plan}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-900">
              <div>
                <span className="text-slate-500 dark:text-blue-300 block">Rôle</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedUser.role}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-blue-300 block">Email vérifié</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedUser.emailVerified ? 'Oui' : 'Non'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-blue-300 block">Inscription</span>
                <span className="font-mono text-slate-900 dark:text-white tabular-nums">
                  {new Date(selectedUser.createdAt).toLocaleDateString('fr-CA')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-blue-300 block">Statut</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedUser.status}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                Historique d’activité
              </h4>
              {selectedUserHistory.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-blue-300">
                  Aucune activité détaillée enregistrée pour ce compte.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedUserHistory.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-blue-900/60 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {act.action}
                        </span>
                        <span className="text-slate-400 tabular-nums">
                          {new Date(act.timestamp).toLocaleString('fr-CA')}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-blue-200 mt-0.5">{act.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation de suppression (hors Super Admin) */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm bg-white dark:bg-[#0c1e3d] border border-red-200 dark:border-red-900 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p className="text-xs text-slate-600 dark:text-blue-200">
              Voulez-vous supprimer définitivement le compte{' '}
              <span className="font-semibold">{confirmDeleteUser.email}</span> ? Cette action est consignée dans le journal d’audit.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteUser(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-blue-200"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  const id = confirmDeleteUser.id;
                  setConfirmDeleteUser(null);
                  setBusyId(id);
                  try {
                    await onDeleteUser(id);
                  } finally {
                    setBusyId(null);
                  }
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
