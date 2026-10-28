'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { API_KEY_UPDATED_EVENT } from '@/components/api-key-banner';
import { Key, Save, Eye, EyeOff, Palette, Mail, Loader2 } from 'lucide-react';

export function SettingsPanel() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fromName, setFromName] = useState('');
  const [fromLocalPart, setFromLocalPart] = useState('');
  const [fromDomain, setFromDomain] = useState('');
  const [verifiedDomains, setVerifiedDomains] = useState<string[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const { toast } = useToast();

  const fetchVerifiedDomains = async (key: string) => {
    setDomainsLoading(true);
    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.domains)) {
        const verified = data.domains
          .filter((d: { status: string }) => d.status === 'verified')
          .map((d: { name: string }) => d.name);
        setVerifiedDomains(verified);
        setFromDomain((prev) => (verified.includes(prev) ? prev : verified[0] ?? ''));
      }
    } catch {
      // Domain list is a convenience — manual entry still works without it.
    } finally {
      setDomainsLoading(false);
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('resend_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      fetchVerifiedDomains(savedKey);
    }

    const savedFrom = localStorage.getItem('resend_from_email') ?? '';
    const atIndex = savedFrom.lastIndexOf('@');
    if (atIndex > 0) {
      setFromLocalPart(savedFrom.slice(0, atIndex));
      setFromDomain(savedFrom.slice(atIndex + 1));
    }
    setFromName(localStorage.getItem('resend_from_name') ?? '');
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'API key cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    if (!apiKey.startsWith('re_')) {
      toast({
        title: 'Invalid API key',
        description: 'Resend API keys should start with "re_"',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/validate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate API key');
      }

      localStorage.setItem('resend_api_key', apiKey);

      const fromEmail = fromLocalPart.trim() && fromDomain.trim()
        ? `${fromLocalPart.trim()}@${fromDomain.trim()}`
        : '';
      if (fromEmail) {
        localStorage.setItem('resend_from_email', fromEmail);
      } else {
        localStorage.removeItem('resend_from_email');
      }
      if (fromName.trim()) {
        localStorage.setItem('resend_from_name', fromName.trim());
      } else {
        localStorage.removeItem('resend_from_name');
      }

      window.dispatchEvent(new Event(API_KEY_UPDATED_EVENT));
      fetchVerifiedDomains(apiKey);

      toast({
        title: 'Settings Saved',
        description: fromEmail
          ? `Ready to send as ${fromName.trim() || fromEmail} <${fromEmail}>.`
          : 'Your Resend API key has been validated and saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Validation Failed',
        description: error instanceof Error ? error.message : 'Could not validate API key',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    setFromName('');
    setFromLocalPart('');
    setFromDomain('');
    setVerifiedDomains([]);
    localStorage.removeItem('resend_api_key');
    localStorage.removeItem('resend_from_email');
    localStorage.removeItem('resend_from_name');
    window.dispatchEvent(new Event(API_KEY_UPDATED_EVENT));
    toast({
      title: 'API Key Cleared',
      description: 'Your API key has been removed from local storage.',
    });
  };

  return (
    <div className="h-full overflow-auto">
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Settings
        </h2>
      </div>
      
      <div className="p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Resend API Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  API Key
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="re_xxxxxxxxxxxxx"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Your API key is stored locally in your browser and never sent to any third-party servers.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Validating...' : 'Save & Validate'}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Sender Address
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Emails you send will come from this address. It must be on a domain verified in
                your Resend account — save your API key first and we&apos;ll list your verified
                domains for you.
              </p>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Sender Name (shown to recipients)
                </label>
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Sender Email
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="hello"
                    value={fromLocalPart}
                    onChange={(e) => setFromLocalPart(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-zinc-500 dark:text-zinc-400">@</span>
                  {domainsLoading ? (
                    <div className="flex-1 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking your domains...
                    </div>
                  ) : verifiedDomains.length > 0 ? (
                    <select
                      value={fromDomain}
                      onChange={(e) => setFromDomain(e.target.value)}
                      className="flex-1 h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    >
                      {verifiedDomains.map((domain) => (
                        <option key={domain} value={domain}>{domain}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type="text"
                      placeholder="yourdomain.com"
                      value={fromDomain}
                      onChange={(e) => setFromDomain(e.target.value)}
                      className="flex-1"
                    />
                  )}
                </div>
                {verifiedDomains.length === 0 && apiKey && !domainsLoading && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    No verified domains found on this key yet — verify one in Resend → Domains, then save again.
                  </p>
                )}
                {fromLocalPart.trim() && fromDomain.trim() && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Sending as: <span className="font-medium text-zinc-900 dark:text-zinc-50">{fromName.trim() || fromLocalPart.trim()} &lt;{fromLocalPart.trim()}@{fromDomain.trim()}&gt;</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Choose light, dark, or follow your system preference.
              </p>
              <ThemeSwitcher />
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              How to get your API Key
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>Go to <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">resend.com</a> and create an account</li>
              <li>Navigate to the API Keys section in your dashboard</li>
              <li>Create a new API key with send email permissions</li>
              <li>Copy the API key and paste it above</li>
            </ol>
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Security Notice
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              A key saved here is stored in your browser&apos;s local storage and sent with each
              request. It is always used for sends from this browser — it takes precedence over
              the server-side <code className="font-mono">resendApiKey</code> in
              <code className="font-mono"> app.config.json</code> or the <code className="font-mono">RESEND_API_KEY</code> environment
              variable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
