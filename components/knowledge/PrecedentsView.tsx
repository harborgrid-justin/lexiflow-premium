
import React from 'react';
import { FileText, Download } from 'lucide-react';
import { DataService } from '../../services/dataService';
import { Precedent } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

export const PrecedentsView: React.FC = () => {
  const { theme } = useTheme();
  
  const { data: precedents = [] } = useQuery<Precedent[]>(
      [STORES.PRECEDENTS, 'all'],
      DataService.knowledge.getPrecedents
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {precedents.map(item => (
        <div key={item.id} className={cn("p-6 rounded-xl border shadow-sm transition-all hover:shadow-md cursor-pointer group flex flex-col", theme.surface, theme.border.default, `hover:${theme.primary.border}`)}>
          <div className="flex items-center justify-between mb-3">
            <div className={cn("p-2 rounded-lg", theme.surfaceHighlight)}>
                <FileText className={cn("h-6 w-6", theme.primary.text)}/>
            </div>
            <span className={cn(
                "text-xs font-bold px-2 py-1 rounded",
                item.tag === 'success' ? cn(theme.status.success.bg, theme.status.success.text) :
                item.tag === 'info' ? cn(theme.status.info.bg, theme.status.info.text) :
                item.tag === 'warning' ? cn(theme.status.warning.bg, theme.status.warning.text) :
                cn(theme.surfaceHighlight, theme.text.secondary)
            )}>
                {item.type}
            </span>
          </div>
          
          <h3 className={cn("font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors", theme.text.primary)}>{item.title}</h3>
          <p className={cn("text-sm mb-4 flex-1", theme.text.secondary)}>{item.description}</p>
          
          <div className={cn("flex items-center justify-between pt-4 border-t", theme.border.light)}>
            <div className={cn("text-xs font-mono", theme.text.tertiary)}>{item.docId}</div>
            <Button size="sm" variant="ghost" icon={Download} className={theme.text.secondary}>Download</Button>
          </div>
        </div>
      ))}
    </div>
  );
};
