'use client';

import { Inbox, Send, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: 'inbox' | 'sent' | 'compose' | 'settings';
  onViewChange: (view: 'inbox' | 'sent' | 'compose' | 'settings') => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'inbox' as const, label: 'Inbox', icon: Inbox },
    { id: 'sent' as const, label: 'Sent', icon: Send },
    { id: 'compose' as const, label: 'Compose', icon: FileText },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Email Client
        </h1>
      </div>
      <nav className="space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                activeView === item.id
                  ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
