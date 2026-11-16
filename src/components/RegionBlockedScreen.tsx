import React from 'react';
import { LogOut, Clock, MapPin } from 'lucide-react';
import { ALL_REGIONS, normalizeRegionCode } from '../config/regions';
import { useLanguage } from '../context/LanguageContext';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  region: string;
  profile?: string;
  currency?: string;
  regionActive?: boolean;
}

interface RegionBlockedScreenProps {
  user: AuthUser;
  onLogout: () => void;
}

export const RegionBlockedScreen: React.FC<RegionBlockedScreenProps> = ({
  user,
  onLogout,
}) => {
  const { lang } = useLanguage();
  const normalizedCode = normalizeRegionCode(user.region);
  const regionMeta = ALL_REGIONS.find((r) => r.code === normalizedCode);

  const regionDisplay = regionMeta
    ? `${regionMeta.flag} ${lang === 'fr' ? regionMeta.label : regionMeta.labelEn}`
    : user.region;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50/70 via-white to-blue-50/40 dark:from-[#071328] dark:via-[#081730] dark:to-[#071328]">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <MapPin className="w-3.5 h-3.5" />
            <span>{regionDisplay}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-blue-950 dark:text-white leading-snug pt-2">
            Votre région sera bientôt disponible. Merci de votre patience.
          </h1>

          {lang === 'en' && (
            <p className="text-sm text-slate-500 dark:text-blue-200">
              Your region will be available soon. Thank you for your patience.
            </p>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-left text-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 dark:text-blue-300">
              {lang === 'fr' ? 'Compte connecté :' : 'Signed in account:'}
            </span>
            <span className="font-semibold text-blue-950 dark:text-white truncate">
              {user.email}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 dark:text-blue-300">
              {lang === 'fr' ? 'Région du compte :' : 'Account region:'}
            </span>
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              {regionDisplay} ({user.region})
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-blue-200/80 leading-relaxed">
          {lang === 'fr'
            ? "Pour le lancement MVP / V1, l'accès à STARTBILL est exclusivement ouvert au Canada (CAD)."
            : 'For the MVP / V1 launch, STARTBILL access is exclusively open to Canada (CAD).'}
        </p>

        <button
          onClick={onLogout}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>{lang === 'fr' ? 'Se déconnecter' : 'Log out'}</span>
        </button>
      </div>
    </div>
  );
};
