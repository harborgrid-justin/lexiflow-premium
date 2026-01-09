'use client';

import { DataService } from '@/services/data/dataService';
import { cn } from '@/lib/utils';
import { BarChart2, BookOpen, Briefcase, FileText, Layout, Play, Plus, RefreshCw, Settings, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";

// Types derived from API would be better, but assuming interface for now
interface WorkflowInstance {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  currentStep: string;
}

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

const CaseWorkflowList = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await DataService.workflow.getAll({ type: 'case', status: 'active' });
        setWorkflows(data as unknown as WorkflowInstance[]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Case Workflows</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workflows.length === 0 ? <p className="text-muted-foreground p-4 text-center">No active workflows found.</p> : null}
        {workflows.map(w => (
          <div
            key={w.id}
            className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onSelect(w.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{w.name}</p>
                <p className="text-sm text-muted-foreground mt-1">Progress: {w.progress}% • Current Step: {w.currentStep}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                {w.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const FirmProcessList = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const [processes, setProcesses] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await DataService.workflow.getAll({ type: 'process' });
        setProcesses(data as unknown as WorkflowInstance[]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firm Processes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {processes.length === 0 ? <p className="text-muted-foreground p-4 text-center">No processes defined.</p> : null}
        {processes.map(p => (
          <div
            key={p.id}
            className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onSelect(p.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground mt-1">Status: {p.status}</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">Enabled</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const WorkflowAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Assuming analytics service or workflow stats
        // Using workflow getStats if available, else mocking computation from getAll
        const workflows = await DataService.workflow.getAll();
        const active = workflows.filter((w: unknown) => w.status === 'active').length;
        const total = workflows.length;

        // Mocking derived stats for now as API exploration needed for exact stat endpoint
        setMetrics({
          activeWorkflows: active,
          totalWorkflows: total,
          efficiencyGain: 15 // Placeholder until backend calc available
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Analytics</CardTitle>
        <CardDescription>Performance metrics and automation statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm text-muted-foreground">Active Workflows</p>
            <p className="text-2xl font-bold mt-1">{metrics?.activeWorkflows || 0}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm text-muted-foreground">Total Workflows</p>
            <p className="text-2xl font-bold mt-1">{metrics?.totalWorkflows || 0}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm text-muted-foreground">Efficiency Gain</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">+{metrics?.efficiencyGain || 0}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WorkflowLibrary = ({ onCreate }: { onCreate: () => void }) => {
  const [templates, setTemplates] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch templates via DataService
        const data = await DataService.workflow.getTemplates ? await DataService.workflow.getTemplates() : [];
        setTemplates(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Template Library</CardTitle>
        <Button onClick={() => onCreate()} size="sm">
          <Plus className="h-4 w-4 mr-2" /> New Template
        </Button>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? <p className="text-muted-foreground text-sm">No templates found.</p> : null}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-card">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="font-medium">{t.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const DetailView = ({ id, type, onBack }: { id: string | null, type: string, onBack: () => void }) => {
  const [details, setDetails] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await DataService.workflow.getById(id);
        setDetails(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <Card className="h-full flex flex-col border-0 shadow-none">
      <div className="p-4 border-b flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="sm" className="gap-2">
          ← Back
        </Button>
        <h2 className="text-xl font-bold">
          {details?.name || 'Workflow Detail'}
        </h2>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <p className="text-muted-foreground">Type: {details?.type} | Status: {details?.status}</p>
        {/* Render steps or visualizer here based on API data */}
        <div className="mt-8 border rounded-lg p-8 flex items-center justify-center bg-muted/10 h-96">
          Workflow Visualizer Placeholder (Data Loaded)
        </div>
      </div>
    </Card>
  );
};

// ... Builder component remains same as it is a tool not data view ... E.g.
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
        Builder Mode
      </div>
    </div>
  </Card>
);

type WorkflowView = 'cases' | 'processes' | 'dashboard' | 'templates';

interface MasterWorkflowProps {
  initialTab?: WorkflowView;
}

export default function MasterWorkflow({ initialTab }: MasterWorkflowProps) {
  const [activeTab, setActiveTab] = useState<WorkflowView>(initialTab || 'cases');
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'builder'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'case' | 'process'>('case');

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
        return <WorkflowAnalyticsDashboard />;
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
