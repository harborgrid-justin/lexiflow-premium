
import React from 'react';
import { Mic2, Plus, User } from 'lucide-react';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';
import { DataService } from '../../services/dataService';
import { STORES } from '../../services/db';

export const CaseListReporters: React.FC = () => {
  const { theme } = useTheme();
  
  const { data: reporters = [] } = useQuery(
      [STORES.REPORTERS, 'all'],
      DataService.discovery.getReporters
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
       <div className="flex justify-between items-center">
           <h3 className={cn("text-lg font-bold", theme.text.primary)}>Court Reporter Directory</h3>
           <Button variant="primary" icon={Plus}>Add Agency</Button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {reporters.map((r: any) => (
               <div key={r.id} className={cn("p-4 rounded-lg border shadow-sm flex items-center gap-3", theme.surface, theme.border.default)}>
                   <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                       <Mic2 className="h-5 w-5"/>
                   </div>
                   <div>
                       <p className={cn("font-bold text-sm", theme.text.primary)}>{r.name}</p>
                       <p className={cn("text-xs", theme.text.secondary)}>{r.type} • {r.status}</p>
                   </div>
               </div>
           ))}
           
           <div className={cn("rounded-lg border-2 border-dashed p-4 flex flex-col items-center justify-center text-center text-slate-400", theme.border.default)}>
                <p className="text-sm">Manage preferred reporting agencies and individual reporters.</p>
           </div>
       </div>
    </div>
  );
};
