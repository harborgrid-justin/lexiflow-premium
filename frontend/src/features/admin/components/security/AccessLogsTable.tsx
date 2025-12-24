import React from 'react';
import { Search, Download } from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import type { AccessLogEntry } from './types';

interface AccessLogsTableProps {
  logs: AccessLogEntry[];
  onExport: () => void;
}

const statusColors = {
  success: 'success' as const,
  failed: 'warning' as const,
  blocked: 'error' as const
};

export const AccessLogsTable: React.FC<AccessLogsTableProps> = ({ logs, onExport }) => {
  const { theme } = useTheme();

  return (
    <Card title="Recent Access Logs">
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
          <input
            type="text"
            placeholder="Search logs..."
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-lg border text-sm",
              theme.surface.default,
              theme.border.default
            )}
          />
        </div>
        <Button variant="outline" icon={Download} size="sm" onClick={onExport}>
          Export
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={cn("border-b", theme.border.default)}>
            <tr>
              <th className={cn("text-left py-3 px-4 font-medium", theme.text.secondary)}>Timestamp</th>
              <th className={cn("text-left py-3 px-4 font-medium", theme.text.secondary)}>User</th>
              <th className={cn("text-left py-3 px-4 font-medium", theme.text.secondary)}>Action</th>
              <th className={cn("text-left py-3 px-4 font-medium", theme.text.secondary)}>IP Address</th>
              <th className={cn("text-left py-3 px-4 font-medium", theme.text.secondary)}>Location</th>
              <th className={cn("text-left py-3 px-4 font-medium", theme.text.secondary)}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className={cn("border-b", theme.border.subtle)}>
                <td className={cn("py-3 px-4", theme.text.secondary)}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className={cn("py-3 px-4", theme.text.primary)}>{log.user}</td>
                <td className={cn("py-3 px-4", theme.text.primary)}>{log.action}</td>
                <td className={cn("py-3 px-4 font-mono text-xs", theme.text.secondary)}>
                  {log.ipAddress}
                </td>
                <td className={cn("py-3 px-4", theme.text.secondary)}>{log.location || 'N/A'}</td>
                <td className="py-3 px-4">
                  <Badge variant={statusColors[log.status]}>
                    {log.status.toUpperCase()}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
