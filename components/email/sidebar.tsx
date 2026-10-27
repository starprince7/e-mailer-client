'use client';

import { Send, Settings, Users, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/theme-switcher';

export type AppView = 'compose' | 'settings';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'compose' as const, label: 'Compose', icon: Send },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex w-16 md:w-64 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3 p-4 md:p-6">
        <Mail className="h-6 w-6 shrink-0 text-zinc-900 dark:text-zinc-50" />
        <h1 className="hidden md:block text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Email Client
        </h1>
      </div>

      <nav className="flex-1 space-y-1 px-2 md:px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'flex w-full items-center justify-center md:justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                activeView === item.id
                  ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
        <Link
          href="/bulk-send"
          className="flex w-full items-center justify-center md:justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
        >
          <Users className="h-5 w-5 shrink-0" />
          <span className="hidden md:inline">Bulk Send</span>
        </Link>
      </nav>

      <div className="flex flex-col items-center md:items-start gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <span className="hidden md:block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Theme
        </span>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
