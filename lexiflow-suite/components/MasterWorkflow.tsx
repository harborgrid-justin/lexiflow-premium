
import React, { useState, useTransition } from 'react';
import { 
  Briefcase, Layers, Activity, LayoutTemplate, 
  BarChart2, Plus, RefreshCw, Zap, AlertTriangle,
  TrendingUp, Search, Filter, ArrowLeft
} from 'lucide-react';
import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { Button } from './common/Button.tsx';
import { MOCK_CASES } from '../data/mockCases.ts';
import { BUSINESS_PROCESSES } from '../data/mockFirmProcesses.ts';
import { 
  CaseWorkflowList, 
  FirmProcessList, 
  EnhancedWorkflowPanel,
  WorkflowTemplateBuilder,
  WorkflowEngineDetail,
  FirmProcessDetail,
  TemplatePreview,
  WorkflowTemplateData
} from './workflow/index.ts';
import { MetricCard } from './common/Primitives.tsx';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useTheme, ThemeDensity } from './providers/ThemeProvider.tsx';

const WORKFLOW_TEMPLATES: WorkflowTemplateData[] = [
  { id: 'tpl-1', title: 'Standard Civil Litigation', category: 'Litigation', complexity: 'High', duration: '18 Months', tags: ['FRCP', 'Federal'], auditReady: true, stages: ['Intake', 'Discovery', 'Trial'] },
  { id: 'tpl-2', title: 'Fast-Track Arbitration', category: 'ADR', complexity: 'Medium', duration: '6 Months', tags: ['JAMS', 'AAA'], auditReady: true, stages: ['Submission', 'Hearing', 'Award'] },
  { id: 'tpl-3', title: 'M&A Due Diligence', category: 'Corporate', complexity: 'High', duration: '90 Days', tags: ['M&A', 'VDR'], auditReady: true, stages: ['Target ID', 'Review', 'Closing'] },
];

