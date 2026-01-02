'use client';

import { cn } from '@/lib/utils';
import { BarChart2, BookOpen, Briefcase, FileText, Layout, Play, Plus, RefreshCw, Settings } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Mock Data
const MOCK_METRICS = {
  activeWorkflows: 12,
  tasksDueToday: 5,
  automationsRan: 142,
  efficiencyGain: 24
};

const WORKFLOW_TABS = [
  {
    id: 'management', label: 'Management', icon: Layout,
    subTabs: [
      { id: 'cases', label: 'Case Workflows', icon: Briefcase },
      { id: 'processes', label: 'Firm Processes', icon: Settings },
    ]
  },
  {
    id: 'analytics', label: 'Analytics', icon: BarChart2,
    subTabs: [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    ]
  },
  {
    id: 'library', label: 'Library', icon: BookOpen,
    subTabs: [
      { id: 'templates', label: 'Templates', icon: FileText },
    ]
  }
];

// Mock Components
const CaseWorkflowList = ({ onSelect }: any) => (
  <div className="p-6 bg-white rounded-lg border shadow-sm">
    <h3 className="text-lg font-medium mb-4">Active Case Workflows</h3>
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 border rounded hover:bg-slate-50 cursor-pointer" onClick={() => onSelect(`case-${i}`)}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-slate-900">Smith v. Jones - Discovery Phase</p>
              <p className="text-sm text-slate-500">Progress: 45% • Next Task: Review Documents</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Active</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FirmProcessList = ({ onSelect }: any) => (
  <div className="p-6 bg-white rounded-lg border shadow-sm">
    <h3 className="text-lg font-medium mb-4">Firm Processes</h3>
    <div className="space-y-3">
      {[1, 2].map(i => (
        <div key={i} className="p-4 border rounded hover:bg-slate-50 cursor-pointer" onClick={() => onSelect(`process-${i}`)}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-slate-900">New Client Onboarding</p>
              <p className="text-sm text-slate-500">Trigger: Client Created • Owner: Admin</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Enabled</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const WorkflowAnalyticsDashboard = ({ metrics }: any) => (
  <div className="p-6 bg-white rounded-lg border shadow-sm">
    <h3 className="text-lg font-medium mb-4">Workflow Analytics</h3>
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-slate-50 rounded border">
        <p className="text-sm text-slate-500">Active Workflows</p>
        <p className="text-2xl font-bold text-slate-900">{metrics.activeWorkflows}</p>
      </div>
      <div className="p-4 bg-slate-50 rounded border">
        <p className="text-sm text-slate-500">Tasks Due Today</p>
        <p className="text-2xl font-bold text-slate-900">{metrics.tasksDueToday}</p>
      </div>
      <div className="p-4 bg-slate-50 rounded border">
        <p className="text-sm text-slate-500">Automations Ran</p>
        <p className="text-2xl font-bold text-slate-900">{metrics.automationsRan}</p>
      </div>
      <div className="p-4 bg-slate-50 rounded border">
        <p className="text-sm text-slate-500">Efficiency Gain</p>
        <p className="text-2xl font-bold text-green-600">+{metrics.efficiencyGain}%</p>
      </div>
    </div>
    <div className="h-64 bg-slate-50 rounded border flex items-center justify-center text-slate-400">
      Chart Placeholder
    </div>
  </div>
);

const WorkflowLibrary = ({ onCreate }: any) => (
  <div className="p-6 bg-white rounded-lg border shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium">Template Library</h3>
      <button onClick={() => onCreate()} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
        <Plus className="h-4 w-4" /> New Template
      </button>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="p-4 border rounded hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-10 w-10 bg-blue-100 rounded flex items-center justify-center text-blue-600 mb-3">
            <FileText className="h-5 w-5" />
          </div>
          <h4 className="font-medium text-slate-900">Litigation Standard {i}</h4>
          <p className="text-sm text-slate-500 mt-1">Standard workflow for civil litigation cases.</p>
        </div>
      ))}
    </div>
  </div>
);

const DetailView = ({ id, type, onBack }: any) => (
  <div className="h-full flex flex-col bg-white rounded-lg border shadow-sm">
    <div className="p-4 border-b flex items-center gap-4">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-900">← Back</button>
      <h2 className="text-xl font-bold text-slate-900">
        {type === 'case' ? 'Case Workflow Detail' : 'Process Detail'}
      </h2>
    </div>
    <div className="p-6 flex-1 overflow-y-auto">
      <p className="text-slate-600">Details for {type} ID: {id}</p>
      <div className="mt-8 border rounded p-8 flex items-center justify-center bg-slate-50">
        Workflow Visualizer Placeholder
      </div>
    </div>
  </div>
);

const Builder = ({ onBack }: any) => (
  <div className="h-full flex flex-col bg-white rounded-lg border shadow-sm">
    <div className="p-4 border-b flex items-center gap-4">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-900">← Back</button>
      <h2 className="text-xl font-bold text-slate-900">Workflow Builder</h2>
    </div>
    <div className="flex-1 bg-slate-50 p-4">
      <div className="h-full border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
        Drag and Drop Canvas Placeholder
      </div>
    </div>
  </div>
);

type WorkflowView = 'cases' | 'processes' | 'dashboard' | 'templates';

interface MasterWorkflowProps {
  initialTab?: WorkflowView;
}

export default function MasterWorkflow({ initialTab }: MasterWorkflowProps) {
  const [activeTab, setActiveTab] = useState<WorkflowView>('cases');
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'builder'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'case' | 'process'>('case');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() =>
    WORKFLOW_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || WORKFLOW_TABS[0],
    [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = WORKFLOW_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as WorkflowView);
      setViewMode('list');
    }
  }, []);

  const handleSelectCase = (id: string) => {
    setSelectedId(id);
    setSelectedType('case');
    setViewMode('detail');
  };

  const handleSelectProcess = (id: string) => {
    setSelectedId(id);
    setSelectedType('process');
    setViewMode('detail');
  };

  const handleCreateTemplate = () => {
    setViewMode('builder');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedId(null);
  };

  const renderContent = () => {
    if (viewMode === 'detail') {
      return <DetailView id={selectedId} type={selectedType} onBack={handleBack} />;
    }

    if (viewMode === 'builder') {
      return <Builder onBack={handleBack} />;
    }

    switch (activeTab) {
      case 'cases':
        return <CaseWorkflowList onSelect={handleSelectCase} />;
      case 'processes':
        return <FirmProcessList onSelect={handleSelectProcess} />;
      case 'dashboard':
        return <WorkflowAnalyticsDashboard metrics={MOCK_METRICS} />;
      case 'templates':
        return <WorkflowLibrary onCreate={handleCreateTemplate} />;
      default:
        return <CaseWorkflowList onSelect={handleSelectCase} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      <div className="px-6 pt-6 shrink-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Workflow Automation</h1>
            <p className="text-slate-500 mt-1">Automate case processes, task dependencies, and firm operations.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
              <RefreshCw className="h-4 w-4" />
              Sync Engine
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm">
              <Play className="h-4 w-4" />
              Run Automation
            </button>
          </div>
        </div>

        {/* Desktop Parent Navigation */}
        <div className="hidden md:flex space-x-6 border-b border-slate-200 mb-4">
          {WORKFLOW_TABS.map(parent => (
            <button
              key={parent.id}
              onClick={() => handleParentTabChange(parent.id)}
              className={cn(
                "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                activeParentTab.id === parent.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? "text-blue-600" : "text-slate-400")} />
              {parent.label}
            </button>
          ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border border-slate-200 bg-white mb-4">
          {activeParentTab.subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WorkflowView)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                activeTab === tab.id
                  ? "bg-slate-100 text-blue-700 border-blue-200 shadow-sm"
                  : "bg-transparent text-slate-600 border-transparent hover:bg-slate-50"
              )}
            >
              <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? "text-blue-600" : "text-slate-400")} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
