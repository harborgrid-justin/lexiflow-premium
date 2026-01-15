import { AuditLog } from '@/lib/frontend-api';
import { adminApi } from '@/lib/frontend-api';
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from '@/hooks/useQueryHooks';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';
export function SystemLogs() {
  const { theme } = useTheme();

  // Fetch Logs
  const { data: logs = [], isLoading } = useQuery<AuditLog[]>(
    ['admin', 'logs'],
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await adminApi.auditLogs.getAll({ limit: 50 } as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Array.isArray(result) ? result : (result as any).data || [];
    },
    { refetchInterval: 10000 }
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={cn("text-2xl font-bold", theme.text.primary)}>System Logs</h2>
          <p className={cn("text-sm mt-1", theme.text.secondary)}>Audit trail and system events from PostgreSQL</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className={cn("animate-spin h-8 w-8", theme.primary.text)} />
        </div>
      ) : (
        <div className={cn("rounded-lg border overflow-hidden", theme.border.default, theme.surface.default)}>
          <table className="w-full text-sm text-left">
            <thead className={cn("text-xs uppercase bg-gray-50/50", theme.text.secondary)}>
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Level</th>
                <th className="px-6 py-3 font-medium">Message</th>
                <th className="px-6 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((logItem: AuditLog, i: number) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const log = logItem as any;
                  return (
                    <tr key={log.id || i} className={cn("hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors")}>
                      <td className="px-6 py-4 font-mono text-xs opacity-70">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-bold uppercase",
                          (log.level === 'error' || log.action?.includes('ERR')) ? theme.status.error.bg + ' ' + theme.status.error.text :
                            (log.level === 'warn') ? theme.status.warning.bg + ' ' + theme.status.warning.text :
                              theme.status.success.bg + ' ' + theme.status.success.text
                        )}>
                          {log.level || log.action || 'INFO'}
                        </span>
                      </td>
                      <td className={cn("px-6 py-4", theme.text.primary)}>
                        {log.message || log.details || JSON.stringify(log.changes || {})}
                      </td>
                      <td className={cn("px-6 py-4", theme.text.tertiary)}>
                        {log.source || log.entityType || 'System'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
