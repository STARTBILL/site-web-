import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
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

  // Inscription (Sign-up) verrouillée par le middleware requireActiveRegion + mot de passe haché bcrypt
  app.post('/api/auth/signup', requireActiveRegion, async (req: Request, res: Response) => {
    const db = getDb();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const fullName = String(req.body?.fullName || '').trim();
    const password = String(req.body?.password || '');
    const profile = String(req.body?.profile || 'autonome').trim();
    const region = (req.body?.normalizedRegion || DEFAULT_REGION) as RegionCode;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Veuillez renseigner une adresse courriel valide.' });
      return;
    }
    if (!fullName) {
      res.status(400).json({ error: 'Veuillez indiquer votre nom complet ou entreprise.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 8 caractères.',
      });
      return;
    }
    if (email === SUPER_ADMIN_EMAIL) {
      res.status(403).json({
        error: 'Cet email est réservé au Super Administrateur de la plateforme.',
      });
      return;
    }

    const existingIdx = db.users.findIndex((u) => u.email === email);
    const existingUser = existingIdx >= 0 ? db.users[existingIdx] : null;
    if (existingUser && (existingUser.emailVerified || existingUser.passwordHash)) {
      res.status(409).json({
        error: 'Un compte existe déjà avec cette adresse courriel. Veuillez vous connecter.',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const nowIso = new Date().toISOString();

    const user: DbUser = {
      id: existingUser?.id || `usr-${Date.now()}`,
      fullName,
      email,
      role: 'user',
      region,
      plan: 'Free',
      status: 'actif',
      profile,
      currency: DEFAULT_CURRENCY,
      emailVerified: true,
      passwordHash,
      createdAt: existingUser?.createdAt || nowIso,
      lastLoginAt: nowIso,
    };

    if (existingIdx >= 0) {
      db.users[existingIdx] = user;
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
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const db = getDb();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const demoQuickLogin = Boolean(req.body?.demoQuickLogin);

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

    const user = db.users.find((u) => u.email === email);

    if (!user) {
      res.status(401).json({
        success: false,
        error:
          "Aucun compte trouvé avec cette adresse courriel. Créez un compte via l'onglet Inscription.",
      });
      return;
    }

    if (user.status === 'suspendu') {
      res.status(403).json({
        success: false,
        error: 'Ce compte a été suspendu par un administrateur.',
      });
      return;
    }

    const isDemoAccount =
      email === 'demo@startbill.ca' ||
      email === 'test-af@startbill.ca' ||
      email === 'test-ht@startbill.ca';

    if (user.passwordHash) {
      if (!password) {
        res.status(401).json({
          success: false,
          error: 'Veuillez saisir votre mot de passe.',
        });
        return;
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({
          success: false,
          error: 'Adresse courriel ou mot de passe incorrect.',
        });
        return;
      }
    } else if (!isDemoAccount && !demoQuickLogin) {
      if (!password) {
        res.status(401).json({
          success: false,
          error: 'Veuillez saisir votre mot de passe.',
        });
        return;
      }
    }

    user.lastLoginAt = new Date().toISOString();
    saveDb(db);

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
