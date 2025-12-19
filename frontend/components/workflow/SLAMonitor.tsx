
import React from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useSLAMonitoring, SLAItem } from '../../hooks/useSLAMonitoring';

// ============================================================================
// TYPES
// ============================================================================
interface SLAHeaderProps {
  theme: any;
}

interface SLAListProps {
  slas: SLAItem[];
  formatDeadline: (dueTime: number) => string;
  theme: any;
}

interface SLAItemCardProps {
  sla: SLAItem;
  formatDeadline: (dueTime: number) => string;
  theme: any;
}

// ============================================================================
// PRESENTATION COMPONENTS
// ============================================================================

/**
 * SLAHeader - Title and live indicator
 */
const SLAHeader: React.FC<SLAHeaderProps> = ({ theme }) => (
  <h3 className={cn("font-bold mb-4 flex items-center justify-between", theme.text.primary)}>
    <span className="flex items-center">
      <Clock className="h-5 w-5 mr-2 text-blue-600" /> SLA Live Monitor
    </span>
    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Live Tracking" />
  </h3>
);

/**
 * SLAItemCard - Individual SLA display with progress bar
 */
const SLAItemCard: React.FC<SLAItemCardProps> = ({ sla, formatDeadline, theme }) => {
  const statusClasses = {
    'Breached': `${theme.status.error.bg} ${theme.status.error.text}`,
    'At Risk': `${theme.status.warning.bg} ${theme.status.warning.text}`,
    'On Track': `${theme.status.success.bg} ${theme.status.success.text}`
  };

  const progressClasses = {
    'Breached': 'bg-red-500',
    'At Risk': 'bg-amber-500',
    'On Track': 'bg-green-500'
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className={cn("font-medium truncate max-w-[200px]", theme.text.primary)}>
          {sla.task}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${statusClasses[sla.status]}`}>
            {sla.status}
          </span>
          <span className={cn(
            "text-xs font-mono w-20 text-right font-bold", 
            sla.status === 'Breached' ? 'text-red-600' : theme.text.secondary
          )}>
            {formatDeadline(sla.dueTime)}
          </span>
        </div>
      </div>
      <div className={cn("w-full rounded-full h-1.5 overflow-hidden", theme.surface.highlight)}>
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${progressClasses[sla.status]}`} 
          style={{ width: `${sla.progress}%` }}
        />
      </div>
    </div>
  );
};

/**
 * SLAList - List of SLA items or empty state
 */
const SLAList: React.FC<SLAListProps> = ({ slas, formatDeadline, theme }) => {
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
        <SLAItemCard key={sla.id} sla={sla} formatDeadline={formatDeadline} theme={theme} />
      ))}
    </div>
  );
};

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

/**
 * SLAMonitor - Real-time SLA monitoring dashboard
 * 
 * Uses useSLAMonitoring hook for all business logic
 * Composed of presentation components for clean separation
 */
export const SLAMonitor: React.FC = () => {
  const { theme } = useTheme();
  const { slas, isLoading, formatDeadline } = useSLAMonitoring();

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border p-4 shadow-sm", theme.surface.default, theme.border.default)}>
      <SLAHeader theme={theme} />
      <SLAList slas={slas} formatDeadline={formatDeadline} theme={theme} />
    </div>
  );
};

