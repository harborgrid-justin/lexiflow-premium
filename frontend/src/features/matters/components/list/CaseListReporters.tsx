/**
 * CaseListReporters.tsx
 * 
 * Court reporter management view for deposition scheduling
 * and transcript coordination.
 * 
 * @module components/case-list/CaseListReporters
 * @category Case Management - Reporter Views
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Mic2, Plus, User } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Button } from '../../components/atoms/Button';

// Hooks & Context
import { useTheme } from '../../../providers/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';

// Services & Utils
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
// ✅ Migrated to backend API (2025-12-21)

export const CaseListReporters: React.FC = () => {
  const { theme } = useTheme();
  
  const { data: reporters = [] } = useQuery(
      ['reporters', 'all'],
      DataService.discovery.getReporters
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
       <div className="flex justify-between items-center">
           <h3 className={cn("text-lg font-bold", theme.text.primary)}>Court Reporter Directory</h3>
           <Button variant="primary" icon={Plus}>Add Agency</Button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {reporters.map((r: unknown) => {
               if (typeof r !== 'object' || r === null) return null;
               const reporterId = 'id' in r ? String(r.id) : '';
               const reporterName = 'name' in r && typeof r.name === 'string' ? r.name : '';
               const reporterType = 'type' in r && typeof r.type === 'string' ? r.type : '';
               const reporterStatus = 'status' in r && typeof r.status === 'string' ? r.status : '';

               return (
               <div key={reporterId} className={cn("p-4 rounded-lg border shadow-sm flex items-center gap-3", theme.surface.default, theme.border.default)}>
                   <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                       <Mic2 className="h-5 w-5"/>
                   </div>
                   <div>
                       <p className={cn("font-bold text-sm", theme.text.primary)}>{reporterName}</p>
                       <p className={cn("text-xs", theme.text.secondary)}>{reporterType} • {reporterStatus}</p>
                   </div>
               </div>
               );
           })}
           
           <div className={cn("rounded-lg border-2 border-dashed p-4 flex flex-col items-center justify-center text-center text-slate-400", theme.border.default)}>
                <p className="text-sm">Manage preferred reporting agencies and individual reporters.</p>
           </div>
       </div>
    </div>
  );
};


