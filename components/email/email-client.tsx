'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar, type AppView } from './sidebar';
import { ComposeForm } from './compose-form';
import { SettingsPanel } from './settings-panel';
import { ApiKeyBanner } from '@/components/api-key-banner';

export function EmailClient() {
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<AppView>(
    searchParams.get('view') === 'settings' ? 'settings' : 'compose'
  );

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-950">
      <ApiKeyBanner />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        <main className="flex-1 overflow-hidden">
          {activeView === 'compose' ? (
            <div className="mx-auto h-full max-w-4xl">
              <ComposeForm onOpenSettings={() => setActiveView('settings')} />
            </div>
          ) : (
            <div className="mx-auto h-full max-w-4xl">
              <SettingsPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
