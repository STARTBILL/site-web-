import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  Shield,
  X,
  UserPlus,
  Upload,
  Send,
  Clock,
  Users,
} from 'lucide-react';
import type { DbUserView, UserActivityView } from '../types';
import { SUPER_ADMIN_EMAIL } from '../../../hooks/useSuperAdmin';

export interface AdminUserCreatePayload {
  fullName: string;
  email: string;
  region: 'CA' | 'AF' | 'HT';
  role: 'user' | 'pro' | 'admin';
  plan: 'Free' | 'Start' | 'Pro';
  profile: string;
  source: 'waitlist' | 'admin';
  waitlistStatus?: 'en_attente' | 'invite' | 'converti';
  adminNotes?: string;
}

export interface AdminUserUpdatePayload {
  role?: 'user' | 'pro' | 'admin';
  plan?: 'Free' | 'Start' | 'Pro';
  status?: 'actif' | 'suspendu';
  waitlistStatus?: 'en_attente' | 'invite' | 'converti';
  emailVerified?: boolean;
  adminNotes?: string;
  fullName?: string;
  profile?: string;
}

export interface WaitlistImportEntry {
  fullName: string;
  email: string;
  profile?: string;
  region?: string;
  date?: string;
}

interface UsersSectionProps {
  users: DbUserView[];
  activities: UserActivityView[];
  localWaitlistCount?: number;
  onSyncLocalWaitlist?: () => Promise<void>;
  onCreateUser: (payload: AdminUserCreatePayload) => Promise<void>;
  onUpdateUser: (userId: string, payload: AdminUserUpdatePayload) => Promise<void>;
  onInviteWaitlistUser: (userId: string) => Promise<void>;
  onImportWaitlist: (entries: WaitlistImportEntry[]) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onExportCsv: () => void;
}

export function isWaitlistEntry(u: DbUserView): boolean {
  return (
    u.source === 'waitlist' ||
    u.id.startsWith('wl-') ||
    u.waitlistStatus === 'en_attente' ||
    u.waitlistStatus === 'invite' ||
    (!u.emailVerified && u.role === 'user' && u.source !== 'admin')
  );
}

