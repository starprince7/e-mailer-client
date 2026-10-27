export interface RecipientInput {
  email: string;
  name?: string;
}

const EMAIL_PATTERN = /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+/gi;
const EMAIL_KEYS = new Set(['email', 'emailaddress', 'address', 'recipient']);
const NAME_KEYS = new Set(['name', 'fullname', 'firstname', 'displayname', 'contactname']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fieldValue(
  record: Record<string, unknown>,
  acceptedKeys: Set<string>
): string | undefined {
  for (const [key, value] of Object.entries(record)) {
    if (acceptedKeys.has(key.toLowerCase().replace(/[_\s-]/g, '')) && typeof value === 'string') {
      return value.trim() || undefined;
    }
  }
  return undefined;
}

function collectJsonRecipients(value: unknown, output: RecipientInput[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonRecipients(item, output));
    return;
  }

  if (!isRecord(value)) return;

  const email = fieldValue(value, EMAIL_KEYS);
  if (email && EMAIL_PATTERN.test(email)) {
    EMAIL_PATTERN.lastIndex = 0;
    output.push({
      email,
      name: fieldValue(value, NAME_KEYS),
    });
  } else {
    EMAIL_PATTERN.lastIndex = 0;
  }

  Object.values(value).forEach((child) => {
    if (Array.isArray(child) || isRecord(child)) collectJsonRecipients(child, output);
  });
}

function uniqueRecipients(recipients: RecipientInput[]): RecipientInput[] {
  const seen = new Set<string>();
  return recipients.filter(({ email }) => {
    const key = email.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractTextRecipients(input: string): RecipientInput[] {
  const recipients: RecipientInput[] = [];

  for (const match of input.matchAll(EMAIL_PATTERN)) {
    const email = match[0].replace(/[.,;:!?]+$/, '');
    const start = match.index ?? 0;
    const prefix = input.slice(0, start);
    const previousDelimiter = Math.max(
      prefix.lastIndexOf('\n'),
      prefix.lastIndexOf(','),
      prefix.lastIndexOf(';')
    );
    const context = prefix.slice(previousDelimiter + 1).trim();
    const displayName =
      context.match(/^(.{1,80}?)\s*<\s*$/)?.[1]?.trim() ??
      context.match(/^(.{1,80}?)\s*[:—-]\s*$/)?.[1]?.trim();

    recipients.push({
      email,
      name:
        displayName && !displayName.includes('@') && !/[.!?]\s/.test(displayName)
          ? displayName
          : undefined,
    });
  }

  return uniqueRecipients(recipients);
}

/**
 * Accept JSON recipient data or unstructured text and return a normalized
 * `{ email, name? }` list suitable for bulk sending.
 */
export function normalizeRecipientInput(input: string): RecipientInput[] {
  const value = input.trim();
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value.replace(/,\s*([}\]])/g, '$1'));
    const recipients: RecipientInput[] = [];
    collectJsonRecipients(parsed, recipients);
    if (recipients.length > 0) return uniqueRecipients(recipients);
  } catch {
    // If the pasted text isn't valid JSON, attempt plain-text extraction below.
  }

  return extractTextRecipients(value);
}

export function formatRecipientInput(recipients: RecipientInput[]): string {
  return JSON.stringify(
    recipients.map(({ email, name }) => ({
      email,
      ...(name ? { name } : {}),
    })),
    null,
    2
  );
}
