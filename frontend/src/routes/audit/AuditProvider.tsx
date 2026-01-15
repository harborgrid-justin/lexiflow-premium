/**
 * Audit Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import type { AuditLoaderData } from './loader';

type AuditLog = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  severity: 'Info' | 'Warning' | 'Critical';
  ipAddress: string;
};

interface AuditState {
  logs: AuditLog[];
  severityFilter: 'all' | 'Info' | 'Warning' | 'Critical';
  searchTerm: string;
}

interface AuditMetrics {
  totalLogs: number;
  criticalCount: number;
  warningCount: number;
}

interface AuditContextValue extends AuditState {
  setSeverityFilter: (filter: 'all' | 'Info' | 'Warning' | 'Critical') => void;
  setSearchTerm: (term: string) => void;
  metrics: AuditMetrics;
  isPending: boolean;
}

const AuditContext = createContext<AuditContextValue | undefined>(undefined);

export interface AuditProviderProps {
  children: React.ReactNode;
  initialData: AuditLoaderData;
}

export function AuditProvider({ children, initialData }: AuditProviderProps) {
  const loaderData = initialData;

  const [severityFilter, setSeverityFilter] = useState<'all' | 'Info' | 'Warning' | 'Critical'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredLogs = useMemo(() => {
    let result = loaderData.logs;

    if (severityFilter !== 'all') {
      result = result.filter(log => log.severity === severityFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log =>
        log.action.toLowerCase().includes(term) ||
        log.userName.toLowerCase().includes(term) ||
        log.resource.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loaderData.logs, severityFilter, searchTerm]);

  const metrics = useMemo<AuditMetrics>(() => ({
    totalLogs: loaderData.logs.length,
    criticalCount: loaderData.logs.filter(log => log.severity === 'Critical').length,
    warningCount: loaderData.logs.filter(log => log.severity === 'Warning').length,
  }), [loaderData.logs]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<AuditContextValue>(() => ({
    logs: filteredLogs,
    severityFilter,
    searchTerm,
    setSeverityFilter,
    setSearchTerm: handleSetSearchTerm,
    metrics,
    isPending,
  }), [filteredLogs, severityFilter, searchTerm, handleSetSearchTerm, metrics, isPending]);

  return (
    <AuditContext.Provider value={contextValue}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit(): AuditContextValue {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within AuditProvider');
  }
  return context;
}
