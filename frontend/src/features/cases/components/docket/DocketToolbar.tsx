/**
 * DocketToolbar.tsx
 * 
 * Sticky toolbar for docket sheet with case title and add entry action.
 * 
 * @module components/docket/DocketToolbar
 * @category Case Management - Docket
 */

// External Dependencies
import React from 'react';
import { Plus } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '@/components/atoms';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

interface DocketToolbarProps {
  activeCaseTitle?: string;
  onAddEntry: () => void;
}

export const DocketToolbar: React.FC<DocketToolbarProps> = ({ activeCaseTitle, onAddEntry }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("p-4 border-b flex justify-between items-center sticky top-0 z-10", theme.surface.highlight, theme.border.default)}>
        <div>
            <h3 className={cn("font-bold text-lg", theme.text.primary)}>Case Docket</h3>
            <p className={cn("text-xs", theme.text.secondary)}>Viewing: {activeCaseTitle}</p>
        </div>
        <Button size="sm" variant="primary" icon={Plus} onClick={onAddEntry}>Add Entry</Button>
    </div>
  );
};
