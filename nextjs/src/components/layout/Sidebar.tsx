'use client';

/**
 * Sidebar Component - Client Component
 * Navigation sidebar with interactive elements
 */

import { cn } from '@/lib/utils';
import {
  BarChart3,
  Calendar,
  FileSearch,
  Folder,
  Scale,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Cases', href: '/cases', icon: Scale },
  { name: 'Documents', href: '/documents', icon: Folder },
  { name: 'Research', href: '/research', icon: FileSearch },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Scale className="h-8 w-8 text-blue-600" />
          <span className="ml-3 text-xl font-bold text-slate-900 dark:text-slate-50">
            LexiFlow
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              JD
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                John Doe
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attorney
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
