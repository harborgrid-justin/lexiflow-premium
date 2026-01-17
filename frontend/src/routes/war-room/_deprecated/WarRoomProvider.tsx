/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * War Room Domain - State Provider
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { WarRoomLoaderData } from '../loader';

type WarRoomSession = {
  id: string;
  caseId: string;
  caseName: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  participants: string[];
  agenda: string;
  location: string;
};

interface WarRoomState {
  sessions: WarRoomSession[];
  statusFilter: 'all' | 'Scheduled' | 'In Progress' | 'Completed';
}

interface WarRoomMetrics {
  totalSessions: number;
  scheduled: number;
  inProgress: number;
}

interface WarRoomContextValue extends WarRoomState {
  setStatusFilter: (filter: 'all' | 'Scheduled' | 'In Progress' | 'Completed') => void;
  metrics: WarRoomMetrics;
}

const WarRoomContext = createContext<WarRoomContextValue | undefined>(undefined);

export interface WarRoomProviderProps {
  children: React.ReactNode;
  initialData: WarRoomLoaderData;
}

export function WarRoomProvider({ children, initialData }: WarRoomProviderProps) {
  const loaderData = initialData;

  const [statusFilter, setStatusFilter] = useState<'all' | 'Scheduled' | 'In Progress' | 'Completed'>('all');

  const filteredSessions = useMemo(() => {
    if (statusFilter === 'all') return loaderData.sessions;
    return loaderData.sessions.filter(s => s.status === statusFilter);
  }, [loaderData.sessions, statusFilter]);

  const metrics = useMemo<WarRoomMetrics>(() => ({
    totalSessions: loaderData.sessions.length,
    scheduled: loaderData.sessions.filter(s => s.status === 'Scheduled').length,
    inProgress: loaderData.sessions.filter(s => s.status === 'In Progress').length,
  }), [loaderData.sessions]);

  const contextValue = useMemo<WarRoomContextValue>(() => ({
    sessions: filteredSessions,
    statusFilter,
    setStatusFilter,
    metrics,
  }), [filteredSessions, statusFilter, metrics]);

  return (
    <WarRoomContext.Provider value={contextValue}>
      {children}
    </WarRoomContext.Provider>
  );
}

export function useWarRoom(): WarRoomContextValue {
  const context = useContext(WarRoomContext);
  if (!context) {
    throw new Error('useWarRoom must be used within WarRoomProvider');
  }
  return context;
}
