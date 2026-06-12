import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 1000;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

function extractFirstName(name?: string): string {
  if (!name || name.trim() === '') {
    return 'there';
  }
  const words = name.trim().split(/\s+/);
  return words[0];
}

function replacePlaceholders(text: string, firstName: string): string {
  return text.replace(/\{\{firstName\}\}/g, firstName);
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Please configure your Resend API key in settings.' },
        { status: 401 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { recipients, subject, body: emailBody, fromTitle, fromEmail } = body;

    if (!recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Recipients must be an array' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!emailBody || typeof emailBody !== 'string') {
      return NextResponse.json(
        { error: 'Email body is required' },
        { status: 400 }
      );
    }

    if (!fromTitle || typeof fromTitle !== 'string') {
      return NextResponse.json(
        { error: 'From title is required' },
        { status: 400 }
      );
    }

    if (!fromEmail || typeof fromEmail !== 'string') {
      return NextResponse.json(
        { error: 'From email is required' },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);
    const errors: { email: string; error: string }[] = [];
    let succeeded = 0;
    let failed = 0;

    for (const recipient of recipients) {
      if (!recipient || typeof recipient !== 'object') {
        errors.push({ email: 'unknown', error: 'Invalid recipient object' });
        failed++;
        continue;
      }

      const email = recipient.email;
      if (!email || typeof email !== 'string') {
        errors.push({ email: 'unknown', error: 'Email field missing or invalid' });
        failed++;
        continue;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push({ email, error: 'Invalid email address' });
        failed++;
        continue;
      }

      const firstName = extractFirstName(recipient.name);
      const personalizedSubject = replacePlaceholders(subject, firstName);
      const personalizedBody = replacePlaceholders(emailBody, firstName);

      try {
        const response = await resend.emails.send({
          from: `${fromTitle} <${fromEmail}>`,
          to: [email.trim()],
          subject: personalizedSubject,
          html: personalizedBody,
        });

        if (response.error) {
          console.error(`Failed to send to ${email}:`, response.error);
          errors.push({ email, error: response.error.message || 'Failed to send' });
          failed++;
        } else {
          succeeded++;
        }
      } catch (error) {
        console.error(`Error sending to ${email}:`, error);
        errors.push({ email, error: error instanceof Error ? error.message : 'Unknown error' });
        failed++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          total: recipients.length,
          succeeded,
          failed,
          errors: errors.length > 0 ? errors : undefined,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in bulk email send:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
