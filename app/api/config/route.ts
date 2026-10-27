import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';

/**
 * GET /api/config
 *
 * Returns the non-secret subset of the app configuration so the client
 * can prefill sender fields and resolve template variables.
 * Never exposes resendApiKey or adminEmail.
 */
export async function GET() {
  const config = getConfig();

  return NextResponse.json({
    fromEmail: config.fromEmail ?? null,
    fromName: config.fromName,
    templateVars: config.templateVars,
    resendConfigured: !!config.resendApiKey,
  });
}
