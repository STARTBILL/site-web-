/**
 * scripts/seedAdmin.js
 * Script d'initialisation sécurisé du Super Administrateur unique STARTBILL.
 *
 * Usage sécurisé :
 *   SEED_ADMIN_PASSWORD="<mot_de_passe>" node scripts/seedAdmin.js
 * ou via stdin :
 *   printf '%s' "<mot_de_passe>" | node scripts/seedAdmin.js --stdin
 *
 * Sécurité :
 * - Aucun mot de passe en clair stocké ni journalisé.
 * - Hachage bcrypt avec 12 rounds.
 * - Flag mustChangePassword: true activé à l'initialisation.
 * - Compte unique non supprimable (immutable: true).
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT_DIR, 'data', 'startbill-db.json');

export const SUPER_ADMIN_EMAIL = 'contact.startbill@gmail.com';
const BCRYPT_ROUNDS = 12;

async function readPasswordFromPrompt() {
  if (process.env.SEED_ADMIN_PASSWORD) {
    return process.env.SEED_ADMIN_PASSWORD.trim();
  }

  if (process.argv.includes('--stdin')) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf8').trim();
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`Mot de passe initial pour ${SUPER_ADMIN_EMAIL} : `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const password = await readPasswordFromPrompt();

  if (!password || password.length < 12) {
    console.error(
      '[seedAdmin] Erreur : un mot de passe initial robuste (>= 12 caractères) est requis via SEED_ADMIN_PASSWORD ou stdin.'
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let db = { users: [] };
  if (fs.existsSync(DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      if (!Array.isArray(db.users)) db.users = [];
    } catch {
      db = { users: [] };
    }
  }

  const existingIndex = db.users.findIndex(
    (u) => String(u.email).toLowerCase() === SUPER_ADMIN_EMAIL
  );

  const now = new Date().toISOString();
  const existingUser = existingIndex >= 0 ? db.users[existingIndex] : null;

  const adminRecord = {
    id: existingUser?.id || 'usr-super-admin-001',
    fullName: existingUser?.fullName || 'Super Administrateur STARTBILL',
    email: SUPER_ADMIN_EMAIL,
    role: 'super_admin',
    region: 'CA', // Accès global multi-régions via rôle super_admin
    plan: 'Pro',
    status: 'actif',
    profile: 'super_admin',
    currency: 'CAD',
    emailVerified: true,
    mustChangePassword: true,
    immutable: true, // Protection contre toute suppression
    totpEnabled: Boolean(existingUser?.totpEnabled),
    totpSecret: existingUser?.totpSecret || null,
    passwordHash,
    createdAt: existingUser?.createdAt || now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    db.users[existingIndex] = adminRecord;
  } else {
    db.users.unshift(adminRecord);
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), { mode: 0o600 });

  console.log(
    `[seedAdmin] Super Administrateur initialisé avec succès (${SUPER_ADMIN_EMAIL}, role=super_admin, region=CA, rounds=${BCRYPT_ROUNDS}, mustChangePassword=true, immutable=true).`
  );
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectExecution) {
  main().catch((err) => {
    console.error('[seedAdmin] Échec de initialisation :', err.message);
    process.exit(1);
  });
}
