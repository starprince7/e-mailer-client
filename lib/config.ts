import fs from 'node:fs';
import path from 'node:path';

export interface AppConfig {
  resendApiKey?: string;
  fromEmail?: string;
  fromName: string;
  adminEmail?: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  templateVars: Record<string, string>;
}

const CONFIG_FILENAME = 'app.config.json';

let cachedConfig: AppConfig | null = null;

function parseAddressField(value: string): { name?: string; email?: string } {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1] || undefined, email: match[2] || undefined };
  }
  return { email: value.trim() || undefined };
}

function readConfigFile(): Record<string, unknown> {
  try {
    const filePath = path.join(process.cwd(), CONFIG_FILENAME);
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Failed to read ${CONFIG_FILENAME}:`, error);
    return {};
  }
}

function readEnvJson(key: string): Record<string, string> {
  try {
    const raw = process.env[key];
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function toNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function toStringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

/**
 * Loads application configuration.
 *
 * Precedence per field:
 *   1. app.config.json (project root — gitignored, authoritative)
 *   2. Environment variables (fallback when the config file is absent
 *      or a field is empty)
 *   3. Built-in defaults
 *
 * Result is cached for the lifetime of the process. Server-side only.
 */
export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const file = readConfigFile();
  const envFrom = parseAddressField(process.env.FROM_EMAIL ?? '');

  cachedConfig = {
    resendApiKey:
      toStringOrUndefined(file.resendApiKey) ?? process.env.RESEND_API_KEY,
    fromEmail:
      toStringOrUndefined(file.fromEmail) ?? envFrom.email,
    fromName:
      toStringOrUndefined(file.fromName) ??
      process.env.FROM_NAME ??
      envFrom.name ??
      'Sender',
    adminEmail:
      toStringOrUndefined(file.adminEmail) ?? process.env.ADMIN_EMAIL,
    rateLimitMax: toNumber(
      file.rateLimitMax ?? process.env.RATE_LIMIT_MAX,
      10
    ),
    rateLimitWindowMs: toNumber(
      file.rateLimitWindowMs ?? process.env.RATE_LIMIT_WINDOW_MS,
      60 * 1000
    ),
    templateVars: {
      ...readEnvJson('TEMPLATE_VARS'),
      ...((file.templateVars as Record<string, string>) ?? {}),
    },
  };

  return cachedConfig;
}
