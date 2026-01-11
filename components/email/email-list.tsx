'use client';

import { Email } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Mail, MailOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailListProps {
  emails: Email[];
  onEmailClick?: (email: Email) => void;
  selectedEmailId?: string;
}

export function EmailList({ emails, onEmailClick, selectedEmailId }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
        <Mail className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-lg">No emails to display</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => onEmailClick?.(email)}
          className={cn(
            'p-4 cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
            selectedEmailId === email.id && 'bg-zinc-100 dark:bg-zinc-800',
            !email.read && 'bg-blue-50/50 dark:bg-blue-950/20'
          )}
        >
          <div className="flex items-start gap-3">
            {email.read ? (
              <MailOpen className="h-5 w-5 text-zinc-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className={cn(
                  "text-sm truncate",
                  !email.read ? "font-semibold text-zinc-900 dark:text-zinc-50" : "font-medium text-zinc-700 dark:text-zinc-300"
                )}>
                  {email.from}
                </p>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                  {formatDate(email.timestamp)}
                </span>
              </div>
              <p className={cn(
                "text-sm mb-1 truncate",
                !email.read ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"
              )}>
                {email.subject}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                {email.body.replace(/<[^>]*>/g, '').substring(0, 100)}...
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
