import { Suspense } from 'react';
import { EmailClient } from '@/components/email/email-client';

export default function Home() {
  return (
    <Suspense>
      <EmailClient />
    </Suspense>
  );
}
