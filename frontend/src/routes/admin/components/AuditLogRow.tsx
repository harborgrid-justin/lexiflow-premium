import { Shield } from 'lucide-react';
import React from 'react';

interface AuditLogRowProps {
  log: {
    action: string;
    userName?: string;
    user?: string;
    timestamp: string | number | Date;
  };
}

export function AuditLogRow({ log }: AuditLogRowProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors">
      <div>
        <div className="font-medium text-[var(--color-text)]">{log.action}</div>
        <div className="text-xs text-[var(--color-text-muted)]">
          {log.userName || log.user || 'System'} • {new Date(log.timestamp).toLocaleString()}
        </div>
      </div>
      <Shield className="w-4 h-4 text-[var(--color-text-muted)]" />
    </div>
  );
}
