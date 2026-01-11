'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Key, Save, Eye, EyeOff } from 'lucide-react';

export function SettingsPanel() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem('resend_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
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
      
      toast({
        title: 'API Key Saved',
        description: 'Your Resend API key has been validated and saved successfully.',
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
    localStorage.removeItem('resend_api_key');
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
              This application stores your API key in browser local storage for convenience. 
              For production use, consider implementing server-side authentication and storing 
              API keys in environment variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
