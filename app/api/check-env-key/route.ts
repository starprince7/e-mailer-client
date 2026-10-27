import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';

export async function GET() {
  const hasEnvKey = !!getConfig().resendApiKey;

  return NextResponse.json({
    hasEnvKey,
    message: hasEnvKey
      ? 'Resend API key is configured'
      : 'No Resend API key found — set "resendApiKey" in app.config.json or the RESEND_API_KEY environment variable'
  });
}
