'use client';

import { Button } from '@/components/ui/atoms/Button/Button';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { PleadingDashboard } from './PleadingDashboard';

export const PleadingsView = () => {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCreate = () => {
    // In a real app, we'd get the ID of the new doc
    setSelectedId('new');
    setView('editor');
  };

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setView('editor');
  };

  if (view === 'editor') {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4 bg-white dark:bg-slate-800">
          <Button variant="ghost" size="sm" onClick={() => setView('dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {selectedId === 'new' ? 'New Pleading' : 'Editing Pleading'}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Pleading Editor</p>
            <p className="text-sm">Editor component coming soon...</p>
          </div>
        </div>
      </div>
    );
  }

  return <PleadingDashboard onCreate={handleCreate} onEdit={handleEdit} />;
};
