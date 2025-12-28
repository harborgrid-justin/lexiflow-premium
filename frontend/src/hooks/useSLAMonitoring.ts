/**
 * @module hooks/useSLAMonitoring
 * @category Hooks - Operations
 * 
 * Provides real-time SLA monitoring for task deadlines.
 * Automatically updates status and progress indicators.
 * 
 * @example
 * ```typescript
 * const slaMonitor = useSLAMonitoring({
 *   maxItems: 10,
 *   updateInterval: 1000,
 *   slaWindowDays: 5
 * });
 * 
 * {slaMonitor.slas.map(sla => (
 *   <SLACard
 *     key={sla.id}
 *     status={sla.status}
 *     progress={sla.progress}
 *     deadline={slaMonitor.formatDeadline(sla.dueTime)}
 *   />
 * ))}
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services';
import { queryKeys } from '@/utils/queryKeys';
import { useInterval } from './useInterval';
import { Task } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * SLA monitoring item
 */
export interface SLAItem {
  /** Task ID */
  id: string;
  /** Task name */
  task: string;
  /** Due time (timestamp) */
  dueTime: number;
  /** Current SLA status */
  status: 'On Track' | 'At Risk' | 'Breached';
  /** Progress percentage (0-100) */
  progress: number;
}

export interface UseSLAMonitoringOptions {
  /** Maximum items to monitor */
  maxItems?: number;
  /** Update interval in milliseconds */
  updateInterval?: number;
  /** SLA window in days */
  slaWindowDays?: number;
}

/**
 * Return type for useSLAMonitoring hook
 */
export interface UseSLAMonitoringReturn {
  /** Current SLA items */
  slas: SLAItem[];
  /** Whether data is loading */
  isLoading: boolean;
  /** Format deadline for display */
  formatDeadline: (dueTime: number) => string;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Monitors task SLAs with real-time updates.
 * 
 * @param options - Configuration options
 * @returns Object with SLA items and utilities
 */
export function useSLAMonitoring(
  options: UseSLAMonitoringOptions = {}
): UseSLAMonitoringReturn {
  const {
    maxItems = 10,
    updateInterval = 1000,
    slaWindowDays = 5
  } = options;

  const [slas, setSLAs] = useState<SLAItem[]>([]);

  const { data: tasks = [], isLoading } = useQuery(
    queryKeys.tasks.all(),
    () => DataService.tasks.getAll()
  );

  // Calculate SLA status and progress
  const calculateSLAStatus = useCallback((dueTime: number): Pick<SLAItem, 'status' | 'progress'> => {
    const now = Date.now();
    const totalDuration = slaWindowDays * 24 * 60 * 60 * 1000;
    const startTime = dueTime - totalDuration;
    
    const elapsed = now - startTime;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    const msLeft = dueTime - now;
    const hoursLeft = msLeft / (1000 * 60 * 60);
    
    let status: SLAItem['status'] = 'On Track';
    if (msLeft < 0) {
      status = 'Breached';
    } else if (hoursLeft < 24) {
      status = 'At Risk';
    }

    return { status, progress };
  }, [slaWindowDays]);

  // Initialize SLAs from tasks
  useEffect(() => {
    const taskList = (tasks || []) as Task[];
    if (taskList.length > 0) {
      const items = taskList
        .filter((t: Task) => t.dueDate && t.status !== 'Completed')
        .map((t: Task) => {
          const dueTime = new Date(t.dueDate!).getTime();
          const { status, progress } = calculateSLAStatus(dueTime);

          return {
            id: t.id,
            task: t.title,
            dueTime,
            status,
            progress
          };
        })
        .slice(0, maxItems);

      setSLAs(items);
    }
  }, [tasks, maxItems, calculateSLAStatus]);

  // Real-time tick update
  useInterval(() => {
    setSLAs(prev => prev.map(sla => ({
      ...sla,
      ...calculateSLAStatus(sla.dueTime)
    })));
  }, updateInterval);

  const formatDeadline = useCallback((dueTime: number): string => {
    const now = Date.now();
    const diff = dueTime - now;
    
    if (diff < 0) {
      const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
      return `${hours}h ago`;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 24) {
      return `${hours}h ${minutes}m`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }, []);

  return {
    slas,
    isLoading,
    formatDeadline
  };
}
