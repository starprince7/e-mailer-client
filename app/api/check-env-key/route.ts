import { NextResponse } from 'next/server';

export async function GET() {
  const hasEnvKey = !!process.env.RESEND_API_KEY;
  
  return NextResponse.json({
    hasEnvKey,
    message: hasEnvKey 
      ? 'Resend API key is configured via environment variable'
      : 'No Resend API key found in environment variables'
  });
}
