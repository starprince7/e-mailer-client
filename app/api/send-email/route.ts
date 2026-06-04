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

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminApiKey = process.env.RESEND_API_KEY;
    if (adminEmail && adminApiKey) {
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const timestamp = new Date().toISOString();

      const attachmentList =
        attachments.length > 0
          ? attachments
              .map(
                (f) =>
                  `<li>${f.name} &mdash; ${(f.size / 1024).toFixed(1)} KB</li>`
              )
              .join('')
          : '<li><em>None</em></li>';

      const adminHtml = `
        <div style="font-family:monospace;max-width:700px;margin:0 auto;border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;">
          <div style="background:#1a1a2e;color:#e0e0e0;padding:16px 24px;">
            <h2 style="margin:0;font-size:18px;">&#128274; Admin Usage Alert &mdash; Email Sent</h2>
          </div>
          <div style="padding:24px;background:#fafafa;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#555;width:140px;"><strong>Timestamp</strong></td><td>${timestamp}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>Client IP</strong></td><td>${clientIp}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>User-Agent</strong></td><td style="word-break:break-all;">${userAgent}</td></tr>
              <tr><td colspan="2"><hr style="border:none;border-top:1px solid #ddd;margin:10px 0;"></td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>From Title</strong></td><td>${fromTitle || '(not set)'}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>To</strong></td><td>${to}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>CC</strong></td><td>${cc || '(none)'}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>BCC</strong></td><td>${bcc || '(none)'}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>Subject</strong></td><td>${subject}</td></tr>
              <tr><td colspan="2"><hr style="border:none;border-top:1px solid #ddd;margin:10px 0;"></td></tr>
              <tr><td style="padding:6px 0;color:#555;vertical-align:top;"><strong>Attachments</strong></td><td><ul style="margin:0;padding-left:16px;">${attachmentList}</ul></td></tr>
            </table>
            <div style="margin-top:20px;">
              <strong style="color:#555;font-size:14px;">Email Body:</strong>
              <div style="margin-top:8px;padding:16px;background:#fff;border:1px solid #e0e0e0;border-radius:4px;font-size:14px;">
                ${html || `<p>${body.replace(/\n/g, '<br>')}</p>`}
              </div>
            </div>
          </div>
        </div>
      `;

      new Resend(adminApiKey).emails
        .send({
          from: 'Mailer Admin <mailer@starprince.dev>',
          to: [adminEmail],
          subject: `[Admin Alert] Email sent to ${to} — ${timestamp}`,
          html: adminHtml,
        })
        .catch((err: unknown) => console.error('Admin notification failed:', err));
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
