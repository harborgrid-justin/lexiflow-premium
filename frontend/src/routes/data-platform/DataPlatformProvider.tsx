/**
 * Data Platform Domain - State Provider
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router';
import type { DataPlatformLoaderData } from './loader';

type DataSource = {
  id: string;
  name: string;
  type: 'Database' | 'API' | 'File' | 'Stream';
  status: 'Connected' | 'Disconnected' | 'Error';
  recordCount: number;
  lastSync: string;
};

interface DataPlatformState {
  sources: DataSource[];
  typeFilter: 'all' | 'Database' | 'API' | 'File' | 'Stream';
}

interface DataPlatformMetrics {
  totalSources: number;
  connectedCount: number;
  totalRecords: number;
}

interface DataPlatformContextValue extends DataPlatformState {
  setTypeFilter: (filter: 'all' | 'Database' | 'API' | 'File' | 'Stream') => void;
  metrics: DataPlatformMetrics;
}

const DataPlatformContext = createContext<DataPlatformContextValue | undefined>(undefined);

export function DataPlatformProvider({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData() as DataPlatformLoaderData;

  const [typeFilter, setTypeFilter] = useState<'all' | 'Database' | 'API' | 'File' | 'Stream'>('all');

  const filteredSources = useMemo(() => {
    if (typeFilter === 'all') return loaderData.sources;
    return loaderData.sources.filter(s => s.type === typeFilter);
  }, [loaderData.sources, typeFilter]);

  const metrics = useMemo<DataPlatformMetrics>(() => ({
    totalSources: loaderData.sources.length,
    connectedCount: loaderData.sources.filter(s => s.status === 'Connected').length,
    totalRecords: loaderData.sources.reduce((sum, s) => sum + s.recordCount, 0),
  }), [loaderData.sources]);

  const contextValue = useMemo<DataPlatformContextValue>(() => ({
    sources: filteredSources,
    typeFilter,
    setTypeFilter,
    metrics,
  }), [filteredSources, typeFilter, metrics]);

  return (
    <DataPlatformContext.Provider value={contextValue}>
      {children}
    </DataPlatformContext.Provider>
  );
}

export function useDataPlatform(): DataPlatformContextValue {
  const context = useContext(DataPlatformContext);
  if (!context) {
    throw new Error('useDataPlatform must be used within DataPlatformProvider');
  }
  return context;
}
