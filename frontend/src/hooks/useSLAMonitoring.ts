/**
 * useSLAMonitoring.ts
 * 
 * Custom hook for real-time SLA monitoring
 * Separates SLA calculation logic from presentation
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services';
import { queryKeys } from '../utils/queryKeys';
import { useInterval } from './useInterval';
import { Task } from '@/types';

export interface SLAItem {
  id: string;
  task: string;
  dueTime: number;
  status: 'On Track' | 'At Risk' | 'Breached';
  progress: number;
}

interface UseSLAMonitoringOptions {
  maxItems?: number;
  updateInterval?: number;
  slaWindowDays?: number;
}

export const useSLAMonitoring = (options: UseSLAMonitoringOptions = {}) => {
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
};
