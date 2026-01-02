'use client';

/**
 * Sidebar Component - Client Component
 * Enterprise navigation sidebar with collapsible sections
 * Responsive design with hover states and active indicators
 */

import { cn } from '@/lib/utils';
import {
  BarChart3,
  Calendar,
  ChevronDown,
  DollarSign,
  FileSearch,
  Folder,
  Lock,
  LogOut,
  Scale,
  Settings,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="h-5 w-5" /> },

  {
    name: 'Case Management',
    icon: <Scale className="h-5 w-5" />,
    children: [
      { name: 'Cases', href: '/cases', icon: <Scale className="h-5 w-5" /> },
      { name: 'Matters', href: '/matters', icon: <Folder className="h-5 w-5" /> },
      { name: 'Parties', href: '/parties', icon: <Users className="h-5 w-5" /> },
    ],
  },

  {
    name: 'Documents & Discovery',
    icon: <Folder className="h-5 w-5" />,
    children: [
      { name: 'Documents', href: '/documents', icon: <Folder className="h-5 w-5" /> },
      { name: 'Docket', href: '/docket', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Discovery', href: '/discovery', icon: <FileSearch className="h-5 w-5" /> },
      { name: 'Evidence', href: '/evidence', icon: <Lock className="h-5 w-5" /> },
    ],
  },

  {
    name: 'Legal Operations',
    icon: <Zap className="h-5 w-5" />,
    children: [
      { name: 'Research', href: '/research', icon: <FileSearch className="h-5 w-5" /> },
      { name: 'Calendar', href: '/calendar', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Compliance', href: '/compliance', icon: <Lock className="h-5 w-5" /> },
    ],
  },

  {
    name: 'Firm Operations',
    icon: <DollarSign className="h-5 w-5" />,
    children: [
      { name: 'Billing', href: '/billing', icon: <DollarSign className="h-5 w-5" /> },
      { name: 'Contacts', href: '/contacts', icon: <Users className="h-5 w-5" /> },
      { name: 'Analytics', href: '/analytics', icon: <BarChart3 className="h-5 w-5" /> },
    ],
  },

  { name: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
];

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

function NavItemComponent({ item, isActive, isExpanded, onToggle }: NavItemProps) {
  const pathname = usePathname();

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
      >
        {item.icon}
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold">
            {item.badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
      >
        {item.icon}
        <span className="flex-1 text-left">{item.name}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded && item.children && (
        <div className="mt-1 ml-2 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 pl-2">
          {item.children.map((child) => {
            const childIsActive = pathname?.startsWith(child.href || '/');
            return (
              <Link
                key={child.name}
                href={child.href || '#'}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                  childIsActive
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}
              >
                {child.icon}
                <span>{child.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboard']);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-sm hidden lg:flex flex-col">
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold">
            LF
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-50">LexiFlow</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI Legal Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {navigation.map((item) => {
          const isExpanded = expandedItems.includes(item.name);
          const isActive = item.href ? pathname?.startsWith(item.href) : false;

          return (
            <NavItemComponent
              key={item.name}
              item={item}
              isActive={isActive}
              isExpanded={isExpanded}
              onToggle={() => toggleExpanded(item.name)}
            />
          );
        })}
      </nav>

      {/* User Profile & Actions */}
      <div className="p-4 space-y-3 border-t border-slate-200 dark:border-slate-800">
        {/* User Card */}
        <div className="px-3 py-3 rounded-lg bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              JD
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                John Doe
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Senior Attorney
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Connected • Active
          </p>
        </div>

        {/* Logout Button */}
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
