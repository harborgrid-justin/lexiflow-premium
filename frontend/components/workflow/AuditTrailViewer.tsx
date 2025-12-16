
import React from 'react';
import { History, User, Check, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { AuditLogEntry } from '../../types';
import { useQuery, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { queryKeys } from '../../utils/queryKeys';
import { VirtualList } from '../common/VirtualList';
import { AuditEvent } from './types';

export const AuditTrailViewer: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  const { data: logs = [], isLoading } = useQuery<AuditLogEntry[]>(
      [STORES.LOGS, 'all'],
      DataService.admin.getLogs
  );

  // Transform data
  const events: AuditEvent[] = React.useMemo(() => logs.map(l => ({
      id: l.id,
      timestamp: new Date(l.timestamp).toLocaleString(),
      user: l.user,
      action: l.action,
      detail: l.resource,
      type: l.action.includes('DELETE') ? 'warning' : 'info'
  })), [logs]);

  const refresh = () => queryClient.invalidate(queryKeys.logs.all());

  const renderRow = (evt: AuditEvent) => (
    <div key={evt.id} className={cn("relative pl-6 pb-2 border-l-2 last:border-0 last:pb-0 h-16 pr-4", theme.border.default)}>
        <div className={cn(
            "absolute -left-[9px] top-2 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center",
            evt.type === 'success' ? 'bg-green-500' : evt.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
        )}>
            {evt.type === 'success' ? <Check className="h-2 w-2 text-white" /> : evt.type === 'warning' ? <AlertCircle className="h-2 w-2 text-white" /> : <User className="h-2 w-2 text-white" />}
        </div>
        <div className="flex justify-between items-start pt-1">
            <div>
            <p className={cn("text-sm font-semibold", theme.text.primary)}>{evt.action}</p>
            <p className={cn("text-xs", theme.text.secondary)}>{evt.detail}</p>
            </div>
            <div className="text-right">
            <p className={cn("text-[10px] font-mono", theme.text.tertiary)}>{evt.timestamp}</p>
            <p className={cn("text-[10px] font-medium", theme.text.secondary)}>{evt.user}</p>
            </div>
        </div>
    </div>
  );

  return (
    <div className={cn("rounded-lg border overflow-hidden flex flex-col h-full", theme.surface.default, theme.border.default)}>
      <div className={cn("p-4 border-b flex justify-between items-center shrink-0", theme.surface.highlight, theme.border.default)}>
        <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
          <History className={cn("h-4 w-4 mr-2", theme.text.tertiary)} /> Workflow Audit Trail
        </h3>
        <button onClick={refresh} className={cn("text-xs hover:underline flex items-center", theme.primary.text)}>
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </button>
      </div>
      <div className="flex-1 relative min-h-[300px]">
        {isLoading ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-600"/></div>
        ) : (
            <VirtualList 
                items={events}
                height="100%"
                itemHeight={64}
                renderItem={renderRow}
                emptyMessage="No audit logs available."
            />
        )}
      </div>
    </div>
  );
};