export const MasterWorkflow: React.FC<{ onSelectCase: (id: string) => void }> = ({ onSelectCase }) => {
  const [activeTab, setActiveTab] = useState('cases');
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'builder'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'case' | 'process'>('case');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplateData | null>(null);
  
  const { tokens, density, setDensity } = useTheme();
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tabId: string) => {
    startTransition(() => setActiveTab(tabId));
  };

  const handleManageWorkflow = (id: string) => {
    startTransition(() => {
        setSelectedId(id);
        setSelectedType('case');
        setViewMode('detail');
    });
  };

  const handleTemplateClick = (tpl: WorkflowTemplateData) => {
    startTransition(() => {
        setSelectedTemplate(tpl);
        setViewMode('builder');
    });
  };

  const handleBack = () => {
    startTransition(() => {
        setViewMode('list');
        setSelectedId(null);
        setSelectedTemplate(null);
    });
  };

  const sparkData = [{v:10},{v:25},{v:15},{v:30},{v:20},{v:45},{v:40}];

  if (viewMode === 'detail' && selectedId) {
    return selectedType === 'case' 
      ? <WorkflowEngineDetail id={selectedId} type="case" onBack={handleBack} />
      : <FirmProcessDetail processId={selectedId} onBack={handleBack} />;
  }

  if (viewMode === 'builder') {
    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full border border-slate-200">
                        <ArrowLeft size={16}/>
                    </button>
                    <h2 className="font-bold text-slate-900 tracking-tight">Template Architect: {selectedTemplate?.title || 'New Protocol'}</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleBack}>Cancel</Button>
                    <Button variant="primary">Save Protocol</Button>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <WorkflowTemplateBuilder initialTemplate={selectedTemplate} />
            </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in relative" style={{ gap: tokens.spacing[density].gutter }}>
      <div className="absolute top-0 right-0 z-50">
        <span className="bg-slate-900 text-blue-400 font-mono text-[10px] font-black px-2 py-1 rounded border border-slate-700 shadow-xl opacity-0 hover:opacity-100 transition-opacity">
          WF-WAR-01
        </span>
      </div>

      <PageHeader 
        title="Workflows & Process" 
        subtitle="Global orchestration of litigation lifecycles and firm business logic."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                {(['compact', 'normal', 'comfortable'] as ThemeDensity[]).map((d) => (
                    <button
                        key={d}
                        onClick={() => setDensity(d)}
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded transition-all ${density === d ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {d.charAt(0)}
                    </button>
                ))}
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setViewMode('builder')}>New Protocol</Button>
            <Button variant="outline" icon={RefreshCw}>Engine Sync</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md h-32">
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow Velocity</span>
                <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-100"><Zap size={14} className="text-amber-500"/></div>
            </div>
            <div>
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">14.2</span>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">PM-21</span>
                </div>
                <div className="h-8 w-full mt-2 -mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData}>
                            <Area type="monotone" dataKey="v" stroke="#f59e0b" fill="#fef3c7" fillOpacity={0.5} strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <MetricCard 
            label="Active Instances" 
            value="28" 
            icon={Activity} 
            trend="On Track" 
            trendUp={true} 
            className="border-l-4 border-l-blue-600 shadow-sm transition-all hover:shadow-md"
        />
        <MetricCard 
            label="SLA Breaches" 
            value="2" 
            icon={AlertTriangle} 
            trend="Critical" 
            trendUp={false} 
            className="border-l-4 border-l-red-600 shadow-sm transition-all hover:shadow-md"
        />
        <MetricCard 
            label="Efficiency Gain" 
            value="+22%" 
            icon={TrendingUp} 
            trend="AI Optimized" 
            trendUp={true} 
            className="border-l-4 border-l-emerald-600 shadow-sm transition-all hover:shadow-md"
        />
      </div>

      <TabNavigation 
        tabs={[
            { id: 'cases', label: 'Matter Pipelines', icon: Briefcase },
            { id: 'firm', label: 'Firm Operations', icon: Layers },
            { id: 'templates', label: 'Protocol Library', icon: LayoutTemplate },
            { id: 'analytics', label: 'Engine Health', icon: BarChart2 }
        ]} 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        className="bg-white rounded-xl border border-slate-200 p-1 shadow-sm"
      />

      <div className={`flex-1 min-h-0 overflow-y-auto transition-all duration-300 ${isPending ? 'opacity-50 grayscale' : 'opacity-100'}`}>
        {activeTab === 'cases' && (
            <CaseWorkflowList 
                cases={MOCK_CASES} 
                onSelectCase={onSelectCase}
                onManageWorkflow={handleManageWorkflow}
                getCaseProgress={(s) => s === 'Discovery' ? 45 : s === 'Trial' ? 85 : 100} 
                getNextTask={(s) => s === 'Trial' ? 'Prepare Witness List' : 'Review Production Set'} 
            />
        )}

        {activeTab === 'firm' && (
            <FirmProcessList 
                processes={BUSINESS_PROCESSES} 
                onSelectProcess={(id) => { setSelectedType('process'); handleManageWorkflow(id); }}
            />
        )}

        {activeTab === 'templates' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                            <input className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-64 bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm" placeholder="Filter protocols..."/>
                        </div>
                        <Button variant="secondary" icon={Filter} size="sm">Filter</Button>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest bg-white border px-2 py-1 rounded shadow-sm">WF-GAL-01</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {WORKFLOW_TEMPLATES.map(tpl => (
                        <TemplatePreview 
                            key={tpl.id} 
                            data={tpl} 
                            onClick={() => handleTemplateClick(tpl)}
                        />
                    ))}
                    <button 
                        onClick={() => setViewMode('builder')}
                        className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-400 hover:bg-blue-50/50 transition-all group shadow-inner min-h-[220px]"
                    >
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all"><Plus size={24}/></div>
                        <span className="font-black text-xs uppercase tracking-[0.2em]">Create Custom Protocol</span>
                    </button>
                </div>
            </div>
        )}

        {activeTab === 'analytics' && (
            <EnhancedWorkflowPanel />
        )}
      </div>
    </div>
  );
};
