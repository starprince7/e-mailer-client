import { EmailTemplate } from './types';
import { ecoflowRiver2ProTemplate, hithiumEssSolarGeneratorTemplate } from './templates/promo-power-station';
import { ecoflowBridgeTemplate, hithiumBridgeTemplate } from './templates/bridge-email';

export const emailTemplates: EmailTemplate[] = [
  ecoflowRiver2ProTemplate,
  hithiumEssSolarGeneratorTemplate,
  ecoflowBridgeTemplate,
  hithiumBridgeTemplate,
];
