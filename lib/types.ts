export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  preheader?: string;
}
