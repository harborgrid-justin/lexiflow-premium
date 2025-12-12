
import React from 'react';
import { Target, Gavel } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Case } from '../../types';
import { SectionTitle } from '../common/RefactoredCommon';

interface WarRoomSidebarProps {
  caseData: Case;
}

export const WarRoomSidebar: React.FC<WarRoomSidebarProps> = ({ caseData }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("w-64 border-r hidden md:block", theme.surfaceHighlight, theme.border.default)}>
        <div className="p-4">
            <SectionTitle className="px-2">Quick Access</SectionTitle>
            <div className="space-y-1">
                <div className={cn("flex items-center justify-between px-3 py-2 rounded text-sm font-medium border shadow-sm", theme.text.primary, theme.surface.default, theme.border.default)}>
                    <span className="flex items-center"><Gavel className="h-4 w-4 mr-2 text-blue-600"/> Judge Profile</span>
                </div>
                <div className={cn("flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all", theme.text.secondary, `hover:${theme.surface.default} hover:shadow-sm`)}>
                    <span className="flex items-center"><Target className="h-4 w-4 mr-2"/> Opposing Counsel</span>
                </div>
            </div>
        </div>
        
        <div className={cn("p-4 border-t", theme.border.default)}>
            <SectionTitle className="px-2">Logistics</SectionTitle>
            <div className={cn("space-y-3 text-sm px-2", theme.text.secondary)}>
                <p className="break-words"><strong>Court:</strong> {caseData.court}</p>
                <p><strong>Judge:</strong> {caseData.judge}</p>
                <p><strong>Clerk:</strong> {caseData.magistrateJudge || 'Unassigned'}</p>
                <p className={cn("text-xs mt-2 italic", theme.text.tertiary)}>Wireless creds unavailable.</p>
            </div>
        </div>
    </div>
  );
};
