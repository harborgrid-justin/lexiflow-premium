'use client';

import { workflowApi } from '@/api/domains/workflow.api';
import { cn } from '@/lib/utils';
import { BarChart2, BookOpen, Briefcase, FileText, Layout, Play, Plus, RefreshCw, Settings } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Badge } from "@/components/ui/shadcn/badge";

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
const CaseWorkflowList = ({ onSelect }: { onSelect: (id: string) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>Active Case Workflows</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => onSelect(`case-${i}`)}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Smith v. Jones - Discovery Phase</p>
              <p className="text-sm text-muted-foreground mt-1">Progress: 45% • Next Task: Review Documents</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">Active</Badge>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const FirmProcessList = ({ onSelect }: { onSelect: (id: string) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>Firm Processes</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {[1, 2].map(i => (
        <div
          key={i}
          className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => onSelect(`process-${i}`)}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">New Client Onboarding</p>
              <p className="text-sm text-muted-foreground mt-1">Trigger: Client Created • Owner: Admin</p>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">Enabled</Badge>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const WorkflowAnalyticsDashboard = ({ metrics }: { metrics: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Workflow Analytics</CardTitle>
      <CardDescription>Performance metrics and automation statistics</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-muted/30 rounded-lg border">
          <p className="text-sm text-muted-foreground">Active Workflows</p>
          <p className="text-2xl font-bold mt-1">{metrics.activeWorkflows}</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg border">
          <p className="text-sm text-muted-foreground">Tasks Due Today</p>
          <p className="text-2xl font-bold mt-1">{metrics.tasksDueToday}</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg border">
          <p className="text-sm text-muted-foreground">Automations Ran</p>
          <p className="text-2xl font-bold mt-1">{metrics.automationsRan}</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg border">
          <p className="text-sm text-muted-foreground">Efficiency Gain</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">+{metrics.efficiencyGain}%</p>
        </div>
      </div>
      <div className="h-64 bg-muted/20 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
        Chart Placeholder
      </div>
    </CardContent>
  </Card>
);

const WorkflowLibrary = ({ onCreate }: { onCreate: () => void }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle>Template Library</CardTitle>
      <Button onClick={() => onCreate()} size="sm">
        <Plus className="h-4 w-4 mr-2" /> New Template
      </Button>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-card">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
              <FileText className="h-5 w-5" />
            </div>
            <h4 className="font-medium">Litigation Standard {i}</h4>
            <p className="text-sm text-muted-foreground mt-1">Standard workflow for civil litigation cases.</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const DetailView = ({ id, type, onBack }: { id: string | null, type: string, onBack: () => void }) => (
  <Card className="h-full flex flex-col border-0 shadow-none">
    <div className="p-4 border-b flex items-center gap-4">
      <Button variant="ghost" onClick={onBack} size="sm" className="gap-2">
        ← Back
      </Button>
      <h2 className="text-xl font-bold">
        {type === 'case' ? 'Case Workflow Detail' : 'Process Detail'}
      </h2>
    </div>
    <div className="p-6 flex-1 overflow-y-auto">
      <p className="text-muted-foreground">Details for {type} ID: {id}</p>
      <div className="mt-8 border rounded-lg p-8 flex items-center justify-center bg-muted/10 h-96">
        Workflow Visualizer Placeholder
      </div>
    </div>
  </Card>
);

const Builder = ({ onBack }: { onBack: () => void }) => (
  <Card className="h-full flex flex-col border-0 shadow-none">
    <div className="p-4 border-b flex items-center gap-4">
      <Button variant="ghost" onClick={onBack} size="sm" className="gap-2">
        ← Back
      </Button>
      <h2 className="text-xl font-bold">Workflow Builder</h2>
    </div>
    <div className="flex-1 bg-muted/10 p-4">
      <div className="h-full border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-muted-foreground">
        Drag and Drop Canvas Placeholder
      </div>
    </div>
  </Card>
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
  const [metrics, setMetrics] = useState({
    activeWorkflows: 0,
    tasksDueToday: 0,
    automationsRan: 142, // Mock retained
    efficiencyGain: 24   // Mock retained
  });

  useEffect(() => {
    async function loadMetrics() {
      try {
        const workflows = await workflowApi.workflow.getInstances({ status: 'running' });
        const stats = await workflowApi.tasks.getStatistics();
        setMetrics(prev => ({
          ...prev,
          activeWorkflows: workflows.length,
          tasksDueToday: (stats as any).dueToday || 0
        }));
      } catch (e) { console.error(e); }
    }
    loadMetrics();
  }, []);

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
        return <WorkflowAnalyticsDashboard metrics={metrics} />;
      case 'templates':
        return <WorkflowLibrary onCreate={handleCreateTemplate} />;
      default:
        return <CaseWorkflowList onSelect={handleSelectCase} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 pt-6 shrink-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Workflow Automation</h1>
            <p className="text-muted-foreground mt-1">Automate case processes, task dependencies, and firm operations.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync Engine
            </Button>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Run Automation
            </Button>
          </div>
        </div>

        {/* Desktop Parent Navigation */}
        <div className="hidden md:flex space-x-6 border-b mb-4">
          {WORKFLOW_TABS.map(parent => (
            <button
              key={parent.id}
              onClick={() => handleParentTabChange(parent.id)}
              className={cn(
                "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                activeParentTab.id === parent.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? "text-primary" : "text-muted-foreground")} />
              {parent.label}
            </button>
          ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border bg-card mb-4">
          {activeParentTab.subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WorkflowView)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                activeTab === tab.id
                  ? "bg-muted text-primary border-primary/20 shadow-sm"
                  : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50"
              )}
            >
              <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? "text-primary" : "text-muted-foreground")} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {renderContent()}
      </div>
    </div>
  );
}
