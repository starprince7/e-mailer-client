import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getConfig } from '@/lib/config';
import { resolveTemplateVars } from '@/lib/templates';

const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (userLimit.count >= max) {
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
    const config = getConfig();
    const apiKey = request.headers.get('x-api-key') || config.resendApiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Please configure your Resend API key in settings.' },
        { status: 401 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(clientIp, config.rateLimitMax, config.rateLimitWindowMs)) {
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

    const resolvedFromTitle =
      typeof fromTitle === 'string' && fromTitle.trim() ? fromTitle : config.fromName;
    const resolvedFromEmail =
      typeof fromEmail === 'string' && fromEmail.trim() ? fromEmail : config.fromEmail;

    if (!resolvedFromEmail) {
      return NextResponse.json(
        { error: 'Sender address is not configured. Set "fromEmail" in app.config.json or the FROM_EMAIL environment variable.' },
        { status: 500 }
      );
    }

    const resolvedSubject = resolveTemplateVars(subject, config.templateVars);
    const resolvedBody = resolveTemplateVars(emailBody, config.templateVars);

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
      const personalizedSubject = replacePlaceholders(resolvedSubject, firstName);
      const personalizedBody = replacePlaceholders(resolvedBody, firstName);

      try {
        const response = await resend.emails.send({
          from: `${resolvedFromTitle} <${resolvedFromEmail}>`,
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
