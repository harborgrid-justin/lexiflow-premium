/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Data Platform Domain - View Component
 */

import { PageHeader } from '@/components/organisms/PageHeader';
import React, { useState } from 'react';
import { DataSourcesTab } from './components/DataSourcesTab';
import { QueryWorkbenchTab } from './components/QueryWorkbenchTab';
import { RLSPoliciesTab } from './components/RLSPoliciesTab';
import { SchemaManagerTab } from './components/SchemaManagerTab';

export default function DataPlatformView() {
  const [activeTab, setActiveTab] = useState<'sources' | 'policies' | 'schema' | 'query'>('sources');

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Data Platform"
        subtitle="Integrated data sources and pipelines"
      />

      <div className="px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="flex gap-6">
          <TabButton active={activeTab === 'sources'} onClick={() => setActiveTab('sources')}>Data Sources</TabButton>
          <TabButton active={activeTab === 'policies'} onClick={() => setActiveTab('policies')}>RLS Policies</TabButton>
          <TabButton active={activeTab === 'schema'} onClick={() => setActiveTab('schema')}>Schema Manager</TabButton>
          <TabButton active={activeTab === 'query'} onClick={() => setActiveTab('query')}>Query Workbench</TabButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'sources' && <DataSourcesTab />}
        {activeTab === 'policies' && <RLSPoliciesTab />}
        {activeTab === 'schema' && <SchemaManagerTab />}
        {activeTab === 'query' && <QueryWorkbenchTab />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`py-3 text-sm font-medium border-b-2 transition-colors ${active
          ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
    >
      {children}
    </button>
  )
}
