#!/usr/bin/env node
/**
 * Initializes app.config.json (the app's authoritative, gitignored config)
 * by prompting for the required values.
 *
 * Existing values are prefilled from (in priority order):
 *   app.config.json -> .env.local -> .env
 *
 * Usage: npm run setup   (or: node scripts/setup.mjs)
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const configPath = path.join(root, 'app.config.json');
const examplePath = path.join(root, 'app.config.example.json');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function readEnvFile(name) {
  const filePath = path.join(root, name);
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

function parseAddressField(value) {
  if (!value) return {};
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1] || undefined, email: match[2] };
  return { email: value };
}

const existing = readJson(configPath);
const example = readJson(examplePath);
const env = { ...readEnvFile('.env'), ...readEnvFile('.env.local') };
const envFrom = parseAddressField(env.FROM_EMAIL);

const first = (...values) => values.find((v) => typeof v === 'string' && v.trim() !== '')?.trim();

const defaults = {
  resendApiKey: first(existing.resendApiKey, env.RESEND_API_KEY) ?? '',
  fromEmail: first(existing.fromEmail, envFrom.email) ?? 'mailer@example.com',
  fromName: first(existing.fromName, env.FROM_NAME, envFrom.name) ?? 'Sender',
  adminEmail: first(existing.adminEmail, env.ADMIN_EMAIL) ?? '',
};

let finished = false;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('close', () => {
  if (!finished) {
    console.log('\nAborted — no changes written.');
    process.exit(0);
  }
});
const ask = (question, fallback) =>
  new Promise((resolve) => {
    const hint = fallback ? ` [${fallback}]` : '';
    rl.question(`${question}${hint}: `, (answer) => {
      resolve(answer.trim() || fallback);
    });
  });

console.log('Email Client Setup\n');
console.log('This creates app.config.json in the project root.');
console.log('It is gitignored — safe to store secrets here.\n');

const answers = {
  resendApiKey: await ask('Resend API key (https://resend.com/api-keys)', defaults.resendApiKey),
  fromEmail: await ask('Sender email address (must be a verified Resend domain)', defaults.fromEmail),
  fromName: await ask('Default sender name', defaults.fromName),
  adminEmail: await ask('Admin notification email (optional, receives a copy of every send)', defaults.adminEmail),
};

finished = true;
rl.close();

const config = {
  ...example,
  ...existing,
  resendApiKey: answers.resendApiKey,
  fromEmail: answers.fromEmail,
  fromName: answers.fromName,
  adminEmail: answers.adminEmail,
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

if (!config.resendApiKey) {
  console.log('\n⚠  No Resend API key set — add one to app.config.json before sending.');
}

console.log(`\nDone — wrote ${path.relative(process.cwd(), configPath)}`);
console.log('Run `npm run dev` to start the app.');
