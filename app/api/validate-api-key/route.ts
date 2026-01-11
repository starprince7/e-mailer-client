import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!apiKey.startsWith('re_')) {
      return NextResponse.json(
        { error: 'Invalid API key format. Resend API keys should start with "re_"' },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    try {
      await resend.apiKeys.list();
      
      return NextResponse.json(
        {
          success: true,
          message: 'API key is valid',
        },
        { status: 200 }
      );
    } catch (error: any) {
      if (error.statusCode === 401 || error.message?.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your key and try again.' },
          { status: 401 }
        );
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to validate API key',
      },
      { status: 500 }
    );
  }
}
