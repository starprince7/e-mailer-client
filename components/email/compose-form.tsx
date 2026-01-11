'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from './rich-text-editor';
import { emailTemplates } from '@/lib/templates';
import { Paperclip, X, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatFileSize } from '@/lib/utils';

interface ComposeFormProps {
  onSuccess?: () => void;
}

export function ComposeForm({ onSuccess }: ComposeFormProps) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fromTitle, setFromTitle] = useState('Prince');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalSize = [...attachments, ...files].reduce((sum, file) => sum + file.size, 0);
      
      if (totalSize > 25 * 1024 * 1024) {
        toast({
          title: 'File size limit exceeded',
          description: 'Total attachment size cannot exceed 25MB',
          variant: 'destructive',
        });
        return;
      }
      
      setAttachments([...attachments, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const apiKey = localStorage.getItem('resend_api_key');
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please configure your Resend API key in Settings first.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('to', to);
      if (cc) formData.append('cc', cc);
      if (bcc) formData.append('bcc', bcc);
      formData.append('subject', subject);
      formData.append('body', body);
      formData.append('html', body);
      formData.append('fromTitle', fromTitle);

      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      toast({
        title: 'Email sent successfully!',
        description: `Your email has been sent to ${to}`,
      });

      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setBody('');
      setFromTitle('Prince');
      setAttachments([]);
      setShowCc(false);
      setShowBcc(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Failed to send email',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Compose Email
        </h2>
      </div>
      
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="To (comma-separated for multiple recipients)"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
            {!showCc && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCc(true)}
              >
                CC
              </Button>
            )}
            {!showBcc && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBcc(true)}
              >
                BCC
              </Button>
            )}
          </div>

          {showCc && (
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="CC (comma-separated)"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowCc(false);
                  setCc('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {showBcc && (
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="BCC (comma-separated)"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowBcc(false);
                  setBcc('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div>
            <label htmlFor="fromTitle" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              From Title (Optional)
            </label>
            <Input
              id="fromTitle"
              type="text"
              placeholder="Your Name"
              value={fromTitle}
              onChange={(e) => setFromTitle(e.target.value)}
            />
          </div>

          <Input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Use Template (Optional)
            </label>
            <select
              className="w-full h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              onChange={(e) => handleTemplateSelect(e.target.value)}
              defaultValue=""
            >
              <option value="">Select a template...</option>
              {emailTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Message
            </label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Write your email..."
            />
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Attachments
              </label>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-md border border-zinc-200 dark:border-zinc-800"
                  >
                    <Paperclip className="h-4 w-4 text-zinc-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-900 dark:text-zinc-50 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex gap-2">
          <label htmlFor="file-upload">
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-300 border border-zinc-300 bg-transparent hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 h-9 px-3 cursor-pointer">
              <Paperclip className="h-4 w-4 mr-2" />
              Attach Files
            </span>
          </label>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
