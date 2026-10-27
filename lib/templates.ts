import { EmailTemplate } from './types';
import { ecoflowRiver2ProTemplate, hithiumEssSolarGeneratorTemplate } from './templates/promo-power-station';
import { ecoflowBridgeTemplate, hithiumBridgeTemplate } from './templates/bridge-email';

export const emailTemplates: EmailTemplate[] = [
  ecoflowRiver2ProTemplate,
  hithiumEssSolarGeneratorTemplate,
  ecoflowBridgeTemplate,
  hithiumBridgeTemplate,
];

/**
 * Replaces `{{var}}` placeholders in template text with values from
 * `vars` (sourced from `templateVars` in app.config.json / TEMPLATE_VARS).
 *
 * `{{firstName}}` is intentionally left untouched — it is resolved
 * per-recipient at send time.
 */
export function resolveTemplateVars(
  text: string,
  vars: Record<string, string>
): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    if (trimmedKey === 'firstName') return match;
    return vars[trimmedKey] ?? match;
  });
}
