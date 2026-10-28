import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getConfig } from '@/lib/config';

/**
 * POST /api/domains
 *
 * Lists the domains verified in the caller's Resend account so the
 * client can offer them as sender addresses. Accepts a browser-supplied
 * key (authoritative) and falls back to the server-configured key.
 */
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json().catch(() => ({ apiKey: null }));
    const key = apiKey || getConfig().resendApiKey;

    if (!key) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    const resend = new Resend(key);
    const { data, error } = await resend.domains.list();

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch domains' },
        { status: 400 }
      );
    }

    const domains = (data?.data ?? []).map((d) => ({
      name: d.name,
      status: d.status,
    }));

    return NextResponse.json({ domains });
  } catch (err) {
    console.error('Error fetching domains:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch domains' },
      { status: 500 }
    );
  }
}
