import { EmailTemplate } from '../types';

export interface BridgeEmailConfig {
  senderName: string;
  subject: string;
  preheader?: string;
  opening: string;
  twist: string;
  curiosityGap: string;
  ctaUrl: string;
  ctaText: string;
  scarcityLine?: string;
  signOff: string;
  psLine?: string;
  productHint?: string;
}

export function generateBridgeEmailHTML(config: BridgeEmailConfig): string {
  const {
    preheader = '',
    opening,
    twist,
    curiosityGap,
    ctaUrl,
    ctaText,
    scarcityLine,
    signOff,
    psLine,
  } = config;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${config.subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; }
    .email-wrapper { width: 100%; background-color: #f4f4f4; padding: 24px 0; }
    .email-body { max-width: 560px; margin: 0 auto; background-color: #ffffff; padding: 32px 36px; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #333333; }
    .preheader { display: none; font-size: 1px; color: #f4f4f4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; }
    a { color: #111111; text-decoration: underline; font-weight: 600; }
    .cta { margin: 24px 0; }
    .cta a { color: #111111; text-decoration: underline; font-weight: 700; }
    .signoff { margin-top: 28px; }
    .ps { margin-top: 20px; color: #555555; font-style: italic; }
    @media only screen and (max-width: 600px) {
      .email-body { padding: 24px 20px !important; }
    }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="email-wrapper">
    <div class="email-body">
      <p>Hi {{firstName}},</p>

      <p>${opening}</p>

      <p>${twist}</p>

      <p>${curiosityGap}</p>

      <p class="cta"><a href="${ctaUrl}">${ctaText}</a></p>

      ${scarcityLine ? `<p>${scarcityLine}</p>` : ''}

      <p class="signoff">${signOff}</p>

      ${psLine ? `<p class="ps">P.S. ${psLine}</p>` : ''}

      <!-- Sharing Incentives Paragraph -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:24px; background-color:#fbf5ea; border-radius:12px; border:1px dashed rgba(214,180,93,.4);">
        <tr>
          <td style="padding:16px 20px; text-align:left;">
            <p style="margin:0; color:#21190f; font-size:13.5px; font-weight:700; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin-bottom:4px;">
              📢 Know someone else battling NEPA blackouts?
            </p>
            <p style="margin:0; color:#555555; font-size:13px; line-height:1.6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-style:italic;">
              If you forward this email to a friend or colleague who has been looking for a permanent backup power solution, and they make a purchase, we'll send you a special cash incentive (or direct store credit) to say thank you! Just have them mention your email address when placing their order.
            </p>
          </td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>
`.trim();
}

export const ecoflowBridgeConfig: BridgeEmailConfig = {
  senderName: '{{senderName}}',
  subject: "I used to lose 4+ hours every week to power cuts — until I found this",
  preheader: "There's a small device that silently sits in your home and makes blackouts irrelevant.",
  opening: "I know how it feels when you're in the middle of something important — a client call, a deadline, a study session — and NEPA takes light. Your laptop battery starts dying. Your generator is out of fuel. And you're just stuck, watching productive hours evaporate.",
  twist: "A few months ago, a friend introduced me to a different way of handling blackouts. Not a bigger generator. Not more fuel. Something that sits quietly in your home and just... works. No fumes. No noise. No fuel runs.",
  curiosityGap: "I stopped checking if NEPA was on. I stopped planning my work around their schedule. And the device cost less than what I was spending on petrol every 2-3 months. I'm not going to explain how it works here — but if you're curious, I've put everything on one page.",
  ctaUrl: '{{ctaUrl:ecoflow-river-2-pro}}',
  ctaText: "Here's the full story and how to get it →",
  scarcityLine: "They're bringing in a limited batch this week, so if you're interested, I'd move fast.",
  signOff: "Talk soon,<br>{{senderName}}",
  psLine: "The page has a short video that explains exactly how it keeps everything running when NEPA goes off. Worth 2 minutes.",
};

export const ecoflowBridgeTemplate: EmailTemplate = {
  id: 'ecoflow-river-2-pro-bridge',
  name: 'EcoFlow RIVER 2 Pro — Bridge Email',
  category: 'Marketing',
  subject: ecoflowBridgeConfig.subject,
  preheader: ecoflowBridgeConfig.preheader,
  body: generateBridgeEmailHTML(ecoflowBridgeConfig),
};

export const hithiumBridgeConfig: BridgeEmailConfig = {
  senderName: '{{senderName}}',
  subject: "NEPA Showed Me Shege This Month — Not Until I Found This!",
  preheader: "One charge. 10,000 cycles. 27+ years of silent backup power. Here's the full story.",
  opening: "Every time NEPA takes light, the same thing happens. You glance at your laptop battery. You check if your router is still on. You start calculating how long you have before everything shuts down. And if you run a generator, you're mentally adding up another ₦30,000+ to this month's fuel bill.",
  twist: "I recently came across a backup power system that's built completely differently from anything else on the market. It's not a generator. It's not an inverter with a short-lived battery. It's a single unit designed to last 10,000 charge cycles — which, if you use it daily, is over 27 years.",
  curiosityGap: "That's not a typo. 10,000 cycles. The battery chemistry is LFP, the same type used in electric vehicles because it refuses to die. One investment now, and your grandchildren might still be using it. I've put all the details — specs, pricing, how it works — on a single page.",
  ctaUrl: '{{ctaUrl:hithium-ess-solar-generator}}',
  ctaText: "See the full breakdown and reserve yours →",
  scarcityLine: "Only a small batch is available at the introductory price. After that, the price goes up.",
  signOff: "Cheers,<br>{{senderName}}",
  psLine: "The page includes a comparison table showing how this stacks up against generators and standard inverters. It makes the math very clear.",
};

export const hithiumBridgeTemplate: EmailTemplate = {
  id: 'hithium-ess-solar-generator-bridge',
  name: 'Hithium ESS Solar Generator — Bridge Email',
  category: 'Marketing',
  subject: hithiumBridgeConfig.subject,
  preheader: hithiumBridgeConfig.preheader,
  body: generateBridgeEmailHTML(hithiumBridgeConfig),
};
