import { EmailTemplate } from '../types';

export interface PromoProductConfig {
  productName: string;
  tagline: string;
  priceDisplay: string;
  originalPriceDisplay?: string;
  ctaUrl: string;
  ctaText: string;
  supportContact: string;
  senderName: string;
  urgencyText?: string;
  limitedUnits?: number;
  deadlineText?: string;
  preheaderText?: string;
  headerEyebrow?: string;
  headline?: string;
  subheadline?: string;
  problemHeadline?: string;
  problemBody1?: string;
  problemBody2?: string;
  painPoints?: string[];
  solutionBody?: string;
  productCapacityDescription?: string;
  deliveryValue?: string;
  bonus1Name?: string;
  bonus1Description?: string;
  bonus1Value?: string;
  bonus2Name?: string;
  bonus2Description?: string;
  bonus2Value?: string;
  guaranteeTitle?: string;
  guaranteeBody?: string;
  testimonials?: Array<{ quote: string; attribution: string }>;
  ctaHeadline?: string;
  ctaSubtext?: string;
}

export function generatePromoEmailHTML(config: PromoProductConfig): string {
  const {
    productName,
    tagline,
    priceDisplay,
    originalPriceDisplay = '₦706,500+ if purchased separately',
    ctaUrl,
    ctaText,
    supportContact,
    senderName,
    urgencyText = 'Only a few units left at this price',
    limitedUnits,
    deadlineText,
    preheaderText = "The next blackout won't stop you — here's your permanent solution, with everything included.",
    headerEyebrow = 'BLACKOUT-PROOF YOUR HOME &amp; BUSINESS',
    headline = "What If The Next Power Outage<br>Didn't Disrupt A Single Minute<br>Of Your Life?",
    subheadline = "Lights stay on. Laptops keep running. Router stays connected.<br>Business doesn't stop. Family stays comfortable.",
    problemHeadline = 'NEPA takes light. You lose money. Again.',
    problemBody1 = "Every time power goes out, the clock starts ticking. Your laptop battery drops. Your Zoom call cuts off mid-sentence. Your customer is left waiting. Your child can't study. And you're sitting there — staring at a generator you have to fuel, maintain, and tolerate the noise of — hoping it doesn't fail <em>again</em>.",
    problemBody2 = `The average Nigerian professional loses <strong style="color:#DC2626;">4–8 hours of productive time</strong> every week to power interruptions. That's over <strong style="color:#DC2626;">25 full working days</strong> per year — gone.`,
    painPoints = [
      'Missed a client call because power went out at the worst time',
      'Lost unsaved work when your laptop died suddenly',
      'Spending ₦30,000+ monthly on fuel for a loud, smelly generator',
      'Telling your family "just wait, power will come back soon" — for the fifth time this week',
    ],
    solutionBody = "Plug it in. Charge it from solar. And the next time NEPA takes light, you don't even notice. No fumes. No noise. No fuel runs. Just clean, silent power — available the moment you need it.",
    productCapacityDescription = '768Wh capacity · Powers laptops, fans, routers, lights, TVs, and small appliances simultaneously',
    deliveryValue = '₦8,000 FREE',
    bonus1Name = 'Extended Warranty Cover',
    bonus1Description = 'Extended manufacturer warranty included at no extra cost — full parts &amp; service coverage so you never have to worry about repair bills',
    bonus1Value = '₦45,000 FREE',
    bonus2Name = 'Free Solar Panel Installation',
    bonus2Description = "Add a compatible solar panel to your order and we'll professionally install it for free — so the sun recharges your battery while NEPA is away. Fuel bills: ₦0.",
    bonus2Value = '₦35,000 FREE',
    guaranteeTitle = '100% Satisfaction Guarantee — No Time Limit',
    guaranteeBody: guaranteeBodyRaw,
    testimonials: testimonialsRaw,
    ctaHeadline = 'Stop losing hours — and money — to power cuts',
    ctaSubtext = 'The next blackout is coming. The only question is whether it disrupts you or not.',
  } = config;

  const guaranteeBody = guaranteeBodyRaw ?? `If the ${productName} doesn't keep your home or business running through every blackout exactly as promised, tell us and we'll make it right — full refund or replacement, no questions, no deadline. We're that confident this changes your daily life. The only risk you're taking is spending another month the way things are now.`;

  const testimonials = testimonialsRaw ?? [
    {
      quote: "NEPA took light for 11 hours last Tuesday. My laptop, router, and ring light ran the whole time. I finished two client deliverables and nobody even knew there was an outage on my end.",
      attribution: "Tunde A., Freelance Designer, Lagos",
    },
    {
      quote: `I used to spend ₦40,000 a month on petrol for my generator. Since I got the ${productName} with the solar panel, that cost is almost zero. It paid for itself faster than I expected.`,
      attribution: "Chidinma O., Small Business Owner, Abuja",
    },
  ];

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${productName} — Never Lose Power Again</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Inter, Arial, sans-serif; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }

    /* Base */
    body { margin: 0 !important; padding: 0 !important; background-color: #fbf5ea; width: 100% !important; color: #21190f; }

    /* Hover Effects for Modern Clients */
    .cta-btn {
      transition: all 0.22s ease-in-out !important;
    }
    .cta-btn:hover {
      background: linear-gradient(135deg,#fff3c2,#f4ce54,#e2a11b) !important;
      border-color: #f4ce54 !important;
      box-shadow: 0 6px 22px rgba(216,154,18, 0.55) !important;
      transform: translateY(-1px) scale(1.02) !important;
    }

    /* Mobile */
    @media only screen and (max-width: 620px) {
      .wrapper { width: 100% !important; padding: 0 !important; }
      .container { width: 100% !important; border-radius: 16px !important; }
      .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .header-headline { font-size: 24px !important; line-height: 1.3 !important; }
      .cta-btn-td { width: 100% !important; display: block !important; }
      .cta-btn { 
        width: 100% !important; 
        font-size: 17px !important; 
        padding: 16px 10px !important; 
        display: block !important; 
        border-left: 0 !important; 
        border-right: 0 !important; 
        box-sizing: border-box !important;
      }
      .value-label { font-size: 13px !important; }
      .price-big { font-size: 32px !important; }
      .bonus-tag { font-size: 11px !important; padding: 3px 8px !important; }
      .two-col-td { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#fbf5ea;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;font-size:1px;color:#fbf5ea;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheaderText}
  </div>

  <!-- OUTER WRAPPER -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fbf5ea;">
    <tr>
      <td align="center" style="padding: 24px 12px;">

        <!-- MAIN CONTAINER -->
        <table class="container" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color:#FFFFFF; border-radius:28px; overflow:hidden; border:1px solid rgba(214,180,93,.28); box-shadow: 0 6px 28px rgba(33,25,15,0.05);">

          <!-- ===== URGENCY BANNER ===== -->
          <tr>
            <td style="background-color:#21190f; padding: 12px 32px; text-align:center; border-bottom:1px solid rgba(214,180,93,.15);">
              <p style="margin:0; color:#f6cf5a; font-size:13px; font-weight:900; letter-spacing:0.5px; font-family:Inter,Arial,sans-serif;">
                ⚡ ${urgencyText}${limitedUnits ? ` — Only ${limitedUnits} units remaining` : ''}${deadlineText ? ` · Offer ends ${deadlineText}` : ''}
              </p>
            </td>
          </tr>

          <!-- ===== HEADER / DREAM OUTCOME ===== -->
          <tr>
            <td class="mobile-pad" style="background-color:#FFFFFF; padding: 48px 40px 40px; text-align:center;">
              <!-- VissMingle Signature Badge -->
              <div style="display:inline-block; background-color:#21190f; color:#f6cf5a; border-radius:16px; padding:12px 14px; font-weight:900; letter-spacing:-.04em; margin-bottom:24px; font-family:Inter,Arial,sans-serif;">
                VissMingle
              </div>
              
              <!-- Eyebrow -->
              <p style="margin:0 0 16px; color:#b47f18; font-size:12px; font-weight:900; letter-spacing:2px; text-transform:uppercase; font-family:Inter,Arial,sans-serif;">
                ${headerEyebrow}
              </p>
              <!-- Main Headline -->
              <h1 class="header-headline" style="margin:0 0 20px; color:#17120c; font-size:30px; font-weight:900; line-height:1.25; letter-spacing:-0.5px; font-family:Inter,Arial,sans-serif;">
                ${headline}
              </h1>
              <p style="margin:0 0 28px; color:#65553f; font-size:16px; line-height:1.7; font-family:Inter,Arial,sans-serif;">
                ${subheadline}
              </p>
              <p style="margin:0; color:#21190f; font-size:18px; font-weight:900; font-family:Inter,Arial,sans-serif;">
                Hi {{firstName}}, this is for you 👇
              </p>
            </td>
          </tr>

          <!-- ===== PROBLEM AGITATION (PAS) ===== -->
          <tr>
            <td class="mobile-pad" style="padding: 40px 40px 32px; background-color:#FAF6EE; border-top: 1px solid rgba(214,180,93,.15); border-bottom: 1px solid rgba(214,180,93,.15);">
              <h2 style="margin:0 0 16px; color:#17120c; font-size:20px; font-weight:900; font-family:Inter,Arial,sans-serif;">
                ${problemHeadline}
              </h2>
              <p style="margin:0 0 20px; color:#4c4031; font-size:15px; line-height:1.8; font-family:Inter,Arial,sans-serif;">
                ${problemBody1}
              </p>
              <p style="margin:0 0 20px; color:#4c4031; font-size:15px; line-height:1.8; font-family:Inter,Arial,sans-serif;">
                ${problemBody2}
              </p>
              <!-- Pain bullet list -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F5EFE4; border-radius:12px; border-left:4px solid #21190f;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px; color:#21190f; font-size:13px; font-weight:900; letter-spacing:1px; text-transform:uppercase; font-family:Inter,Arial,sans-serif;">Sound familiar?</p>
                    ${painPoints.map((point, i) => `<p style="margin:0${i < painPoints.length - 1 ? ' 0 8px' : ''}; color:#4c4031; font-size:14px; line-height:1.7; font-family:Inter,Arial,sans-serif;">✗ &nbsp;${point}</p>`).join('\n                    ')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== SOLUTION BRIDGE ===== -->
          <tr>
            <td class="mobile-pad" style="padding: 40px 40px; background-color:#FFFFFF; text-align:center;">
              <p style="margin:0 0 8px; color:#b47f18; font-size:12px; font-weight:900; letter-spacing:2px; text-transform:uppercase; font-family:Inter,Arial,sans-serif;">THE SOLUTION</p>
              <h2 style="margin:0 0 12px; color:#17120c; font-size:26px; font-weight:900; font-family:Inter,Arial,sans-serif;">
                Meet the ${productName}
              </h2>
              <p style="margin:0 0 16px; color:#65553f; font-size:15px; font-style:italic; font-family:Inter,Arial,sans-serif;">${tagline}</p>
              <p style="margin:0 auto; max-width:460px; color:#4c4031; font-size:15px; line-height:1.8; font-family:Inter,Arial,sans-serif;">
                ${solutionBody}
              </p>
            </td>
          </tr>

          <!-- ===== VALUE STACK ===== -->
          <tr>
            <td class="mobile-pad" style="padding: 40px 40px 32px; background-color:#FAF6EE; border-top: 1px solid rgba(214,180,93,.15);">
              <p style="margin:0 0 6px; color:#b47f18; font-size:12px; font-weight:900; letter-spacing:2px; text-transform:uppercase; text-align:center; font-family:Inter,Arial,sans-serif;">EVERYTHING INCLUDED TODAY</p>
              <h2 style="margin:0 0 28px; color:#17120c; font-size:22px; font-weight:900; text-align:center; font-family:Inter,Arial,sans-serif;">
                Your Complete Blackout-Proof Package
              </h2>

              <!-- Stack Item 1 — Core Product -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px; border:1px solid rgba(214,180,93,.22); border-radius:16px; overflow:hidden; background-color:#FFFFFF;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="32" valign="top" style="padding-top:2px;">
                          <span style="color:#b47f18; font-size:20px; font-weight:900;">✓</span>
                        </td>
                        <td>
                          <p style="margin:0 0 4px; color:#17120c; font-size:15px; font-weight:900; font-family:Inter,Arial,sans-serif;">
                            ${productName} ${tagline}
                          </p>
                          <p style="margin:0; color:#65553f; font-size:13px; line-height:1.6; font-family:Inter,Arial,sans-serif;">
                            ${productCapacityDescription}
                          </p>
                        </td>
                        <td width="90" align="right" valign="top">
                          <span class="value-label" style="background-color:#21190f; color:#f6cf5a; font-size:11px; font-weight:900; padding:5px 12px; border-radius:20px; white-space:nowrap; font-family:Inter,Arial,sans-serif; text-transform:uppercase; letter-spacing:0.3px;">Core Item</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Stack Item 2 — Free Nationwide Delivery -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px; border:1px solid rgba(214,180,93,.22); border-radius:16px; overflow:hidden; background-color:#FFFFFF;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="32" valign="top" style="padding-top:2px;">
                          <span style="color:#b47f18; font-size:20px; font-weight:900;">✓</span>
                        </td>
                        <td>
                          <p style="margin:0 0 4px; color:#17120c; font-size:15px; font-weight:900; font-family:Inter,Arial,sans-serif;">
                            Free Nationwide Delivery
                          </p>
                          <p style="margin:0; color:#65553f; font-size:13px; line-height:1.6; font-family:Inter,Arial,sans-serif;">
                            Delivered to your door anywhere in Nigeria — tracked and insured
                          </p>
                        </td>
                        <td width="90" align="right" valign="top">
                          <span class="value-label" style="background-color:#FFF9E6; color:#B47F18; border:1px solid rgba(214,180,93,.3); font-size:11px; font-weight:900; padding:4px 10px; border-radius:20px; white-space:nowrap; font-family:Inter,Arial,sans-serif;">${deliveryValue}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Stack Item 3 — Extended Warranty (Bonus) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px; border:2px solid #d89a12; border-radius:16px; overflow:hidden; background-color:#FCF8EC;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="32" valign="top" style="padding-top:2px;">
                          <span style="color:#b47f18; font-size:20px;">🎁</span>
                        </td>
                        <td>
                          <p style="margin:0 0 4px; font-family:Inter,Arial,sans-serif;">
                            <span style="color:#17120c; font-size:15px; font-weight:900;">BONUS #1: ${bonus1Name}</span>
                            <span class="bonus-tag" style="background-color:#21190f; color:#f6cf5a; font-size:10px; font-weight:900; padding:3px 8px; border-radius:20px; margin-left:8px; white-space:nowrap; vertical-align:middle; letter-spacing:0.3px; text-transform:uppercase;">BONUS</span>
                          </p>
                          <p style="margin:0; color:#65553f; font-size:13px; line-height:1.6; font-family:Inter,Arial,sans-serif;">
                            ${bonus1Description}
                          </p>
                        </td>
                        <td width="90" align="right" valign="top">
                          <span class="value-label" style="background-color:#FFF9E6; color:#B47F18; border:1px solid rgba(214,180,93,.3); font-size:11px; font-weight:900; padding:4px 10px; border-radius:20px; white-space:nowrap; font-family:Inter,Arial,sans-serif;">${bonus1Value}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Stack Item 4 — Free Solar Panel Installation (Bonus) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px; border:2px solid #d89a12; border-radius:16px; overflow:hidden; background-color:#FCF8EC;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="32" valign="top" style="padding-top:2px;">
                          <span style="color:#b47f18; font-size:20px;">🎁</span>
                        </td>
                        <td>
                          <p style="margin:0 0 4px; font-family:Inter,Arial,sans-serif;">
                            <span style="color:#17120c; font-size:15px; font-weight:900;">BONUS #2: ${bonus2Name}</span>
                            <span class="bonus-tag" style="background-color:#21190f; color:#f6cf5a; font-size:10px; font-weight:900; padding:3px 8px; border-radius:20px; margin-left:8px; white-space:nowrap; vertical-align:middle; letter-spacing:0.3px; text-transform:uppercase;">BONUS</span>
                          </p>
                          <p style="margin:0; color:#65553f; font-size:13px; line-height:1.6; font-family:Inter,Arial,sans-serif;">
                            ${bonus2Description}
                          </p>
                        </td>
                        <td width="90" align="right" valign="top">
                          <span class="value-label" style="background-color:#FFF9E6; color:#B47F18; border:1px solid rgba(214,180,93,.3); font-size:11px; font-weight:900; padding:4px 10px; border-radius:20px; white-space:nowrap; font-family:Inter,Arial,sans-serif;">${bonus2Value}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Stack Item 5 — Priority WhatsApp Support -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px; border:1px solid rgba(214,180,93,.22); border-radius:16px; overflow:hidden; background-color:#FFFFFF;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="32" valign="top" style="padding-top:2px;">
                          <span style="color:#b47f18; font-size:20px; font-weight:900;">✓</span>
                        </td>
                        <td>
                          <p style="margin:0 0 4px; color:#17120c; font-size:15px; font-weight:900; font-family:Inter,Arial,sans-serif;">
                            Priority WhatsApp Support
                          </p>
                          <p style="margin:0; color:#65553f; font-size:13px; line-height:1.6; font-family:Inter,Arial,sans-serif;">
                            Direct line to our technical team — any question, any time, answered fast
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Stack Item 6 — Blackout Survival Guide -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid rgba(214,180,93,.22); border-radius:16px; overflow:hidden; background-color:#FFFFFF;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="32" valign="top" style="padding-top:2px;">
                          <span style="color:#b47f18; font-size:20px; font-weight:900;">✓</span>
                        </td>
                        <td>
                          <p style="margin:0 0 4px; color:#17120c; font-size:15px; font-weight:900; font-family:Inter,Arial,sans-serif;">
                            "The Blackout Survival Guide" (Digital PDF)
                          </p>
                          <p style="margin:0; color:#65553f; font-size:13px; line-height:1.6; font-family:Inter,Arial,sans-serif;">
                            Device compatibility chart, optimised power load schedule, and a step-by-step setup guide to maximise your battery life from day one
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Total Value Summary -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:24px; background-color:#21190f; border-radius:16px; border:1px solid rgba(214,180,93,.28);">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <p style="margin:0 0 6px; color:#f6cf5a; font-size:13px; font-weight:900; font-family:Inter,Arial,sans-serif; text-transform:uppercase; letter-spacing:0.5px;">Total Package Value</p>
                          <p style="margin:0; color:#857564; font-size:14px; text-decoration:line-through; font-family:Inter,Arial,sans-serif;">${originalPriceDisplay}</p>
                        </td>
                        <td align="right">
                          <p style="margin:0 0 4px; color:#857564; font-size:12px; font-weight:900; font-family:Inter,Arial,sans-serif; text-align:right;">Your Price Today</p>
                          <p class="price-big" style="margin:0; color:#FFFFFF; font-size:36px; font-weight:900; line-height:1; font-family:Inter,Arial,sans-serif; text-align:right;">${priceDisplay}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ===== GUARANTEE ===== -->
          <tr>
            <td class="mobile-pad" style="padding: 36px 40px; background-color:#FAF5E6; border-top:1px solid rgba(214,180,93,.22); border-bottom:1px solid rgba(214,180,93,.22);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="48" valign="top">
                    <span style="font-size:36px; line-height:1;">🛡️</span>
                  </td>
                  <td style="padding-left:16px;">
                    <p style="margin:0 0 6px; color:#b47f18; font-size:13px; font-weight:900; letter-spacing:1.5px; text-transform:uppercase; font-family:Inter,Arial,sans-serif;">OUR PROMISE TO YOU</p>
                    <p style="margin:0 0 10px; color:#17120c; font-size:18px; font-weight:900; font-family:Inter,Arial,sans-serif;">${guaranteeTitle}</p>
                    <p style="margin:0; color:#4c4031; font-size:14px; line-height:1.8; font-family:Inter,Arial,sans-serif;">
                      ${guaranteeBody}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== SOCIAL PROOF ===== -->
          <tr>
            <td class="mobile-pad" style="padding: 40px 40px 32px; background-color:#FFFFFF;">
              <p style="margin:0 0 20px; color:#b47f18; font-size:12px; font-weight:900; letter-spacing:2px; text-transform:uppercase; text-align:center; font-family:Inter,Arial,sans-serif;">WHAT OTHERS ARE SAYING</p>

              ${testimonials.map((t, i) => `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="${i < testimonials.length - 1 ? 'margin-bottom:16px; ' : ''}background-color:#FAF6EE; border-radius:16px; border-left:4px solid #d89a12;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px; color:#17120c; font-size:14px; font-style:italic; line-height:1.7; font-family:Inter,Arial,sans-serif;">
                      "${t.quote}"
                    </p>
                    <p style="margin:0; color:#65553f; font-size:13px; font-weight:700; font-family:Inter,Arial,sans-serif;">— ${t.attribution}</p>
                  </td>
                </tr>
              </table>`).join('\n              ')}
            </td>
          </tr>

          <!-- ===== SCARCITY + CTA ===== -->
          <tr>
            <td class="mobile-pad" style="padding: 44px 40px 48px; background-color:#21190f; text-align:center;">
              <!-- Scarcity -->
              ${limitedUnits ? `
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 28px; background-color:#451a1a; border:1px solid #DC2626; border-radius:12px;">
                <tr>
                  <td style="padding:12px 24px;">
                    <p style="margin:0; color:#FF9999; font-size:14px; font-weight:900; font-family:Inter,Arial,sans-serif;">
                      🔴 &nbsp;WARNING: Only ${limitedUnits} units available at this offer price
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <h2 style="margin:0 0 12px; color:#FFFFFF; font-size:22px; font-weight:900; line-height:1.3; font-family:Inter,Arial,sans-serif;">
                ${ctaHeadline}
              </h2>
              <p style="margin:0 0 28px; color:#C4B59F; font-size:15px; line-height:1.7; font-family:Inter,Arial,sans-serif;">
                ${ctaSubtext}
              </p>

              <!-- CTA Button (Pill Gradient) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                <tr>
                  <td align="center" class="cta-btn-td" style="border-radius:999px; background-color:#f0c63c; box-shadow: 0 4px 18px rgba(216,154,18,0.4); text-align:center;">
                    <a href="${ctaUrl}" class="cta-btn" style="background: linear-gradient(135deg,#fff0ad,#f0c63c,#d89a12); border-top:16px solid #f0c63c; border-bottom:16px solid #f0c63c; border-left:42px solid #f0c63c; border-right:42px solid #f0c63c; color:#2a1c08; font-family:Inter,Arial,sans-serif; font-size:18px; font-weight:900; text-decoration:none; border-radius:999px; display:inline-block; letter-spacing:0.5px; text-transform:uppercase; text-align:center; line-height:1;">
                      ${ctaText} &nbsp;➔
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0; color:#857564; font-size:13px; font-family:Inter,Arial,sans-serif;">
                ✓ Satisfaction guaranteed &nbsp;·&nbsp; ✓ Bonuses included &nbsp;·&nbsp; ✓ Free delivery
              </p>
            </td>
          </tr>

          <!-- ===== FINAL CLOSE ===== -->
          <tr>
            <td class="mobile-pad" style="padding: 36px 40px; background-color:#FFFFFF; text-align:center; border-top:1px solid rgba(214,180,93,.2);">
              <p style="margin:0 0 16px; color:#4c4031; font-size:15px; line-height:1.8; font-family:Inter,Arial,sans-serif;">
                Here's the truth, {{firstName}}: the ${productName} won't stop power outages from happening. But it will make them completely irrelevant to your life. That's the goal.
              </p>
              <p style="margin:0 0 24px; color:#4c4031; font-size:15px; line-height:1.8; font-family:Inter,Arial,sans-serif; font-weight:900;">
                — ${senderName}
              </p>

              <!-- Sharing Incentives Paragraph -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fbf5ea; border-radius:16px; border:1px dashed rgba(214,180,93,.4);">
                <tr>
                  <td style="padding:20px 24px; text-align:left;">
                    <p style="margin:0; color:#21190f; font-size:14px; font-weight:900; font-family:Inter,Arial,sans-serif; margin-bottom:6px;">
                      📢 Know someone else battling NEPA blackouts?
                    </p>
                    <p style="margin:0; color:#65553f; font-size:13.5px; line-height:1.7; font-family:Inter,Arial,sans-serif;">
                      If you forward this email to a friend, colleague, or family member who has been looking for a permanent backup power solution, and they make a purchase, we'll send you a special cash incentive (or direct store credit) as our way of saying thank you! Just have them mention your name or email address when placing their order.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="padding: 28px 32px; background-color:#fbf5ea; border-top:1px solid rgba(214,180,93,.2); text-align:center;">
              <p style="margin:0 0 8px; color:#65553f; font-size:13px; font-family:Inter,Arial,sans-serif;">
                Questions? Reach us via ${supportContact}
              </p>
              <p style="margin:0; color:#857564; font-size:12px; font-family:Inter,Arial,sans-serif; line-height:1.6;">
                You're receiving this because you signed up for updates from ${senderName}.<br>
                <a href="#" style="color:#857564; text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- END MAIN CONTAINER -->

      </td>
    </tr>
  </table>
  <!-- END OUTER WRAPPER -->

</body>
</html>`.trim();
}

export const ecoflowRiver2ProConfig: PromoProductConfig = {
  productName: 'EcoFlow RIVER 2 Pro',
  tagline: 'Portable Power Station',
  priceDisplay: '₦618,500',
  originalPriceDisplay: '₦706,500+ if purchased separately',
  ctaUrl: '{{ctaUrl:ecoflow-river-2-pro}}',
  ctaText: 'Secure My Blackout-Proof Package',
  supportContact: '{{supportContact}}',
  senderName: '{{senderName}}',
  urgencyText: 'This offer — including the free bonuses — closes once stock runs out',
  limitedUnits: 10,
  deadlineText: 'Sunday midnight',
  preheaderText: "The next blackout won't stop you — here's your permanent solution, with everything included.",
  headerEyebrow: 'BLACKOUT-PROOF YOUR HOME &amp; BUSINESS',
  headline: "What If The Next Power Outage<br>Didn't Disrupt A Single Minute<br>Of Your Life?",
  subheadline: "Lights stay on. Laptops keep running. Router stays connected.<br>Business doesn't stop. Family stays comfortable.",
  problemHeadline: 'NEPA takes light. You lose money. Again.',
  problemBody1: "Every time power goes out, the clock starts ticking. Your laptop battery drops. Your Zoom call cuts off mid-sentence. Your customer is left waiting. Your child can't study. And you're sitting there — staring at a generator you have to fuel, maintain, and tolerate the noise of — hoping it doesn't fail <em>again</em>.",
  problemBody2: `The average Nigerian professional loses <strong style="color:#DC2626;">4–8 hours of productive time</strong> every week to power interruptions. That's over <strong style="color:#DC2626;">25 full working days</strong> per year — gone.`,
  painPoints: [
    'Missed a client call because power went out at the worst time',
    'Lost unsaved work when your laptop died suddenly',
    'Spending ₦30,000+ monthly on fuel for a loud, smelly generator',
    'Telling your family "just wait, power will come back soon" — for the fifth time this week',
  ],
  solutionBody: "Plug it in. Charge it from solar. And the next time NEPA takes light, you don't even notice. No fumes. No noise. No fuel runs. Just clean, silent power — available the moment you need it.",
  productCapacityDescription: '768Wh capacity · Powers laptops, fans, routers, lights, TVs, and small appliances simultaneously',
  deliveryValue: '₦8,000 FREE',
  bonus1Name: 'Extended Warranty Cover',
  bonus1Description: 'Extended manufacturer warranty included at no extra cost — full parts &amp; service coverage so you never have to worry about repair bills',
  bonus1Value: '₦45,000 FREE',
  bonus2Name: 'Free Solar Panel Installation',
  bonus2Description: "Add a compatible solar panel to your order and we'll professionally install it for free — so the sun recharges your battery while NEPA is away. Fuel bills: ₦0.",
  bonus2Value: '₦35,000 FREE',
  guaranteeTitle: '100% Satisfaction Guarantee — No Time Limit',
  guaranteeBody: "If the EcoFlow RIVER 2 Pro doesn't keep your home or business running through every blackout exactly as promised, tell us and we'll make it right — full refund or replacement, no questions, no deadline. We're that confident this changes your daily life. The only risk you're taking is spending another month the way things are now.",
  testimonials: [
    {
      quote: "NEPA took light for 11 hours last Tuesday. My laptop, router, and ring light ran the whole time. I finished two client deliverables and nobody even knew there was an outage on my end.",
      attribution: 'Tunde A., Freelance Designer, Lagos',
    },
    {
      quote: "I used to spend ₦40,000 a month on petrol for my generator. Since I got the EcoFlow RIVER 2 Pro with the solar panel, that cost is almost zero. It paid for itself faster than I expected.",
      attribution: 'Chidinma O., Small Business Owner, Abuja',
    },
  ],
  ctaHeadline: 'Stop losing hours — and money — to power cuts',
  ctaSubtext: 'The next blackout is coming. The only question is whether it disrupts you or not.',
};

export const ecoflowRiver2ProTemplate: EmailTemplate = {
  id: 'ecoflow-river-2-pro',
  name: 'EcoFlow RIVER 2 Pro — Grand Slam Offer',
  category: 'Marketing',
  subject: "NEPA can't touch you anymore — here's how",
  preheader: "The next blackout won't disrupt a single minute of your life. Here's everything included.",
  body: generatePromoEmailHTML(ecoflowRiver2ProConfig),
};

export const hithiumEssSolarGeneratorConfig: PromoProductConfig = {
  productName: 'Hithium ESS Solar Generator 314Ah',
  tagline: 'Portable Power Bank Station',
  priceDisplay: '₦465,562',
  originalPriceDisplay: '₦572,000 if purchased separately',
  ctaUrl: '{{ctaUrl:hithium-ess-solar-generator}}',
  ctaText: 'Secure My Blackout-Proof Package',
  supportContact: '{{supportContact}}',
  senderName: '{{senderName}}',
  urgencyText: 'This offer — including the free bonuses — closes once stock runs out',
  limitedUnits: 10,
  deadlineText: 'Sunday midnight',
  preheaderText: "The next blackout won't stop you — here's your permanent solution, with everything included.",
  headerEyebrow: 'BLACKOUT-PROOF YOUR HOME &amp; BUSINESS',
  headline: 'What If Your Power Backup Lasted 10,000 Cycles — and Paid for Itself in Months?',
  subheadline: '314Ah capacity · 1000W output · 220V AC · 10,000+ cycle LFP battery<br>Built to last 27+ years of daily use. One investment. Decades of reliability.',
  problemHeadline: 'NEPA takes light. You lose money. Again.',
  problemBody1: "Every time power goes out, the clock starts ticking. Your laptop battery drops. Your Zoom call cuts off mid-sentence. Your customer is left waiting. Your child can't study. And you're sitting there — staring at a generator you have to fuel, maintain, and tolerate the noise of — hoping it doesn't fail <em>again</em>.",
  problemBody2: `The average Nigerian professional loses <strong style="color:#DC2626;">4–8 hours of productive time</strong> every week to power interruptions. That's over <strong style="color:#DC2626;">25 full working days</strong> per year — gone.`,
  painPoints: [
    'Missed a client call because power went out at the worst time',
    'Lost unsaved work when your laptop died suddenly',
    'Spending ₦30,000+ monthly on fuel for a loud, smelly generator',
    'Telling your family "just wait, power will come back soon" — for the fifth time this week',
  ],
  solutionBody: "One charge from solar or wall. And for the next 10,000 cycles — roughly 27 years of daily use — you have reliable, silent power. No fumes. No noise. No fuel runs. Just a battery engineered to outlast everything else you own.",
  productCapacityDescription: '314Ah · 1000W output · 220V AC · 10,000+ cycle LFP battery · Powers laptops, fans, TVs, fridges & appliances simultaneously',
  deliveryValue: '₦8,000 FREE',
  bonus1Name: 'Extended Warranty Cover',
  bonus1Description: 'Extended manufacturer warranty included at no extra cost — full parts &amp; service coverage so you never have to worry about repair bills',
  bonus1Value: '₦45,000 FREE',
  bonus2Name: 'Free Solar Panel Installation',
  bonus2Description: "Add a compatible solar panel to your order and we'll professionally install it for free — so the sun recharges your battery while NEPA is away. Fuel bills: ₦0.",
  bonus2Value: '₦35,000 FREE',
  guaranteeTitle: '100% Satisfaction Guarantee — No Time Limit',
  guaranteeBody: "If the Hithium ESS Solar Generator 314Ah doesn't keep your home or business running through every blackout exactly as promised, tell us and we'll make it right — full refund or replacement, no questions, no deadline. We're that confident this changes your daily life. The only risk you're taking is spending another month the way things are now.",
  testimonials: [
    {
      quote: "NEPA took light for 11 hours last Tuesday. My laptop, router, and ring light ran the whole time on the Hithium ESS Solar Generator. I finished two client deliverables and nobody even knew there was an outage on my end.",
      attribution: 'Tunde A., Freelance Designer, Lagos',
    },
    {
      quote: "I used to spend ₦40,000 a month on petrol for my generator. Since I got the Hithium ESS Solar Generator 314Ah with the solar panel, that cost is almost zero. It paid for itself faster than I expected.",
      attribution: 'Chidinma O., Small Business Owner, Abuja',
    },
  ],
  ctaHeadline: 'Stop losing hours — and money — to power cuts',
  ctaSubtext: 'The next blackout is coming. The only question is whether it disrupts you or not.',
};

export const hithiumEssSolarGeneratorTemplate: EmailTemplate = {
  id: 'hithium-ess-solar-generator-314ah',
  name: 'Hithium ESS Solar Generator 314Ah — Grand Slam Offer',
  category: 'Marketing',
  subject: "NEPA Showed Me Shege This Month — Not Until I Found This!",
  preheader: "The next blackout won't disrupt a single minute of your life. Here's everything included.",
  body: generatePromoEmailHTML(hithiumEssSolarGeneratorConfig),
};