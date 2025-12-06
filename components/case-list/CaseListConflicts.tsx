import React from 'react';
import { ShieldAlert, Search, AlertCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { Case } from '../../types';
import { Button } from '../common/Button';

interface CaseListConflictsProps {
  onSelectCase?: (c: Case) => void;
}

export const CaseListConflicts: React.FC<CaseListConflictsProps> = ({ onSelectCase }) => {
  const { theme } = useTheme();

  const handleNav = async (caseId: string) => {
      if(onSelectCase) {
          const c = await DataService.cases.getById(caseId);
          if(c) onSelectCase(c);
      }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <div className="text-center">
        <div className={cn("p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center", theme.surfaceHighlight)}>
          <ShieldAlert className={cn("h-10 w-10", theme.text.tertiary)}/>
        </div>
        <h3 className={cn("text-xl font-bold", theme.text.primary)}>Global Conflict Search</h3>
        <p className={theme.text.secondary}>Search across all matters, parties, and intakes.</p>
      </div>
      <div className="relative group">
        <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 group-focus-within:text-blue-500", theme.text.tertiary)}/>
        <input 
          className={cn(
            "w-full pl-12 pr-28 py-4 rounded-full border shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all",
            theme.surface,
            theme.border.default,
            theme.text.primary
          )} 
          placeholder="Enter name or entity..." 
        />
        <Button variant="primary" className="absolute right-2 top-2 bottom-2 px-6 rounded-full font-medium transition-colors">Search</Button>
      </div>
      <div className={cn("p-4 rounded-lg border", theme.status.warning.bg, theme.status.warning.border)}>
        <h4 className={cn("font-bold text-sm mb-2 flex items-center", theme.status.warning.text)}><AlertCircle className="h-4 w-4 mr-2"/> Recent Potential Hits</h4>
        <ul className={cn("list-none text-sm space-y-2", theme.status.warning.text)}>
          <li className="flex items-center justify-between group cursor-pointer hover:underline" onClick={() => handleNav('C-2023-892')}>
             <span><strong>John Smith</strong> matched in <em>State v. GreenEnergy</em> (Witness)</span>
             <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"/>
          </li>
          <li className="flex items-center justify-between group cursor-pointer">
             <span><strong>Acme Corp</strong> matched in <em>Archive 2019-044</em> (Opposing Party)</span>
             <span className="text-xs border border-red-200 px-1 rounded">Archived</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
