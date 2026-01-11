'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { EmailList } from './email-list';
import { EmailDetail } from './email-detail';
import { ComposeForm } from './compose-form';
import { SettingsPanel } from './settings-panel';
import { Email } from '@/lib/types';

const mockInboxEmails: Email[] = [
  {
    id: '1',
    from: 'john@example.com',
    to: ['you@example.com'],
    subject: 'Welcome to the Email Client!',
    body: 'This is a demo email to show how the client works. You can compose and send real emails using the Resend API.',
    htmlBody: '<p>This is a demo email to show how the client works. You can compose and send real emails using the Resend API.</p>',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    folder: 'inbox',
    read: false,
  },
  {
    id: '2',
    from: 'sarah@company.com',
    to: ['you@example.com'],
    cc: ['team@company.com'],
    subject: 'Project Update',
    body: 'Here is the latest update on our project. Everything is on track!',
    htmlBody: '<p>Here is the latest update on our project. Everything is on track!</p>',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    folder: 'inbox',
    read: true,
  },
];

const mockSentEmails: Email[] = [
  {
    id: '3',
    from: 'you@example.com',
    to: ['client@example.com'],
    subject: 'Re: Meeting scheduled',
    body: 'Thanks for scheduling the meeting. Looking forward to it!',
    htmlBody: '<p>Thanks for scheduling the meeting. Looking forward to it!</p>',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    folder: 'sent',
    read: true,
  },
];

export function EmailClient() {
  const [activeView, setActiveView] = useState<'inbox' | 'sent' | 'compose' | 'settings'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [inboxEmails, setInboxEmails] = useState<Email[]>(mockInboxEmails);
  const [sentEmails, setSentEmails] = useState<Email[]>(mockSentEmails);
  const [isMobile, setIsMobile] = useState(false);
  const [showEmailDetail, setShowEmailDetail] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    if (isMobile) {
      setShowEmailDetail(true);
    }
    
    if (!email.read && activeView === 'inbox') {
      setInboxEmails(inboxEmails.map(e => 
        e.id === email.id ? { ...e, read: true } : e
      ));
    }
  };

  const handleComposeSuccess = () => {
    setActiveView('sent');
  };

  const handleBackToList = () => {
    setShowEmailDetail(false);
    setSelectedEmail(null);
  };

  const currentEmails = activeView === 'inbox' ? inboxEmails : activeView === 'sent' ? sentEmails : [];

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      {(!isMobile || !showEmailDetail) && (
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {activeView === 'compose' ? (
          <div className="flex-1">
            <ComposeForm onSuccess={handleComposeSuccess} />
          </div>
        ) : activeView === 'settings' ? (
          <div className="flex-1">
            <SettingsPanel />
          </div>
        ) : (
          <>
            {(!isMobile || !showEmailDetail) && (
              <div className="w-full md:w-96 border-r border-zinc-200 dark:border-zinc-800 overflow-auto">
                <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {activeView === 'inbox' ? 'Inbox' : 'Sent'}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {currentEmails.length} {currentEmails.length === 1 ? 'email' : 'emails'}
                  </p>
                </div>
                <EmailList
                  emails={currentEmails}
                  onEmailClick={handleEmailClick}
                  selectedEmailId={selectedEmail?.id}
                />
              </div>
            )}
            
            {(!isMobile || showEmailDetail) && (
              <div className="flex-1 overflow-hidden">
                <EmailDetail 
                  email={selectedEmail} 
                  onBack={isMobile ? handleBackToList : undefined}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
