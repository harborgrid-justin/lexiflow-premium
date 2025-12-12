
import React, { useState } from 'react';
import { ShieldAlert, Search, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { Case, ConflictCheck } from '../../types';
import { Button } from '../common/Button';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

interface CaseListConflictsProps {
  onSelectCase?: (c: Case) => void;
}

export const CaseListConflicts: React.FC<CaseListConflictsProps> = ({ onSelectCase }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Enterprise Data Access
  const { data: recentConflicts = [], isLoading } = useQuery<ConflictCheck[]>(
      [STORES.CONFLICTS, 'recent'],
      async () => {
          const all = await DataService.compliance.getConflicts();
          // Return flagged or recent items
          return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
      }
  );

  const handleNav = async (caseId: string) => {
      if(onSelectCase) {
          const c = await DataService.cases.getById(caseId);
          if(c) onSelectCase(c);
      }
  };

  const handleSearch = async () => {
      if (!searchTerm) return;
      await DataService.compliance.runConflictCheck(searchTerm);
      // Invalidate query to refresh list
      // queryClient.invalidate([STORES.CONFLICTS]); 
      // (Assuming automatic refresh via query key or parent re-render in real app)
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
            theme.surface.default,
            theme.border.default,
            theme.text.primary
          )} 
          placeholder="Enter name or entity..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="primary" className="absolute right-2 top-2 bottom-2 px-6 rounded-full font-medium transition-colors" onClick={handleSearch}>Search</Button>
      </div>

      <div className={cn("p-4 rounded-lg border", theme.status.warning.bg, theme.status.warning.border)}>
        <h4 className={cn("font-bold text-sm mb-2 flex items-center", theme.status.warning.text)}><AlertCircle className="h-4 w-4 mr-2"/> Recent Potential Hits</h4>
        {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin h-5 w-5 text-amber-600"/></div>
        ) : (
            <ul className={cn("list-none text-sm space-y-2", theme.status.warning.text)}>
            {recentConflicts.length === 0 && <li className="italic opacity-70">No recent conflicts found.</li>}
            {recentConflicts.map(conflict => (
                <li key={conflict.id} className="flex items-center justify-between group cursor-pointer hover:underline">
                    <span><strong>{conflict.entityName}</strong> matched in {conflict.foundIn[0] || 'Database'}</span>
                    <span className={cn("text-xs border px-1 rounded", conflict.status === 'Flagged' ? "border-red-200 bg-red-100" : "border-amber-200")}>{conflict.status}</span>
                </li>
            ))}
            </ul>
        )}
      </div>
    </div>
  );
};
