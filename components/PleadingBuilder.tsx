import React, { useState } from 'react';
import { PleadingDesigner } from './pleading/PleadingDesigner';
import { PleadingDashboard } from './pleading/PleadingDashboard';
import { Case, PleadingDocument } from '../types';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { AnimatePresence, motion } from 'framer-motion'; 

interface PleadingBuilderProps {
  onSelectCase?: (c: Case) => void;
  caseId?: string;
}

export const PleadingBuilder: React.FC<PleadingBuilderProps> = ({ onSelectCase, caseId }) => {
  const { theme } = useTheme();
  const [view, setView] = useState<'dashboard' | 'designer'>('dashboard');
  const [selectedPleading, setSelectedPleading] = useState<PleadingDocument | null>(null);

  const handleCreate = (newDoc: PleadingDocument) => {
      setSelectedPleading(newDoc);
      setView('designer');
  };

  const handleEdit = (doc: PleadingDocument) => {
      setSelectedPleading(doc);
      setView('designer');
  };

  return (
    <div className={cn("h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-950", theme.text.primary)}>
        {view === 'dashboard' ? (
            <PleadingDashboard 
                onCreate={handleCreate} 
                onEdit={handleEdit} 
                caseId={caseId}
            />
        ) : (
            <PleadingDesigner 
                pleading={selectedPleading!} 
                onBack={() => setView('dashboard')}
            />
        )}
    </div>
  );
};

export default PleadingBuilder;