import { SLAItem, useSLAMonitoring } from '@/hooks/useSLAMonitoring';
import { cn } from '@/shared/lib/cn';
import { Clock, Loader2 } from 'lucide-react';
import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface SLAListProps {
  slas: SLAItem[];
  formatDeadline: (dueTime: number) => string;
}

interface SLAItemCardProps {
  sla: SLAItem;
  formatDeadline: (dueTime: number) => string;
}

// ============================================================================
// PRESENTATION COMPONENTS
// ============================================================================

/**
 * SLAHeader - Title and live indicator
 */
function SLAHeader() {
  return (
  <h3 className={cn("font-bold mb-4 flex items-center justify-between text-text")}>
    <span className="flex items-center">
      <Clock className="h-5 w-5 mr-2 text-blue-600" /> SLA Live Monitor
    </span>
    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Live Tracking" />
  </h3>
  );
}
SLAHeader.displayName = 'SLAHeader';

/**
 * SLAItemCard - Individual SLA display with progress bar
 */
function SLAItemCard({ sla, formatDeadline }: SLAItemCardProps) {
  const statusClasses = {
    'Breached': 'bg-error/10 text-error',
    'At Risk': 'bg-warning/10 text-warning',
    'On Track': 'bg-success/10 text-success'
  };

  const progressClasses = {
    'Breached': 'bg-red-500',
    'At Risk': 'bg-amber-500',
    'On Track': 'bg-green-500'
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className={cn("font-medium truncate max-w-[200px] text-text")}>
          {sla.task}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${statusClasses[sla.status]}`}>
            {sla.status}
          </span>
          <span className={cn(
            "text-xs font-mono w-20 text-right font-bold",
            sla.status === 'Breached' ? 'text-red-600' : 'text-text-muted'
          )}>
            {formatDeadline(sla.dueTime)}
          </span>
        </div>
      </div>
      <div className={cn("w-full rounded-full h-1.5 overflow-hidden bg-slate-100")}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ${progressClasses[sla.status]}`}
          style={{ width: `${sla.progress}%` }}
        />
      </div>
    </div>
  );
}
SLAItemCard.displayName = 'SLAItemCard';

/**
 * SLAList - List of SLA items or empty state
 */
function SLAList({ slas, formatDeadline }: SLAListProps) {
  if (slas.length === 0) {
    return (
      <div className="text-center text-xs text-slate-400 py-4">
        No active SLAs being tracked.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {slas.map(sla => (
        <SLAItemCard key={sla.id} sla={sla} formatDeadline={formatDeadline} />
      ))}
    </div>
  );
}
SLAList.displayName = 'SLAList';

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

/**
 * SLAMonitor - Real-time SLA monitoring dashboard
 *
 * Uses useSLAMonitoring hook for all business logic
 * Composed of presentation components for clean separation
 */
export function SLAMonitor() {
  const { slas, isLoading, formatDeadline } = useSLAMonitoring();

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border p-4 shadow-sm bg-surface border-border")}>
      <SLAHeader />
      <SLAList slas={slas} formatDeadline={formatDeadline} />
    </div>
  );
}

SLAMonitor.displayName = 'SLAMonitor';
