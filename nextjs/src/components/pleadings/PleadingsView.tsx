'use client';

import { Button } from '@/components/ui/shadcn/button';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { PleadingDashboard } from './PleadingDashboard';
import { Card } from '@/components/ui/shadcn/card';

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
        <div className="border-b p-4 flex items-center gap-4 bg-background">
          <Button variant="ghost" size="sm" onClick={() => setView('dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <span className="font-medium">
            {selectedId === 'new' ? 'New Pleading' : 'Editing Pleading'}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/20 p-6">
          <Card className="max-w-md w-full p-12 flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Pleading Editor</h3>
            <p className="text-muted-foreground">The rich text editor component is currently under development.</p>
          </Card>
        </div>
      </div>
    );
  }

  return <PleadingDashboard onCreate={handleCreate} onEdit={handleEdit} />;
};
