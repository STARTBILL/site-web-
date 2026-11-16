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
import {
  getDb,
  saveDb,
  sanitizeUserForClient,
  SUPER_ADMIN_EMAIL,
  type DbUser,
} from './server/db.ts';
import {
  createAdminAuthRouter,
  createProtectedAdminRouter,
} from './server/adminRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  // Initialise et garantit le chargement du Super Admin seedé et du store persistant
  getDb();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Configuration publique CMS / Maintenance / Régions (aucune donnée sensible exposée)
  app.get('/api/public/config', (_req: Request, res: Response) => {
    const db = getDb();
    res.json({
      siteName: db.settings.siteName,
      logoUrl: db.settings.logoUrl,
      faviconUrl: db.settings.faviconUrl,
      maintenanceMode: db.settings.maintenanceMode,
      maintenanceMessage: db.settings.maintenanceMessage,
      cms: db.cms,
      pushNotifications: db.pushNotifications.slice(0, 3),
    });
  });

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
    const db = getDb();
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
    if (email === SUPER_ADMIN_EMAIL) {
      res.status(403).json({
        error: 'Cet email est réservé au Super Administrateur de la plateforme.',
      });
      return;
    }

    const user: DbUser = {
      id: `usr-${Date.now()}`,
      fullName,
      email,
      role: 'user',
      region,
      plan: 'Free',
      status: 'actif',
      profile,
      currency: DEFAULT_CURRENCY,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    const existingIdx = db.users.findIndex((u) => u.email === email);
    if (existingIdx >= 0) {
      db.users[existingIdx] = { ...db.users[existingIdx], ...user, id: db.users[existingIdx].id };
    } else {
      db.users.push(user);
    }
    saveDb(db);

    res.status(201).json({
      success: true,
      user: {
        ...sanitizeUserForClient(user),
        regionActive: isRegionActive(user.region),
      },
    });
  });

  // Liste d'attente également protégée par le middleware requireActiveRegion
  app.post('/api/waitlist', requireActiveRegion, (req: Request, res: Response) => {
    const db = getDb();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const fullName = String(req.body?.fullName || '').trim();
    const profile = String(req.body?.profile || 'autonome').trim();
    const region = (req.body?.normalizedRegion || DEFAULT_REGION) as RegionCode;

    if (!email || !email.includes('@') || !fullName) {
      res.status(400).json({ error: 'Champs requis manquants.' });
      return;
    }

    const entry: DbUser = {
      id: `wl-${Date.now()}`,
      fullName,
      email,
      role: 'user',
      region,
      plan: 'Free',
      status: 'actif',
      profile,
      currency: DEFAULT_CURRENCY,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    if (!db.users.some((u) => u.email === email)) {
      db.users.push(entry);
      saveDb(db);
    }

    res.status(201).json({
      success: true,
      entry: sanitizeUserForClient(entry),
    });
  });

  // Connexion standard utilisateur (le compte Super Admin doit utiliser /api/auth/admin/login avec mot de passe + 2FA)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const db = getDb();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const requestedRegion = normalizeRegionCode(req.body?.region);

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Veuillez saisir une adresse courriel valide.' });
      return;
    }

    if (email === SUPER_ADMIN_EMAIL) {
      res.status(403).json({
        success: false,
        requiresAdminAuth: true,
        error:
          'Le compte Super Administrateur requiert une authentification sécurisée par mot de passe et 2FA.',
      });
      return;
    }

    let user = db.users.find((u) => u.email === email);

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
        role: 'user',
        region: inferredRegion,
        plan: 'Free',
        status: 'actif',
        profile: 'autonome',
        currency:
          inferredRegion === 'CA' ? 'CAD' : inferredRegion === 'AF' ? 'XOF' : 'HTG',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveDb(db);
    }

    if (user.status === 'suspendu') {
      res.status(403).json({
        success: false,
        error: 'Ce compte a été suspendu par un administrateur.',
      });
      return;
    }

    const regionActive = isRegionActive(user.region);

    res.json({
      success: true,
      user: {
        ...sanitizeUserForClient(user),
        regionActive,
      },
      blocked: !regionActive,
      blockedMessage: !regionActive
        ? 'Votre région sera bientôt disponible. Merci de votre patience.'
        : null,
    });
  });

  // Authentification Super Administrateur (mot de passe bcrypt + changement initial + 2FA TOTP)
  app.use('/api/auth/admin', createAdminAuthRouter());

  // Routes /api/admin/* protégées par rate limiting (10 req/min) + requireSuperAdmin (RBAC + CSRF + 2FA + idle 30m)
  app.use('/api/admin', createProtectedAdminRouter());

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
    console.log(
      `STARTBILL server running on http://0.0.0.0:${PORT} (Active regions: ${ACTIVE_REGIONS.join(', ')})`
    );
  });
}

startServer();
