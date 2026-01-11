import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const emailArraySchema = z.string().transform((str) => {
  return str
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
}).pipe(z.array(emailSchema));

export const sendEmailSchema = z.object({
  to: z.string().min(1, 'At least one recipient is required').refine(
    (val) => {
      const emails = val.split(',').map(e => e.trim()).filter(e => e);
      return emails.every(email => z.string().email().safeParse(email).success);
    },
    { message: 'All email addresses must be valid' }
  ),
  cc: z.string().optional().refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      const emails = val.split(',').map(e => e.trim()).filter(e => e);
      return emails.every(email => z.string().email().safeParse(email).success);
    },
    { message: 'All CC email addresses must be valid' }
  ),
  bcc: z.string().optional().refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      const emails = val.split(',').map(e => e.trim()).filter(e => e);
      return emails.every(email => z.string().email().safeParse(email).success);
    },
    { message: 'All BCC email addresses must be valid' }
  ),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  body: z.string().min(1, 'Email body is required'),
  html: z.string().optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
