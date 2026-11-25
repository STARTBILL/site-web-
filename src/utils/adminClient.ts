let memoryAdminToken = '';

export function getStoredAdminToken(): string {
  return memoryAdminToken;
}

export function setStoredAdminToken(token: string): void {
  memoryAdminToken = token || '';
}

const API_BASE_URL = String(import.meta.env.VITE_API_URL || '')
  .trim()
  .replace(/\/+$/, '');

function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

async function parseJsonSafe(
  res: Response
): Promise<{ isJson: boolean; data: any; isHtml: boolean }> {
  let rawText = '';
  try {
    rawText = await res.text();
  } catch {
    return { isJson: false, data: null, isHtml: false };
  }

  const trimmed = rawText.trim();
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const looksJson = trimmed.startsWith('{') || trimmed.startsWith('[');
  const isHtml =
    ct.includes('text/html') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<');

  if (ct.includes('application/json') || looksJson) {
    try {
      const data = JSON.parse(trimmed);
      return { isJson: true, data, isHtml: false };
    } catch {
      return { isJson: false, data: null, isHtml };
    }
  }

  return { isJson: false, data: null, isHtml };
}

export async function adminApiRequest(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; data: any }> {
  const token = getStoredAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Admin-Session'] = token;
  }

  try {
    const res = await fetch(buildApiUrl(path), {
      ...options,
      credentials: 'include',
      headers,
    });
    const { isJson, data, isHtml } = await parseJsonSafe(res);
    if (isJson && data) {
      if (typeof data.sessionToken === 'string' && data.sessionToken) {
        setStoredAdminToken(data.sessionToken);
      }
      if (path === '/api/auth/admin/logout' && res.ok) {
        setStoredAdminToken('');
      }
      return { status: res.status, data };
    }

    const staticModeDetected = isHtml && (res.status === 200 || res.status === 404 || res.status === 405);
    return {
      status: res.status || 502,
      data: {
        isNonJson: true,
        staticHostDetected: staticModeDetected,
        error: staticModeDetected
          ? 'Backend Node.js non actif sur cet hébergement (réponse HTML statique reçue). Démarrez le serveur avec "npm start" (node server.ts).'
          : `Le serveur d’administration n’a pas renvoyé de réponse JSON valide (HTTP ${res.status}). Vérifiez que le backend Node.js est actif.`,
      },
    };
  } catch {
    return {
      status: 0,
      data: {
        isNonJson: true,
        error: 'Impossible de joindre le serveur d’administration STARTBILL.',
      },
    };
  }
}

export async function downloadAdminCsv(
  path: string,
  filename: string
): Promise<{ ok: boolean; error?: string }> {
  const token = getStoredAdminToken();
  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Admin-Session'] = token;
  }

  try {
    const res = await fetch(buildApiUrl(path), {
      method: 'GET',
      credentials: 'include',
      headers,
    });
    if (!res.ok) {
      const { isJson, data } = await parseJsonSafe(res);
      return {
        ok: false,
        error: (isJson && data?.error) || `Export impossible (${res.status}).`,
      };
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Erreur réseau lors du téléchargement CSV.' };
  }
}

export interface LocalWaitlistCandidate {
  fullName: string;
  email: string;
  profile: string;
  region: string;
  date?: string;
}

export function readLocalWaitlistCandidates(): LocalWaitlistCandidate[] {
  if (typeof window === 'undefined') return [];
  const results: LocalWaitlistCandidate[] = [];
  const seen = new Set<string>();

  const collect = (raw: string | null) => {
    if (!raw) return;
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        const email = String(item?.email || '').trim().toLowerCase();
        if (!email || !email.includes('@') || seen.has(email)) continue;
        seen.add(email);
        results.push({
          fullName: String(item?.fullName || email.split('@')[0]).trim(),
          email,
          profile: String(item?.profile || 'autonome').trim(),
          region: String(item?.region || 'CA').trim(),
          date: item?.date || item?.createdAt,
        });
      }
    } catch {
      // Ignore malformed local storage
    }
  };

  try {
    collect(localStorage.getItem('startbill_waitlist'));
    collect(localStorage.getItem('startbill_local_accounts_v1'));
  } catch {
    // Ignore storage access errors
  }

  return results;
}
