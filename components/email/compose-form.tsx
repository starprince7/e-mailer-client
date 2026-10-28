'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from './rich-text-editor';
import { emailTemplates, resolveTemplateVars } from '@/lib/templates';
import { Paperclip, X, Send, Loader2, CheckCircle, AlertCircle, Settings, Eye, Code, Type } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useApiKeyStatus } from '@/components/api-key-banner';
import { formatFileSize } from '@/lib/utils';

interface ComposeFormProps {
  onSuccess?: () => void;
  onOpenSettings?: () => void;
}

export function ComposeForm({ onSuccess, onOpenSettings }: ComposeFormProps) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fromTitle, setFromTitle] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const apiKeyStatus = useApiKeyStatus();
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [editorMode, setEditorMode] = useState<'rich' | 'html' | 'preview'>('rich');
  const [defaultFromName, setDefaultFromName] = useState('');
  const { toast } = useToast();

  const isHtmlTemplate = body.trimStart().toLowerCase().startsWith('<!doctype');

  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        const savedName = localStorage.getItem('resend_from_name');
        if (savedName) {
          setDefaultFromName(savedName);
          setFromTitle((prev) => prev || savedName);
        } else if (data.fromName) {
          setDefaultFromName(data.fromName);
          setFromTitle((prev) => prev || data.fromName);
        }
        if (data.templateVars) setTemplateVars(data.templateVars);
      } catch (error) {
        console.error('Failed to load app config:', error);
      }
    };

    loadAppConfig();
  }, []);

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
    setSelectedTemplate(templateId);
    if (!templateId) {
      clearTemplate();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    try {
      const formData = new FormData();
      formData.append('to', to);
      if (cc) formData.append('cc', cc);
      if (bcc) formData.append('bcc', bcc);
      formData.append('subject', subject);
      formData.append('body', body);
      formData.append('html', body);
      formData.append('fromTitle', fromTitle);
      const savedFromEmail = localStorage.getItem('resend_from_email');
      if (savedFromEmail) formData.append('fromEmail', savedFromEmail);

      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const headers: HeadersInit = {};
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers,
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
      setFromTitle(defaultFromName);
      setSelectedTemplate('');
      setEditorMode('rich');
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Use Template (Optional)
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
              className="w-full h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              onChange={(e) => handleTemplateSelect(e.target.value)}
              value={selectedTemplate}
            >
              <option value="">Select a template...</option>
              {emailTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
            {isHtmlTemplate && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                This is a full HTML email — use the HTML or Preview tab below to edit or view it.
              </p>
            )}
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
                className="w-full h-80 rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 resize-y"
                spellCheck={false}
              />
            )}

            {editorMode === 'preview' && (
              <div className="rounded-md border border-zinc-300 dark:border-zinc-700 overflow-hidden">
                <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Preview</span>
                </div>
                {body ? (
                  <iframe
                    srcDoc={body}
                    sandbox="allow-same-origin"
                    title="Email Preview"
                    className="w-full bg-white"
                    style={{ height: '500px', border: 'none' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 text-zinc-400 dark:text-zinc-600 text-sm">
                    No content yet. Write your email or select a template.
                  </div>
                )}
              </div>
            )}
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

      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm">
            {apiKeyStatus === 'checking' && (
              <><div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" /><span className="text-zinc-600 dark:text-zinc-400">Checking API key...</span></>
            )}
            {apiKeyStatus === 'env' && (
              <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-green-600 dark:text-green-400">API key configured (environment)</span></>
            )}
            {apiKeyStatus === 'local' && (
              <><CheckCircle className="h-4 w-4 text-blue-600" /><span className="text-blue-600 dark:text-blue-400">API key configured (settings)</span></>
            )}
            {apiKeyStatus === 'missing' && (
              <><AlertCircle className="h-4 w-4 text-red-600" /><span className="text-red-600 dark:text-red-400">API key required</span></>
            )}
          </div>
          {apiKeyStatus === 'missing' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenSettings?.()}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure API Key
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
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
        <Button type="submit" disabled={isLoading || apiKeyStatus === 'missing' || apiKeyStatus === 'checking'}>
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
      </div>
    </form>
  );
}
