import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sendEmailSchema } from '@/lib/validation';

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

    const formData = await request.formData();
    const to = formData.get('to') as string;
    const cc = formData.get('cc') as string | null;
    const bcc = formData.get('bcc') as string | null;
    const subject = formData.get('subject') as string;
    const body = formData.get('body') as string;
    const html = formData.get('html') as string;

    const validationData = {
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject,
      body,
      html: html || undefined,
    };

    const result = sendEmailSchema.safeParse(validationData);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.errors },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    const toEmails = to.split(',').map(email => email.trim());
    const ccEmails = cc ? cc.split(',').map(email => email.trim()) : undefined;
    const bccEmails = bcc ? bcc.split(',').map(email => email.trim()) : undefined;

    const fromTitle = formData.get('fromTitle') as string || 'Prince ' ;
    const emailData: any = {
      from: `${fromTitle} <mailer@starprince.dev>`,
      to: toEmails,
      subject,
      html: html || `<p>${body.replace(/\n/g, '<br>')}</p>`,
    };

    if (ccEmails && ccEmails.length > 0) {
      emailData.cc = ccEmails;
    }

    if (bccEmails && bccEmails.length > 0) {
      emailData.bcc = bccEmails;
    }

    const attachments = formData.getAll('attachments') as File[];
    if (attachments.length > 0) {
      emailData.attachments = await Promise.all(
        attachments.map(async (file) => {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          return {
            filename: file.name,
            content: buffer,
          };
        })
      );
    }

    const response = await resend.emails.send(emailData);

    if (response.error) {
      console.error('Resend API error:', response.error);
      return NextResponse.json(
        { error: response.error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: response.data?.id,
          message: 'Email sent successfully',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
