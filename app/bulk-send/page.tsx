'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/email/rich-text-editor';
import { Send, Loader2, CheckCircle, AlertCircle, Settings, ArrowLeft, Eye, Code, Type } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { emailTemplates } from '@/lib/templates';

interface ParsedRecipient {
  email: string;
  firstName: string;
  valid: boolean;
}

export default function BulkSendPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedRecipients, setParsedRecipients] = useState<ParsedRecipient[]>([]);
  const [fromTitle, setFromTitle] = useState('Prince');
  const [fromEmail, setFromEmail] = useState('mailer@vissmingles.com');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [editorMode, setEditorMode] = useState<'rich' | 'html' | 'preview'>('rich');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'env' | 'local' | 'missing'>('checking');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const isHtmlTemplate = body.trimStart().toLowerCase().startsWith('<!doctype');

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      const isFullHtml = template.body.trimStart().toLowerCase().startsWith('<!doctype');
      setEditorMode(isFullHtml ? 'html' : 'rich');
    }
  };

  const previewHtml = body.replace(/\{\{firstName\}\}/g, 'there');

  useEffect(() => {
    const checkApiKeyStatus = async () => {
      try {
        const response = await fetch('/api/check-env-key');
        const data = await response.json();
        
        if (data.hasEnvKey) {
          setApiKeyStatus('env');
        } else {
          const localKey = localStorage.getItem('resend_api_key');
          setApiKeyStatus(localKey ? 'local' : 'missing');
        }
      } catch (error) {
        console.error('Failed to check API key status:', error);
        const localKey = localStorage.getItem('resend_api_key');
        setApiKeyStatus(localKey ? 'local' : 'missing');
      }
    };

    checkApiKeyStatus();
  }, []);

  useEffect(() => {
    if (jsonInput.trim() === '') {
      setParsedRecipients([]);
      return;
    }

    try {
      const sanitized = jsonInput.trim().replace(/,\s*([}\]])/g, '$1');
      const parsed = JSON.parse(sanitized);
      let recipients: unknown[] = [];

      if (Array.isArray(parsed)) {
        recipients = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        const possibleArrays = Object.values(parsed).filter(v => Array.isArray(v));
        if (possibleArrays.length > 0) {
          recipients = possibleArrays[0];
        }
      }

      const parsedData: ParsedRecipient[] = recipients.map((r: unknown) => {
        const recipient = r as Record<string, unknown> | null;
        const email = typeof recipient?.email === 'string' ? recipient.email : null;
        const fullName = typeof recipient?.fullName === 'string' ? recipient.fullName : null;
        const name = typeof recipient?.name === 'string' ? recipient.name : null;
        const displayName = fullName || name;
        const firstName = displayName ? displayName.trim().split(/\s+/)[0] : 'there';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const valid = Boolean(email && emailRegex.test(email.trim()));
        
        return {
          email: email || 'missing',
          firstName,
          valid,
        };
      });

      setParsedRecipients(parsedData);
    } catch {
      setParsedRecipients([]);
    }
  }, [jsonInput]);

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

    let apiKey: string | null = null;
    let hasEnvKey = false;
    
    try {
      const response = await fetch('/api/check-env-key');
      const data = await response.json();
      hasEnvKey = data.hasEnvKey;
    } catch (error) {
      console.error('Failed to check environment key:', error);
    }
    
    if (!hasEnvKey) {
      apiKey = localStorage.getItem('resend_api_key');
      if (!apiKey) {
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-300 border border-zinc-300 bg-transparent hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 h-9 px-3"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Bulk Send Email
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {apiKeyStatus === 'checking' && (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-zinc-600 dark:text-zinc-400">Checking API key...</span>
              </>
            )}
            {apiKeyStatus === 'env' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 dark:text-green-400">API key configured (environment)</span>
              </>
            )}
            {apiKeyStatus === 'local' && (
              <>
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600 dark:text-blue-400">API key configured (settings)</span>
              </>
            )}
            {apiKeyStatus === 'missing' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600 dark:text-red-400">API key required</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Recipients JSON
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`[
  {
    &quot;email&quot;: &quot;codeplugservices@gmail.com&quot;,
    &quot;username&quot;: &quot;starprince7&quot;,
    &quot;fullName&quot;: &quot;Code Plug&quot;,
    &quot;gender&quot;: &quot;MALE&quot;,
    &quot;bio&quot;: &quot;&quot;,
    &quot;profilePicture&quot;: &quot;https://res.cloudinary.com/starprince-dev/image/upload/v1749324779/viss-mingle/photobooks/ynxsmjmkh09fzwuuka68.jpg&quot;,
    &quot;conversationVibe&quot;: &quot;FUN_FLIRTY&quot;,
    &quot;age&quot;: 34,
    &quot;location&quot;: &quot;Lagos&quot;,
    &quot;dateOfBirth&quot;: &quot;1990-11-21T00:00:00.000Z&quot;,
    &quot;occupation&quot;: null,
    &quot;phoneNumber&quot;: null
  }
]`}
              className="w-full h-48 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-950 resize-y"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Paste a JSON array of recipient objects. Each object should have at least an &quot;email&quot; field.
            </p>
          </div>

          {parsedRecipients.length > 0 && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Recipients Preview ({parsedRecipients.length})
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {parsedRecipients.filter(r => r.valid).length} valid, {parsedRecipients.filter(r => !r.valid).length} invalid
                </div>
              </div>
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800 sticky top-0">
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
                        <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50 font-mono">{recipient.email}</td>
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
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="from-title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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
              <label htmlFor="from-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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

          <div>
            <label htmlFor="template-select" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Select Template (Optional)
            </label>
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
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Selecting a template will populate the subject and message fields. You can edit them before sending.
            </p>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {'{{firstName}}'}
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Use {'{{firstName}}'} as a placeholder for the recipient&apos;s first name.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Message
              </label>
              <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-700 rounded-md p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (!isHtmlTemplate) setEditorMode('rich');
                  }}
                  disabled={isHtmlTemplate}
                  title={isHtmlTemplate ? 'HTML templates cannot be edited in rich text mode — use the HTML tab' : undefined}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    editorMode === 'rich'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  } ${isHtmlTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Type className="h-3 w-3" />
                  Rich Text
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('html')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    editorMode === 'html'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                >
                  <Code className="h-3 w-3" />
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('preview')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    editorMode === 'preview'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
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
                className="w-full h-96 rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 resize-y"
                spellCheck={false}
              />
            )}

            {editorMode === 'preview' && (
              <div className="rounded-md border border-zinc-300 dark:border-zinc-700 overflow-hidden">
                <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Preview — <code className="font-mono">{'{{firstName}}'}</code> shown as &ldquo;there&rdquo;</span>
                  <span className="text-xs text-zinc-400">600px max-width</span>
                </div>
                {body ? (
                  <iframe
                    srcDoc={previewHtml}
                    sandbox="allow-same-origin"
                    title="Email Preview"
                    className="w-full"
                    style={{ height: '600px', border: 'none' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 text-zinc-400 dark:text-zinc-600 text-sm">
                    No content yet. Write your email or select a template.
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Use {'{{firstName}}'} as a placeholder for the recipient&apos;s first name.
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <div className="flex items-center justify-between">
            {apiKeyStatus === 'missing' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/#settings'}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure API Key
              </Button>
            )}
            <Button
              onClick={handleSend}
              disabled={isLoading || apiKeyStatus === 'missing' || apiKeyStatus === 'checking' || parsedRecipients.filter(r => r.valid).length === 0}
              className="ml-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {progress.total > 0 ? `Sending ${progress.current} / ${progress.total}...` : 'Sending...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {parsedRecipients.filter(r => r.valid).length} Recipients
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
