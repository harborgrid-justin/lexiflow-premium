/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Data Platform Domain - State Provider
 */

import React, { useMemo, useState } from 'react';
import { DataPlatformContext, DataPlatformContextValue, DataPlatformMetrics } from './DataPlatformContext';
import type { DataPlatformLoaderData } from './loader';

export interface DataPlatformProviderProps {
  children: React.ReactNode;
  initialData: DataPlatformLoaderData;
}

export function DataPlatformProvider({ children, initialData }: DataPlatformProviderProps) {
  const loaderData = initialData;

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
    policies: loaderData.policies,
    schemas: loaderData.schemas,
    queries: loaderData.queries,
    typeFilter,
    setTypeFilter,
    metrics,
  }), [filteredSources, loaderData.policies, loaderData.schemas, loaderData.queries, typeFilter, metrics]);

  return (
    <DataPlatformContext.Provider value={contextValue}>
      {children}
    </DataPlatformContext.Provider>
  );
}
