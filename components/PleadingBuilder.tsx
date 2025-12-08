
import React, { useState } from 'react';
import { PleadingDesigner } from './pleading/PleadingDesigner';
import { PleadingDashboard } from './pleading/PleadingDashboard';
import { Case } from '../types';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { AnimatePresence, motion } from 'framer-motion'; // Assuming framer-motion is avail or we simulate transitions

interface PleadingBuilderProps {
  onSelectCase?: (c: Case) => void;
  caseId?: string;
}

export const PleadingBuilder: React.FC<PleadingBuilderProps> = ({ onSelectCase, caseId }) => {
  const { theme } = useTheme();
  const [view, setView] = useState<'dashboard' | 'designer'>('dashboard');
  const [selectedPleadingId, setSelectedPleadingId] = useState<string | null>(null);

  const handleCreate = (id: string) => {
      setSelectedPleadingId(id);
      setView('designer');
  };

  return (
    <div className={cn("h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-950", theme.text.primary)}>
        {view === 'dashboard' ? (
            <PleadingDashboard 
                onCreate={handleCreate} 
                onEdit={handleCreate} 
                caseId={caseId}
            />
        ) : (
            <PleadingDesigner 
                pleadingId={selectedPleadingId!} 
                onBack={() => setView('dashboard')}
            />
        )}
    </div>
  );
};

export default PleadingBuilder;
