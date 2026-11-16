/**
 * Configuration centralisée des régions (sans dépendance à process.env.ACTIVE_REGIONS).
 * Source de vérité unique : config/regions.js.
 * Pour activer l'Afrique ('AF') ou Haïti ('HT'), modifiez ACTIVE_REGIONS dans config/regions.js.
 */

import {
  ACTIVE_REGIONS as BASE_ACTIVE_REGIONS,
  ALL_REGIONS as BASE_ALL_REGIONS,
  DEFAULT_REGION as BASE_DEFAULT_REGION,
} from '../../config/regions.js';

export type RegionCode = 'CA' | 'AF' | 'HT';
export type RegionKey = 'canada' | 'afrique' | 'haiti';
export type CurrencyCode = 'CAD' | 'XOF' | 'HTG';

export const ACTIVE_REGIONS: RegionCode[] = BASE_ACTIVE_REGIONS as RegionCode[];
export const DEFAULT_REGION: RegionCode = (BASE_DEFAULT_REGION as RegionCode) || 'CA';
export const DEFAULT_REGION_CODE: RegionCode = ACTIVE_REGIONS[0] ?? DEFAULT_REGION;

export interface RegionDefinition {
  code: RegionCode;
  key: RegionKey;
  label: string;
  labelEn: string;
  flag: string;
  devise: CurrencyCode;
  active: boolean;
}

const REGION_UI_META: Record<RegionCode, { key: RegionKey; labelEn: string; flag: string }> = {
  CA: { key: 'canada', labelEn: 'Canada', flag: '🇨🇦' },
  AF: { key: 'afrique', labelEn: 'Africa', flag: '🌍' },
  HT: { key: 'haiti', labelEn: 'Haiti', flag: '🇭🇹' },
};

export const ALL_REGIONS: RegionDefinition[] = BASE_ALL_REGIONS.map((item) => {
  const code = item.code as RegionCode;
  const meta = REGION_UI_META[code] ?? {
    key: 'canada' as RegionKey,
    labelEn: item.label,
    flag: '🏳️',
  };
  return {
    code,
    key: meta.key,
    label: item.label,
    labelEn: meta.labelEn,
    flag: (item as { flag?: string }).flag || meta.flag,
    devise: item.devise as CurrencyCode,
    active: ACTIVE_REGIONS.includes(code),
  };
});

export const IS_MULTI_REGION = ACTIVE_REGIONS.length > 1;

export const DEFAULT_REGION_CONFIG: RegionDefinition =
  ALL_REGIONS.find((r) => r.code === DEFAULT_REGION_CODE) ?? ALL_REGIONS[0];

export const DEFAULT_CURRENCY: CurrencyCode = DEFAULT_REGION_CONFIG.devise;

const REGION_ALIASES: Record<string, RegionCode> = {
  ca: 'CA',
  canada: 'CA',
  af: 'AF',
  afrique: 'AF',
  senegal: 'AF',
  ci: 'AF',
  cameroun: 'AF',
  benin: 'AF',
  afriqueautre: 'AF',
  ht: 'HT',
  haiti: 'HT',
  haïti: 'HT',
};

export function normalizeRegionCode(input?: string | null): RegionCode | null {
  if (!input) return null;
  const cleaned = input.trim().toLowerCase();
  if (cleaned in REGION_ALIASES) {
    return REGION_ALIASES[cleaned];
  }
  const upper = input.trim().toUpperCase();
  if (ALL_REGIONS.some((r) => r.code === upper)) {
    return upper as RegionCode;
  }
  return null;
}

/**
 * Résout une région vers son code canonique ou logge un avertissement
 * et effectue un fallback sécurisé sur DEFAULT_REGION ('CA').
 */
export function resolveRegionOrFallback(input?: string | null): RegionCode {
  const normalized = normalizeRegionCode(input);
  if (!normalized || !ALL_REGIONS.some((r) => r.code === normalized)) {
    console.warn(
      `[StartBill] Région inconnue "${String(input)}". Fallback sécurisé sur "${DEFAULT_REGION}".`
    );
    return DEFAULT_REGION;
  }
  return normalized;
}

/**
 * Renvoie true uniquement si la région existe dans ALL_REGIONS ET est active dans ACTIVE_REGIONS.
 */
export function validateRegion(input?: string | null): boolean {
  const normalized = normalizeRegionCode(input);
  if (!normalized || !ALL_REGIONS.some((r) => r.code === normalized)) {
    console.warn(
      `[StartBill] Région invalide ou inconnue "${String(input)}". Fallback attendu : "${DEFAULT_REGION}".`
    );
    return false;
  }
  return ACTIVE_REGIONS.includes(normalized);
}

export function isRegionActive(input?: string | null): boolean {
  return validateRegion(input);
}

export function getActiveRegionsList(): RegionDefinition[] {
  return ALL_REGIONS.filter((region) => ACTIVE_REGIONS.includes(region.code));
}
