
import React from 'react';
import { Target, Monitor, Layers, FileText, Gavel, Users, Mic2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Case } from '../../types';

interface WarRoomSidebarProps {
  caseData: Case;
}

export const WarRoomSidebar: React.FC<WarRoomSidebarProps> = ({ caseData }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("w-64 border-r hidden md:block bg-slate-50/50", theme.border.default)}>
        <div className="p-4">
            <h4 className={cn("text-xs font-bold uppercase tracking-wide text-slate-400 mb-4 px-2")}>Quick Access</h4>
            <div className="space-y-1">
                <div className={cn("flex items-center justify-between px-3 py-2 rounded text-sm font-medium", theme.text.primary, "bg-white border shadow-sm")}>
                    <span className="flex items-center"><Gavel className="h-4 w-4 mr-2 text-blue-600"/> Judge Profile</span>
                </div>
                <div className={cn("flex items-center justify-between px-3 py-2 rounded text-sm font-medium", theme.text.secondary, "hover:bg-white hover:shadow-sm transition-all")}>
                    <span className="flex items-center"><Target className="h-4 w-4 mr-2"/> Opposing Counsel</span>
                </div>
            </div>
        </div>
        
        <div className="p-4 border-t border-slate-200">
            <h4 className={cn("text-xs font-bold uppercase tracking-wide text-slate-400 mb-4 px-2")}>Logistics</h4>
            <div className="space-y-3 text-sm text-slate-600 px-2">
                <p className="break-words"><strong>Court:</strong> {caseData.court}</p>
                <p><strong>Judge:</strong> {caseData.judge}</p>
                <p><strong>Clerk:</strong> {caseData.magistrateJudge || 'Unassigned'}</p>
                <p className="text-xs text-slate-400 mt-2 italic">Wireless creds unavailable.</p>
            </div>
        </div>
    </div>
  );
};