export const UsersSection: React.FC<UsersSectionProps> = ({
  users,
  activities,
  localWaitlistCount = 0,
  onSyncLocalWaitlist,
  onCreateUser,
  onUpdateUser,
  onInviteWaitlistUser,
  onImportWaitlist,
  onDeleteUser,
  onExportCsv,
}) => {
  const [segment, setSegment] = useState<'ALL' | 'WAITLIST' | 'REGISTERED' | 'SUSPENDED'>('ALL');
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState<DbUserView | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editWaitlistStatus, setEditWaitlistStatus] = useState<'en_attente' | 'invite' | 'converti'>('en_attente');
  const [savingDetail, setSavingDetail] = useState(false);

  const [confirmDeleteUser, setConfirmDeleteUser] = useState<DbUserView | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modale ajout manuel
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<AdminUserCreatePayload>({
    fullName: '',
    email: '',
    region: 'CA',
    role: 'user',
    plan: 'Free',
    profile: 'autonome',
    source: 'waitlist',
    waitlistStatus: 'en_attente',
    adminNotes: '',
  });
  const [creating, setCreating] = useState(false);

  // Modale import liste d'attente
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  const pageSize = 8;

  const stats = useMemo(() => {
    const waitlistUsers = users.filter((u) => isWaitlistEntry(u));
    const pendingWaitlist = waitlistUsers.filter((u) => u.waitlistStatus !== 'invite' && u.waitlistStatus !== 'converti');
    const activeRegistered = users.filter((u) => !isWaitlistEntry(u) && u.status === 'actif');
    const suspended = users.filter((u) => u.status === 'suspendu');
    return {
      total: users.length,
      waitlistTotal: waitlistUsers.length,
      waitlistPending: pendingWaitlist.length,
      activeRegistered: activeRegistered.length,
      suspended: suspended.length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isWaitlist = isWaitlistEntry(u);
      if (segment === 'WAITLIST' && !isWaitlist) return false;
      if (segment === 'REGISTERED' && (isWaitlist || u.status === 'suspendu')) return false;
      if (segment === 'SUSPENDED' && u.status !== 'suspendu') return false;

      if (search.trim()) {
        const hay = `${u.email} ${u.fullName} ${u.region} ${u.profile || ''}`.toLowerCase();
        if (!hay.includes(search.trim().toLowerCase())) return false;
      }
      if (regionFilter !== 'ALL' && u.region !== regionFilter) return false;
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      return true;
    });
  }, [users, segment, search, regionFilter, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

  const selectedUserHistory = selectedUser
    ? activities.filter((a) => a.userId === selectedUser.id)
    : [];

  const openUserDetail = (u: DbUserView) => {
    setSelectedUser(u);
    setEditNotes(u.adminNotes || '');
    setEditWaitlistStatus(u.waitlistStatus || (isWaitlistEntry(u) ? 'en_attente' : 'converti'));
  };

  const handleBatchImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = importText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed: WaitlistImportEntry[] = [];
    for (const line of lines) {
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      if (parts.length >= 2 && parts[1].includes('@')) {
        parsed.push({
          fullName: parts[0] || parts[1].split('@')[0],
          email: parts[1].toLowerCase(),
          profile: parts[2] || 'autonome',
          region: parts[3] || 'CA',
        });
      } else {
        const emailCandidate = parts.find((p) => p.includes('@'));
        if (emailCandidate) {
          parsed.push({
            fullName: emailCandidate.split('@')[0],
            email: emailCandidate.toLowerCase(),
            profile: 'autonome',
            region: 'CA',
          });
        }
      }
    }

    if (parsed.length === 0) return;
    setImporting(true);
    try {
      await onImportWaitlist(parsed);
      setImportText('');
      setIsImportOpen(false);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* KPI synthétiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-blue-300">
            <span>Total contacts</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {stats.total}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-blue-200 dark:border-blue-800/80">
          <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-medium">
            <span>Liste d’attente</span>
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">
            {stats.waitlistTotal}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-blue-300 mt-0.5 tabular-nums">
            {stats.waitlistPending} en attente d’invitation
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-blue-300">
            <span>Comptes inscrits actifs</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            {stats.activeRegistered}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-blue-300">
            <span>Comptes suspendus</span>
            <Ban className="w-4 h-4 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {stats.suspended}
          </p>
        </div>
      </div>

      {/* Alerte de synchronisation locale si des inscrits existent dans le navigateur */}
      {localWaitlistCount > 0 && onSyncLocalWaitlist && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-amber-900 dark:text-amber-200">
            <strong>{localWaitlistCount}</strong> inscription(s) à la liste d’attente détectée(s) localement dans ce navigateur. Synchronisez-les avec la base serveur pour ne perdre aucun contact.
          </span>
          <button
            type="button"
            onClick={onSyncLocalWaitlist}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0"
          >
            Synchroniser maintenant
          </button>
        </div>
      )}

      {/* Onglets de segmentation + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60">
          {[
            { id: 'ALL' as const, label: `Tous (${stats.total})` },
            { id: 'WAITLIST' as const, label: `Liste d’attente (${stats.waitlistTotal})` },
            { id: 'REGISTERED' as const, label: `Inscrits actifs (${stats.activeRegistered})` },
            { id: 'SUSPENDED' as const, label: `Suspendus (${stats.suspended})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSegment(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                segment === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-blue-200 hover:bg-slate-100 dark:hover:bg-blue-950/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-blue-700 hover:opacity-90 text-white text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Ajouter un utilisateur</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-blue-800 bg-white dark:bg-[#0c1e3d] hover:bg-slate-50 dark:hover:bg-blue-950 text-slate-800 dark:text-blue-100 text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importer liste d’attente</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

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
            placeholder="Rechercher par email, nom, profil ou région..."
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
        </div>
      </div>

      {/* Tableau paginé */}
      <div className="rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-blue-950/60 border-b border-slate-200 dark:border-blue-900 text-slate-600 dark:text-blue-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Utilisateur</th>
                <th className="py-3 px-3 font-semibold">Origine / Liste d’attente</th>
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
                  <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-blue-300">
                    Aucun utilisateur ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                paginated.map((u) => {
                  const isProtectedAdmin =
                    u.email === SUPER_ADMIN_EMAIL || u.role === 'super_admin' || u.immutable;
                  const isWaitlist = isWaitlistEntry(u);
                  const wStatus = u.waitlistStatus || (isWaitlist ? 'en_attente' : undefined);

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
                        <p className="text-[11px] text-slate-400 dark:text-blue-400/80">
                          {u.profile} · inscrit le {new Date(u.createdAt).toLocaleDateString('fr-CA')}
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        {isProtectedAdmin ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                            Super Admin
                          </span>
                        ) : isWaitlist ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-semibold ${
                              wStatus === 'invite'
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {wStatus === 'invite'
                              ? 'Liste d’attente · Invité'
                              : 'Liste d’attente · En attente'}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-blue-950/70 text-slate-700 dark:text-blue-200 font-medium">
                            {u.waitlistStatus === 'converti'
                              ? 'Ex-liste d’attente · Actif'
                              : 'Compte inscrit'}
                          </span>
                        )}
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

                      <td className="py-3 px-3">
                        {isProtectedAdmin ? (
                          <span className="font-medium text-slate-700 dark:text-blue-100">
                            {u.plan}
                          </span>
                        ) : (
                          <select
                            disabled={busyId === u.id}
                            value={u.plan}
                            onChange={async (e) => {
                              setBusyId(u.id);
                              try {
                                await onUpdateUser(u.id, {
                                  plan: e.target.value as 'Free' | 'Start' | 'Pro',
                                });
                              } finally {
                                setBusyId(null);
                              }
                            }}
                            className="px-2 py-1 text-xs bg-slate-50 dark:bg-blue-950/50 border border-slate-200 dark:border-blue-800 rounded text-slate-800 dark:text-white"
                          >
                            <option value="Free">Free</option>
                            <option value="Start">Start</option>
                            <option value="Pro">Pro</option>
                          </select>
                        )}
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
                          {!isProtectedAdmin && isWaitlist && wStatus !== 'invite' && (
                            <button
                              disabled={busyId === u.id}
                              onClick={async () => {
                                setBusyId(u.id);
                                try {
                                  await onInviteWaitlistUser(u.id);
                                } finally {
                                  setBusyId(null);
                                }
                              }}
                              title="Marquer comme invité (accès prioritaire)"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white text-[11px] font-semibold transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>Inviter</span>
                            </button>
                          )}

                          <button
                            onClick={() => openUserDetail(u)}
                            title="Voir / modifier la fiche"
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

      {/* Modale Fiche, Édition & Historique d'activité */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
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
                <span className="text-slate-500 dark:text-blue-300 block">Origine</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {isWaitlistEntry(selectedUser) ? 'Liste d’attente' : selectedUser.source || 'Compte inscrit'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-blue-300 block">Inscription</span>
                <span className="font-mono text-slate-900 dark:text-white tabular-nums">
                  {new Date(selectedUser.createdAt).toLocaleDateString('fr-CA')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-blue-300 block">Courriel vérifié</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedUser.emailVerified ? 'Oui' : 'Non'}
                </span>
              </div>
            </div>

            {selectedUser.email !== SUPER_ADMIN_EMAIL && selectedUser.role !== 'super_admin' && (
              <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 dark:border-blue-900">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-blue-200 mb-1">
                    Statut liste d’attente / parcours
                  </label>
                  <select
                    value={editWaitlistStatus}
                    onChange={(e) =>
                      setEditWaitlistStatus(e.target.value as 'en_attente' | 'invite' | 'converti')
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="invite">Invité (accès envoyé)</option>
                    <option value="converti">Converti en compte actif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-blue-200 mb-1">
                    Notes internes administrateur
                  </label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Ex: Prioritaire pilote Québec, relance prévue..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  disabled={savingDetail}
                  onClick={async () => {
                    setSavingDetail(true);
                    try {
                      await onUpdateUser(selectedUser.id, {
                        waitlistStatus: editWaitlistStatus,
                        adminNotes: editNotes,
                      });
                      setSelectedUser(null);
                    } finally {
                      setSavingDetail(false);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-60"
                >
                  {savingDetail ? 'Enregistrement...' : 'Enregistrer les notes & statut'}
                </button>
              </div>
            )}

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

      {/* Modale Ajouter un utilisateur */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setCreating(true);
              try {
                await onCreateUser(newUserForm);
                setNewUserForm({
                  fullName: '',
                  email: '',
                  region: 'CA',
                  role: 'user',
                  plan: 'Free',
                  profile: 'autonome',
                  source: 'waitlist',
                  waitlistStatus: 'en_attente',
                  adminNotes: '',
                });
                setIsAddOpen(false);
              } finally {
                setCreating(false);
              }
            }}
            className="w-full max-w-md bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ajouter un utilisateur / contact
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={newUserForm.fullName}
                onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                placeholder="Ex: Marie Gagnon"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                Courriel *
              </label>
              <input
                type="email"
                required
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                placeholder="marie@entreprise.ca"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Origine
                </label>
                <select
                  value={newUserForm.source}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      source: e.target.value as 'waitlist' | 'admin',
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="waitlist">Liste d’attente</option>
                  <option value="admin">Compte actif direct</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Région
                </label>
                <select
                  value={newUserForm.region}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      region: e.target.value as 'CA' | 'AF' | 'HT',
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="CA">Canada (CA)</option>
                  <option value="AF">Afrique (AF)</option>
                  <option value="HT">Haïti (HT)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Profil
                </label>
                <select
                  value={newUserForm.profile}
                  onChange={(e) => setNewUserForm({ ...newUserForm, profile: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="autonome">Travailleur autonome</option>
                  <option value="commercant">Commerçant</option>
                  <option value="pme">PME</option>
                  <option value="projet">Porteur de projet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Forfait
                </label>
                <select
                  value={newUserForm.plan}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      plan: e.target.value as 'Free' | 'Start' | 'Pro',
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Free">Free</option>
                  <option value="Start">Start</option>
                  <option value="Pro">Pro</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-blue-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
              >
                {creating ? 'Création...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modale Import Liste d'attente */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form
            onSubmit={handleBatchImportSubmit}
            className="w-full max-w-lg bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Importer des contacts en liste d’attente
              </h3>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-blue-200">
              Collez une liste (un contact par ligne : <code className="font-mono">Nom, email@domaine.ca</code> ou simplement <code className="font-mono">email@domaine.ca</code>). Les comptes déjà existants seront automatiquement ignorés sans doublon.
            </p>

            <textarea
              rows={6}
              required
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={'Jean Tremblay, jean@atelier.ca\nsophie@boutique.ca'}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-blue-800 text-slate-700 dark:text-blue-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={importing}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
              >
                {importing ? 'Import en cours...' : 'Importer dans la liste d’attente'}
              </button>
            </div>
          </form>
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
