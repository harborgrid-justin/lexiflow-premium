'use client';

import { cn } from '@/lib/utils';
import { Clock, FileText, LayoutTemplate } from 'lucide-react';
import { useState } from 'react';
import { DocumentExplorer } from './DocumentExplorer';
import { DocumentTemplates } from './DocumentTemplates';
import { RecentFiles } from './RecentFiles';

type Tab = 'browse' | 'recent' | 'templates';

export function DocumentManager() {
  const [activeTab, setActiveTab] = useState<Tab>('browse');

  const tabs = [
    { id: 'browse', label: 'Browse Files', icon: FileText },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="border-b border-slate-200 dark:border-slate-700 px-4">
        <div className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'browse' && <DocumentExplorer />}
        {activeTab === 'recent' && <RecentFiles />}
        {activeTab === 'templates' && <DocumentTemplates />}
      </div>
    </div>
  );
}
