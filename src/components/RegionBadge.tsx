import React from 'react';
import { Lock } from 'lucide-react';
import {
  ALL_REGIONS,
  DEFAULT_REGION,
  IS_MULTI_REGION,
  getActiveRegionsList,
} from '../config/regions';
import { useLanguage } from '../context/LanguageContext';

interface RegionBadgeProps {
  showCurrency?: boolean;
  showLockHint?: boolean;
  className?: string;
}

export const RegionBadge: React.FC<RegionBadgeProps> = ({
  showCurrency = false,
  showLockHint = false,
  className = '',
}) => {
  const { lang } = useLanguage();
  const activeRegions = getActiveRegionsList();
  const defaultRegionObj =
    ALL_REGIONS.find((r) => r.code === DEFAULT_REGION) ?? ALL_REGIONS[0];
  const primaryRegion = activeRegions[0] ?? defaultRegionObj;
  const label = lang === 'fr' ? primaryRegion.label : primaryRegion.labelEn;

  if (IS_MULTI_REGION) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-900 dark:text-blue-100 ${className}`}
      >
        {activeRegions.map((region, idx) => (
          <React.Fragment key={region.code}>
            {idx > 0 && <span className="text-blue-300 dark:text-blue-700">·</span>}
            <span>
              {region.flag} {lang === 'fr' ? region.label : region.labelEn}
              {showCurrency ? ` (${region.devise})` : ''}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <span
      title={
        lang === 'fr'
          ? `Région active : ${label} (${primaryRegion.devise})`
          : `Active region: ${label} (${primaryRegion.devise})`
      }
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-950 dark:text-blue-100 whitespace-nowrap select-none ${className}`}
    >
      <span aria-hidden="true">{primaryRegion.flag}</span>
      <span>{label}</span>
      {showCurrency && (
        <span className="text-blue-600 dark:text-blue-400 font-bold">
          · {primaryRegion.devise}
        </span>
      )}
      {showLockHint && (
        <Lock className="w-3 h-3 text-blue-500 dark:text-blue-400 ml-0.5" aria-hidden="true" />
      )}
    </span>
  );
};
