export interface Email {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: Attachment[];
  timestamp: Date;
  folder: 'inbox' | 'sent' | 'drafts';
  read?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  content?: string | ArrayBuffer;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

export interface EmailFormData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  attachments?: File[];
  templateId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
