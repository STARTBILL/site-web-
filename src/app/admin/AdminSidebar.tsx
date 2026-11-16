import React from 'react';
import {
  LayoutDashboard,
  Users,
  Globe2,
  CreditCard,
  FileText,
  FileEdit,
  Mail,
  LifeBuoy,
  ShieldAlert,
  Settings,
  BarChart3,
  ArrowLeft,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useSuperAdmin, type BasicUserIdentity } from '../../hooks/useSuperAdmin';
import type { AdminSectionId } from './types';

interface AdminSidebarProps {
  user?: BasicUserIdentity | null;
  activeSection: AdminSectionId;
  onSelectSection: (section: AdminSectionId) => void;
  onExitAdmin: () => void;
  onLogout: () => void;
  unresolvedAlertsCount?: number;
  openTicketsCount?: number;
}

export const ADMIN_NAV_ITEMS: Array<{
  id: AdminSectionId;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'regions', label: 'Régions', icon: Globe2 },
  { id: 'billing', label: 'Abonnements & Paiements', icon: CreditCard },
  { id: 'invoices', label: 'Factures globales', icon: FileText },
  { id: 'content', label: 'Contenu (CMS)', icon: FileEdit },
  { id: 'communications', label: 'Communication', icon: Mail },
  { id: 'support', label: 'Support client', icon: LifeBuoy },
  { id: 'logs', label: 'Sécurité & Logs', icon: ShieldAlert },
  { id: 'settings', label: 'Paramètres', icon: Settings },
  { id: 'analytics', label: 'Analytics & Rapports', icon: BarChart3 },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  user,
  activeSection,
  onSelectSection,
  onExitAdmin,
  onLogout,
  unresolvedAlertsCount = 0,
  openTicketsCount = 0,
}) => {
  // Double protection RBAC côté UI : ne rend rien si l'utilisateur n'est pas le Super Admin exact
  const { isSuperAdmin } = useSuperAdmin(user);
  if (!isSuperAdmin) return null;

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-[#081730] border-r border-slate-200 dark:border-blue-950 flex flex-col min-h-screen">
      {/* Identité Super Admin */}
      <div className="p-5 border-b border-slate-200 dark:border-blue-950">
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/aistudio/logo_icon.webp"
            alt="STARTBILL"
            className="h-8 w-auto object-contain"
          />
          <div className="min-w-0">
            <p className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              STARTBILL Admin
            </p>
            <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 truncate">
              Super Administrateur
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-blue-300 truncate">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">{user?.email}</span>
        </div>
      </div>

      {/* Navigation complète des 11 modules */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Navigation Administration">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const badgeCount =
            item.id === 'logs'
              ? unresolvedAlertsCount
              : item.id === 'support'
              ? openTicketsCount
              : 0;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-700 dark:text-blue-200 hover:bg-slate-100 dark:hover:bg-blue-950/70'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
              {badgeCount > 0 && (
                <span
                  className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Actions pied de barre latérale */}
      <div className="p-3 border-t border-slate-200 dark:border-blue-950 space-y-1.5">
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-blue-200 hover:bg-slate-100 dark:hover:bg-blue-950/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Retour au site public</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Déconnexion sécurisée</span>
        </button>
      </div>
    </aside>
  );
};
