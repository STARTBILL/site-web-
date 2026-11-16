// config/regions.js
export const ACTIVE_REGIONS = ['CA']; // Ajouter 'AF', 'HT' plus tard

export const ALL_REGIONS = [
  { code: 'CA', label: 'Canada',  devise: 'CAD', flag: '🇨🇦', active: ACTIVE_REGIONS.includes('CA') },
  { code: 'AF', label: 'Afrique', devise: 'XOF', flag: '🌍', active: ACTIVE_REGIONS.includes('AF') },
  { code: 'HT', label: 'Haïti',   devise: 'HTG', flag: '🇭🇹', active: ACTIVE_REGIONS.includes('HT') },
];

export const DEFAULT_REGION = 'CA';

export const isRegionActive = (code) => ACTIVE_REGIONS.includes(code);

export const validateRegion = (code) => {
  const exists = ALL_REGIONS.some((region) => region.code === code);
  if (!exists) {
    console.warn(
      `[StartBill] Région inconnue "${String(code)}". Fallback sur "${DEFAULT_REGION}".`
    );
    return false;
  }
  return ACTIVE_REGIONS.includes(code);
};

export const resolveRegion = (code) => {
  const exists = ALL_REGIONS.some((region) => region.code === code);
  if (!exists) {
    console.warn(
      `[StartBill] Région inconnue "${String(code)}". Fallback sur "${DEFAULT_REGION}".`
    );
    return DEFAULT_REGION;
  }
  return code;
};
