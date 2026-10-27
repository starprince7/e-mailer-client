'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/email/rich-text-editor';
import { Send, Loader2, CheckCircle, AlertCircle, Settings, ArrowLeft, Eye, Code, Type, ClipboardPaste, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { emailTemplates, resolveTemplateVars } from '@/lib/templates';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ApiKeyBanner, useApiKeyStatus } from '@/components/api-key-banner';
import { cn } from '@/lib/utils';
import { formatRecipientInput, normalizeRecipientInput } from '@/lib/recipient-input';

interface ParsedRecipient {
  email: string;
  firstName: string;
  valid: boolean;
}

const EXAMPLE_JSON = `[
  {
    "email": "jane@example.com",
    "name": "Jane Doe"
  },
  {
    "email": "john@example.com",
    "name": "John Smith"
  }
]`;

function StepHeader({ step, title, children }: { step: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {step}
        </span>
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function BulkSendPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedRecipients, setParsedRecipients] = useState<ParsedRecipient[]>([]);
  const [recipientInputMessage, setRecipientInputMessage] = useState('');
  const [fromTitle, setFromTitle] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [editorMode, setEditorMode] = useState<'rich' | 'html' | 'preview'>('rich');
  const [isLoading, setIsLoading] = useState(false);
  const apiKeyStatus = useApiKeyStatus();
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const isHtmlTemplate = body.trimStart().toLowerCase().startsWith('<!doctype');
  const validCount = parsedRecipients.filter(r => r.valid).length;
  const invalidCount = parsedRecipients.length - validCount;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) {
      setSubject('');
      setBody('');
      setEditorMode('rich');
      return;
    }
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSubject(resolveTemplateVars(template.subject, templateVars));
      const resolvedBody = resolveTemplateVars(template.body, templateVars);
      setBody(resolvedBody);
      setEditorMode(resolvedBody.trimStart().toLowerCase().startsWith('<!doctype') ? 'html' : 'rich');
    }
  };

  const clearTemplate = () => {
    setSelectedTemplate('');
    setSubject('');
    setBody('');
    setEditorMode('rich');
  };

  const previewHtml = body.replace(/\{\{firstName\}\}/g, 'there');

  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        if (data.fromName) setFromTitle((prev) => prev || data.fromName);
        if (data.fromEmail) setFromEmail((prev) => prev || data.fromEmail);
        if (data.templateVars) setTemplateVars(data.templateVars);
      } catch (error) {
        console.error('Failed to load app config:', error);
      }
    };

    loadAppConfig();
  }, []);

  useEffect(() => {
    if (jsonInput.trim() === '') {
      setParsedRecipients([]);
      setRecipientInputMessage('');
      return;
    }

    const recipients = normalizeRecipientInput(jsonInput);
    const parsedData: ParsedRecipient[] = recipients.map(({ email, name }) => ({
      email,
      firstName: name ? name.trim().split(/\s+/)[0] : 'there',
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    }));

    setParsedRecipients(parsedData);
    if (parsedData.length === 0) {
      setRecipientInputMessage('No email addresses found yet. Paste recipient JSON or text containing email addresses.');
    }
  }, [jsonInput]);

  const handleRecipientPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    const recipients = normalizeRecipientInput(pastedText);

    if (recipients.length === 0) {
      setJsonInput(pastedText);
      setRecipientInputMessage('No email addresses found in that paste. Check the text and try again.');
      return;
    }

    setJsonInput(formatRecipientInput(recipients));
    setRecipientInputMessage(
      `Formatted ${recipients.length} unique email${recipients.length === 1 ? '' : 's'} for bulk sending.`
    );
  };

  const handleSend = async () => {
    const validRecipients = parsedRecipients.filter(r => r.valid);

    if (validRecipients.length === 0) {
      toast({
        title: 'No valid recipients',
        description: 'Please provide at least one valid email address in the JSON.',
        variant: 'destructive',
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        title: 'Subject required',
        description: 'Please enter a subject for the email.',
        variant: 'destructive',
      });
      return;
    }

    if (!body.trim()) {
      toast({
        title: 'Body required',
        description: 'Please enter the email body.',
        variant: 'destructive',
      });
      return;
    }

    // The browser-stored key is authoritative — use it when present
    const apiKey = localStorage.getItem('resend_api_key');

    if (!apiKey) {
      // No browser key — check for a server-configured key
      let hasServerKey = false;
      try {
        const response = await fetch('/api/check-env-key');
        const data = await response.json();
        hasServerKey = data.hasEnvKey;
      } catch (error) {
        console.error('Failed to check environment key:', error);
      }

      if (!hasServerKey) {
        toast({
          title: 'API Key Required',
          description: 'Please configure your Resend API key in Settings first.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    setProgress({ current: 0, total: validRecipients.length });

    try {
      const recipientsPayload = validRecipients.map(r => ({
        email: r.email,
        name: r.firstName,
      }));

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const response = await fetch('/api/send-bulk-email', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipients: recipientsPayload,
          subject,
          body,
          fromTitle,
          fromEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      const { succeeded, failed } = data.data;

      toast({
        title: 'Bulk send complete',
        description: `${succeeded} sent successfully${failed > 0 ? `, ${failed} failed` : ''}.`,
        variant: failed > 0 ? 'destructive' : 'default',
      });

      setJsonInput('');
      setSubject('');
      setBody('');
      setSelectedTemplate('');
      setParsedRecipients([]);
    } catch (error) {
      toast({
        title: 'Failed to send emails',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const editorModeButton = (mode: typeof editorMode, icon: React.ReactNode, label: string, disabled = false, title?: string) => (
    <button
      type="button"
      onClick={() => setEditorMode(mode)}
      disabled={disabled}
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-medium transition-colors',
        editorMode === mode
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center justify-center rounded-md border border-zinc-300 bg-transparent px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Back</span>
            </Link>
            <h1 className="truncate text-lg font-bold text-zinc-900 md:text-2xl dark:text-zinc-50">
              Bulk Send
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 text-sm">
            {apiKeyStatus === 'checking' && (
              <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" title="Checking API key..." />
            )}
            {apiKeyStatus === 'env' && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            {apiKeyStatus === 'local' && (
              <CheckCircle className="h-4 w-4 text-blue-600" />
            )}
            {apiKeyStatus === 'missing' && (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <ThemeSwitcher />
          </div>
        </div>
        <ApiKeyBanner />
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-4 pb-28 md:p-6">
        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <StepHeader step={1} title="Recipients">
            <div className="flex items-center gap-2">
              {parsedRecipients.length > 0 && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {validCount} valid{invalidCount > 0 && `, ${invalidCount} invalid`}
                </span>
              )}
              <button
                type="button"
                onClick={() => setJsonInput(EXAMPLE_JSON)}
                className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <ClipboardPaste className="h-3 w-3" />
                Insert example
              </button>
            </div>
          </StepHeader>
          <div className="p-4">
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setRecipientInputMessage('');
              }}
              onPaste={handleRecipientPaste}
              placeholder={`Paste JSON, a list of addresses, or text containing emails.\n\n${EXAMPLE_JSON}`}
              className="h-40 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Paste recipient JSON, a list of email addresses, or any text containing addresses. Names in formats like <code className="font-mono">Jane Doe &lt;jane@example.com&gt;</code> are used for {'{{firstName}}'} personalization.
            </p>
            {recipientInputMessage && (
              <p
                role="status"
                className={cn(
                  'mt-2 text-xs',
                  recipientInputMessage.startsWith('No ')
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-green-700 dark:text-green-400'
                )}
              >
                {recipientInputMessage}
              </p>
            )}

            {parsedRecipients.length > 0 && (
              <div className="mt-4 max-h-64 overflow-auto rounded-md border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">#</th>
                      <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Email</th>
                      <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">First Name</th>
                      <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRecipients.map((recipient, index) => (
                      <tr key={index} className="border-t border-zinc-200 dark:border-zinc-800">
                        <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{index + 1}</td>
                        <td className="max-w-[160px] truncate px-4 py-2 font-mono text-zinc-900 sm:max-w-none dark:text-zinc-50">{recipient.email}</td>
                        <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">{recipient.firstName}</td>
                        <td className="px-4 py-2">
                          {recipient.valid ? (
                            <span className="text-green-600 dark:text-green-400">Valid</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">Invalid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <StepHeader step={2} title="Sender" />
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <div>
              <label htmlFor="from-title" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                From Title
              </label>
              <Input
                id="from-title"
                type="text"
                placeholder="Your Name"
                value={fromTitle}
                onChange={(e) => setFromTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="from-email" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                From Email
              </label>
              <Input
                id="from-email"
                type="email"
                placeholder="mailer@example.com"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <StepHeader step={3} title="Message" />
          <div className="space-y-4 p-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="template-select" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Template (Optional)
                </label>
                {selectedTemplate && (
                  <button
                    type="button"
                    onClick={clearTemplate}
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    <X className="h-3 w-3" />
                    Clear template
                  </button>
                )}
              </div>
              <select
                id="template-select"
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="">-- Select a template --</option>
                {emailTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
              {isHtmlTemplate && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  This is a full HTML email — use the HTML or Preview tab to edit or view it.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Subject
              </label>
              <div className="relative">
                <Input
                  id="subject"
                  type="text"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <div className="absolute top-1/2 right-2 -translate-y-1/2">
                  <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {'{{firstName}}'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Body
                </label>
                <div className="flex items-center gap-1 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-700">
                  {editorModeButton('rich', <Type className="h-3 w-3" />, 'Rich Text', isHtmlTemplate, isHtmlTemplate ? 'HTML templates cannot be edited in rich text mode — use the HTML tab' : undefined)}
                  {editorModeButton('html', <Code className="h-3 w-3" />, 'HTML')}
                  {editorModeButton('preview', <Eye className="h-3 w-3" />, 'Preview')}
                </div>
              </div>

              <div style={{ display: editorMode === 'rich' ? 'block' : 'none' }}>
                <RichTextEditor
                  value={isHtmlTemplate ? '<p></p>' : body}
                  onChange={setBody}
                  placeholder="Write your email..."
                />
              </div>

              {editorMode === 'html' && (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Paste or type raw HTML here..."
                  className="h-96 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  spellCheck={false}
                />
              )}

              {editorMode === 'preview' && (
                <div className="overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
                  <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Preview — <code className="font-mono">{'{{firstName}}'}</code> shown as &ldquo;there&rdquo;</span>
                  </div>
                  {body ? (
                    <iframe
                      srcDoc={previewHtml}
                      sandbox="allow-same-origin"
                      title="Email Preview"
                      className="w-full bg-white"
                      style={{ height: '600px', border: 'none' }}
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-zinc-400 dark:text-zinc-600">
                      No content yet. Write your email or select a template.
                    </div>
                  )}
                </div>
              )}

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Use {'{{firstName}}'} for the recipient&apos;s first name. Other {'{{variables}}'} are filled from <code className="font-mono">templateVars</code> in your config.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="sticky bottom-0 z-20 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="min-w-0 text-sm text-zinc-500 dark:text-zinc-400">
            {apiKeyStatus === 'missing' ? (
              <Link
                href="/?view=settings"
                className="inline-flex items-center gap-1.5 font-medium text-red-600 hover:underline dark:text-red-400"
              >
                <Settings className="h-4 w-4" />
                Configure API key
              </Link>
            ) : parsedRecipients.length > 0 ? (
              <span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{validCount}</span> to send
                {invalidCount > 0 && <>, {invalidCount} skipped</>}
              </span>
            ) : (
              'Add recipients to enable sending'
            )}
          </div>
          <Button
            onClick={handleSend}
            disabled={isLoading || apiKeyStatus === 'missing' || apiKeyStatus === 'checking' || validCount === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {progress.total > 0 ? `Sending ${progress.current} / ${progress.total}...` : 'Sending...'}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send{validCount > 0 ? ` to ${validCount}` : ''}
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
