import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  ACTIVE_REGIONS,
  ALL_REGIONS,
  DEFAULT_CURRENCY,
  DEFAULT_REGION,
  isRegionActive,
  normalizeRegionCode,
  resolveRegionOrFallback,
  validateRegion,
} from './src/config/regions.ts';
import type { RegionCode } from './src/config/regions.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  region: RegionCode;
  profile: string;
  currency: string;
  createdAt: string;
}

// Comptes de démonstration / test pré-existants pour valider les scénarios CA, AF et HT
const usersStore = new Map<string, RegisteredUser>([
  [
    'demo@startbill.ca',
    {
      id: 'usr-ca-001',
      fullName: 'Sophie Tremblay',
      email: 'demo@startbill.ca',
      region: 'CA',
      profile: 'pme',
      currency: 'CAD',
      createdAt: '2026-10-01T10:00:00.000Z',
    },
  ],
  [
    'test-af@startbill.ca',
    {
      id: 'usr-af-001',
      fullName: 'Amadou Diallo (Compte Test AF)',
      email: 'test-af@startbill.ca',
      region: 'AF',
      profile: 'commercant',
      currency: 'XOF',
      createdAt: '2026-10-02T10:00:00.000Z',
    },
  ],
  [
    'test-ht@startbill.ca',
    {
      id: 'usr-ht-001',
      fullName: 'Jean-Marc Pierre (Compte Test HT)',
      email: 'test-ht@startbill.ca',
      region: 'HT',
      profile: 'autonome',
      currency: 'HTG',
      createdAt: '2026-10-03T10:00:00.000Z',
    },
  ],
]);

/**
 * Middleware Express : bloque toute tentative d'inscription ou de soumission
 * provenant d'une région non présente dans ACTIVE_REGIONS (ex: 'AF' ou 'HT').
 */
export function requireActiveRegion(req: Request, res: Response, next: NextFunction): void {
  const rawRegion = req.body?.region;
  const normalizedRegion = normalizeRegionCode(rawRegion);

  if (!validateRegion(rawRegion)) {
    res.status(403).json({
      success: false,
      code: 'REGION_NOT_ACTIVE',
      region: normalizedRegion || rawRegion || 'UNKNOWN',
      activeRegions: ACTIVE_REGIONS,
      error: "StartBill n'est pas encore disponible dans votre région.",
    });
    return;
  }

  req.body.normalizedRegion = normalizedRegion ?? DEFAULT_REGION;
  next();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Configuration des régions actives & devise forcée par défaut
  app.get('/api/config/regions', (_req: Request, res: Response) => {
    res.json({
      activeRegions: ACTIVE_REGIONS,
      defaultRegion: DEFAULT_REGION,
      defaultCurrency: DEFAULT_CURRENCY,
      regions: ALL_REGIONS,
    });
  });

  // Inscription (Sign-up) verrouillée par le middleware requireActiveRegion
  app.post('/api/auth/signup', requireActiveRegion, (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const fullName = String(req.body?.fullName || '').trim();
    const profile = String(req.body?.profile || 'autonome').trim();
    const region = (req.body?.normalizedRegion || DEFAULT_REGION) as RegionCode;

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Veuillez renseigner une adresse courriel valide.' });
      return;
    }
    if (!fullName) {
      res.status(400).json({ error: 'Veuillez indiquer votre nom complet ou entreprise.' });
      return;
    }

    const user: RegisteredUser = {
      id: `usr-${Date.now()}`,
      fullName,
      email,
      region,
      profile,
      currency: DEFAULT_CURRENCY,
      createdAt: new Date().toISOString(),
    };

    usersStore.set(email, user);

    res.status(201).json({
      success: true,
      user: {
        ...user,
        regionActive: isRegionActive(user.region),
      },
    });
  });

  // Liste d'attente également protégée par le middleware requireActiveRegion
  app.post('/api/waitlist', requireActiveRegion, (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const fullName = String(req.body?.fullName || '').trim();
    const profile = String(req.body?.profile || 'autonome').trim();
    const region = (req.body?.normalizedRegion || DEFAULT_REGION) as RegionCode;

    if (!email || !email.includes('@') || !fullName) {
      res.status(400).json({ error: 'Champs requis manquants.' });
      return;
    }

    const entry: RegisteredUser = {
      id: `wl-${Date.now()}`,
      fullName,
      email,
      region,
      profile,
      currency: DEFAULT_CURRENCY,
      createdAt: new Date().toISOString(),
    };

    if (!usersStore.has(email)) {
      usersStore.set(email, entry);
    }

    res.status(201).json({
      success: true,
      entry,
    });
  });

  // Connexion (Login) : renvoie l'utilisateur et indique si sa région est active
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const requestedRegion = normalizeRegionCode(req.body?.region);

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Veuillez saisir une adresse courriel valide.' });
      return;
    }

    let user = usersStore.get(email);

    // Si compte test ou connexion dynamique non pré-enregistrée
    if (!user) {
      const inferredRegion: RegionCode = requestedRegion
        ? requestedRegion
        : req.body?.region
        ? resolveRegionOrFallback(req.body.region)
        : email.includes('-af')
        ? 'AF'
        : email.includes('-ht')
        ? 'HT'
        : DEFAULT_REGION;
      user = {
        id: `usr-${Date.now()}`,
        fullName: email.split('@')[0],
        email,
        region: inferredRegion,
        profile: 'autonome',
        currency:
          inferredRegion === 'CA' ? 'CAD' : inferredRegion === 'AF' ? 'XOF' : 'HTG',
        createdAt: new Date().toISOString(),
      };
      usersStore.set(email, user);
    }

    const regionActive = isRegionActive(user.region);

    res.json({
      success: true,
      user: {
        ...user,
        regionActive,
      },
      blocked: !regionActive,
      blockedMessage: !regionActive
        ? 'Votre région sera bientôt disponible. Merci de votre patience.'
        : null,
    });
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`STARTBILL server running on http://0.0.0.0:${PORT} (Active regions: ${ACTIVE_REGIONS.join(', ')})`);
  });
}

startServer();
