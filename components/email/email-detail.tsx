'use client';

import { Email } from '@/lib/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailDetailProps {
  email: Email | null;
  onBack?: () => void;
}

export function EmailDetail({ email, onBack }: EmailDetailProps) {
  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
        <p>Select an email to view</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          {email.subject}
        </h2>
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <div>
            <span className="font-medium">From:</span> {email.from}
          </div>
          <div>
            <span className="font-medium">To:</span> {email.to.join(', ')}
          </div>
          <div className="ml-auto">
            {formatDate(email.timestamp)}
          </div>
        </div>
        {email.cc && email.cc.length > 0 && (
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">CC:</span> {email.cc.join(', ')}
          </div>
        )}
      </div>
      <div className="p-6">
        {email.htmlBody ? (
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: email.htmlBody }}
          />
        ) : (
          <div className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {email.body}
          </div>
        )}
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Attachments ({email.attachments.length})
            </h3>
            <div className="space-y-2">
              {email.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <Paperclip className="h-4 w-4 text-zinc-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
