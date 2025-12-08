
import React, { useState, useCallback } from 'react';
import { PleadingDashboard } from './pleading/PleadingDashboard';
import { PleadingEditor } from './pleading/Editor/PleadingEditor';
import { PleadingDocument } from '../types/pleadingTypes';
import { Case } from '../types';
import { DataService } from '../services/dataService';
import { useQuery } from '../services/queryClient';
import { STORES } from '../services/db';
import { LazyLoader } from './common/LazyLoader';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

interface PleadingBuilderProps {
  onSelectCase?: (c: Case) => void;
  caseId?: string; // Optional scoping
}

export const PleadingBuilder: React.FC<PleadingBuilderProps> = ({ onSelectCase, caseId }) => {
  const { theme } = useTheme();
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [selectedPleadingId, setSelectedPleadingId] = useState<string | null>(null);

  // Fetch Pleading if editing
  const { data: selectedPleading, isLoading } = useQuery<PleadingDocument | undefined>(
      [STORES.PLEADINGS, selectedPleadingId || 'none'],
      async () => {
          if (!selectedPleadingId) return undefined;
          return DataService.pleadings.getById(selectedPleadingId);
      },
      { enabled: !!selectedPleadingId }
  );

  const handleCreate = (newDoc: PleadingDocument) => {
      // In a real app, this would be an async create via mutation.
      // Here we assume it's created and we get the object to edit.
      setSelectedPleadingId(newDoc.id);
      setView('editor');
  };

  const handleEdit = (id: string) => {
      setSelectedPleadingId(id);
      setView('editor');
  };

  const handleCloseEditor = () => {
      setSelectedPleadingId(null);
      setView('dashboard');
  };

  if (view === 'editor' && isLoading) {
      return <LazyLoader message="Loading Document..." />;
  }

  return (
    <div className={cn("h-full animate-fade-in", theme.background)}>
        {view === 'dashboard' ? (
            <PleadingDashboard 
                onCreate={handleCreate} 
                onEdit={handleEdit} 
                caseId={caseId}
            />
        ) : (
            selectedPleading ? (
                <PleadingEditor 
                    document={selectedPleading} 
                    onClose={handleCloseEditor} 
                />
            ) : (
                <div className="flex items-center justify-center h-full">Error loading document.</div>
            )
        )}
    </div>
  );
};

export default PleadingBuilder;
