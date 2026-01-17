/**
 * Workflows Domain - State Provider
 * Enterprise React Architecture Pattern
 *
 * Responsibilities:
 * - Route-scoped state management
 * - Computed metrics and filtering
 * - UI state (transitions, filters)
 * - Action handlers with optimistic updates
 */

import type { Task, WorkflowInstance, WorkflowTemplate } from '@/types';
import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import type { WorkflowsLoaderData } from './loader';

/**
 * Workflow Domain Metrics
 */
interface WorkflowMetrics {
  totalTemplates: number;
  activeInstances: number;
  completedInstances: number;
  pendingTasks: number;
  overdueTasks: number;
}

/**
 * Workflow State
 */
interface WorkflowsState {
  templates: WorkflowTemplate[];
  instances: WorkflowInstance[];
  tasks: Task[];
  metrics: WorkflowMetrics;
  activeTab: 'templates' | 'instances' | 'tasks';
  searchTerm: string;
  statusFilter: string;
}

/**
 * Context API
 */
interface WorkflowsContextValue extends WorkflowsState {
  setActiveTab: (tab: 'templates' | 'instances' | 'tasks') => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  isPending: boolean;
}

const WorkflowsContext = createContext<WorkflowsContextValue | undefined>(undefined);

/**
 * Provider Component
 */
export function WorkflowsProvider({
  initialData,
  children,
}: {
  initialData: WorkflowsLoaderData;
  children: React.ReactNode;
}) {
  const [templates, _setTemplates] = useState<WorkflowTemplate[]>(initialData.templates);
  const [instances, _setInstances] = useState<WorkflowInstance[]>(initialData.instances);
  const [tasks, _setTasks] = useState<Task[]>(initialData.tasks);

  // UI State
  const [activeTab, setActiveTab] = useState<'templates' | 'instances' | 'tasks'>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isPending, startTransition] = useTransition();

  // Computed Metrics (memoized for performance)
  const metrics = useMemo<WorkflowMetrics>(() => ({
    totalTemplates: templates.length,
    activeInstances: instances.filter(i => i.status === 'running' || i.status === 'paused').length,
    completedInstances: instances.filter(i => i.status === 'completed').length,
    pendingTasks: tasks.filter(t => t.status === 'To Do' || t.status === 'In Progress').length,
    overdueTasks: tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'Completed';
    }).length,
  }), [templates, instances, tasks]);

  // Filtered Data
  const filteredTemplates = useMemo(() => {
    let result = templates;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [templates, searchTerm, statusFilter]);

  const filteredInstances = useMemo(() => {
    let result = instances;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter);
    }

    return result;
  }, [instances, searchTerm, statusFilter]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    return result;
  }, [tasks, searchTerm, statusFilter]);

  // Action Handlers with Transitions
  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const handleSetStatusFilter = useCallback((status: string) => {
    startTransition(() => {
      setStatusFilter(status);
    });
  }, []);

  const contextValue = useMemo<WorkflowsContextValue>(() => ({
    templates: filteredTemplates,
    instances: filteredInstances,
    tasks: filteredTasks,
    metrics,
    activeTab,
    searchTerm,
    statusFilter,
    setActiveTab,
    setSearchTerm: handleSetSearchTerm,
    setStatusFilter: handleSetStatusFilter,
    isPending,
  }), [
    filteredTemplates,
    filteredInstances,
    filteredTasks,
    metrics,
    activeTab,
    searchTerm,
    statusFilter,
    handleSetSearchTerm,
    handleSetStatusFilter,
    isPending,
  ]);

  return (
    <WorkflowsContext.Provider value={contextValue}>
      {children}
    </WorkflowsContext.Provider>
  );
}

/**
 * Hook to access Workflows context
 */
export function useWorkflows(): WorkflowsContextValue {
  const context = useContext(WorkflowsContext);
  if (!context) {
    throw new Error('useWorkflows must be used within WorkflowsProvider');
  }
  return context;
}
