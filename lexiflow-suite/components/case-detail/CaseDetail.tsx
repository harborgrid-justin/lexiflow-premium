
import React, { useMemo, useState, useTransition, useCallback } from 'react';
import { Case } from '../../types.ts';
import { 
  ArrowLeft, LayoutDashboard, GitBranch, FolderOpen, 
  Gavel, Search, Shield, Users, MessageSquare, BookOpen, Archive,
  PanelRightClose, PanelRightOpen, Plus, Target, BarChart3, Scale, Maximize2, Briefcase, ChevronRight, DollarSign
} from 'lucide-react';
import { CaseOverview } from './CaseOverview.tsx';
import { CaseDocuments } from './CaseDocuments.tsx';
import { CaseWorkflow } from './CaseWorkflow.tsx';
import { CaseBilling } from './CaseBilling.tsx';
import { CaseTimeline } from './CaseTimeline.tsx';
import { CaseEvidence } from './CaseEvidence.tsx';
import { CaseDiscovery } from './CaseDiscovery.tsx';
import { CaseMessages } from './CaseMessages.tsx';
import { CaseParties } from './CaseParties.tsx';
import { CaseMotions } from './CaseMotions.tsx';
import { CaseStrategy } from './CaseStrategy.tsx';
import { CasePlanning } from './CasePlanning.tsx';
import { CaseProjects } from './CaseProjects.tsx';
import { CaseCollaboration } from './CaseCollaboration.tsx';
import { CaseClosure } from './CaseClosure.tsx';
import { useCaseDetail } from '../../hooks/useCaseDetail.ts';
import { MOCK_EVIDENCE } from '../../data/mockEvidence.ts';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';
import { useTheme } from '../providers/ThemeProvider.tsx';

interface CaseDetailProps {
  caseData: Case;
  onBack: () => void;
}

const TAB_CONFIG = [
  { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'Workflow', label: 'Workflow', icon: GitBranch },
  { id: 'Documents', label: 'Documents', icon: FolderOpen },
  { id: 'Motions', label: 'Motions', icon: Gavel },
  { id: 'Discovery', label: 'Discovery', icon: Search },
  { id: 'Evidence', label: 'Evidence', icon: Shield },
  { id: 'Billing', label: 'Financials', icon: DollarSign },
  { id: 'Strategy', label: 'Strategy', icon: BookOpen },
  { id: 'Parties', label: 'Parties', icon: Users },
  { id: 'Messages', label: 'Comms', icon: MessageSquare },
  { id: 'Closure', label: 'Dispose', icon: Archive },
];

export const CaseDetail: React.FC<CaseDetailProps> = ({ caseData, onBack }) => {
  const { density } = useTheme();
  const {
    activeTab,
    setActiveTab,
    documents,
    stages,
    parties,
    setParties,
    projects,
    addProject,
    addTaskToProject,
    updateProjectTaskStatus,
    billingEntries,
    setBillingEntries,
    generatingWorkflow,
    analyzingId,
    timelineEvents,
    handleAnalyze,
    handleGenerateWorkflow
  } = useCaseDetail(caseData);

  const [isPending, startTransition] = useTransition();
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const caseEvidence = useMemo(() => MOCK_EVIDENCE.filter(e => e.caseId === caseData.id), [caseData.id]);

  const handleTabChange = useCallback((tabId: string) => {
    startTransition(() => {
        setActiveTab(tabId);
    });
  }, [setActiveTab]);

  return (
    <div 
      className="flex flex-col h-screen w-full overflow-hidden transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)'
      }}
    >
      {/* 1. Header Section (Fixed) */}
      <header 
        className="shrink-0 z-30 shadow-sm relative transition-all duration-300 pt-6"
        style={{ 
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 0 // Tabs sit on bottom
        }}
      >
        <div className="flex items-center justify-between gap-6 px-6 pb-4">
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={onBack} 
              className="p-2 rounded-xl transition-all hover:opacity-80 active:scale-95"
              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="min-w-0">
              <nav className="flex items-center text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-textMuted)' }}>
                <span className="cursor-pointer hover:opacity-100 opacity-70 transition-opacity" onClick={onBack}>Matter Registry</span>
                <span className="mx-2 opacity-30">/</span>
                <span style={{ color: 'var(--color-primary)' }}>{caseData.id}</span>
              </nav>
              <h1 className="text-xl md:text-2xl font-black truncate tracking-tight flex items-center gap-3" style={{ fontFamily: 'var(--font-serif)' }}>
                {caseData.title}
                <Badge variant={caseData.status === 'Trial' ? 'warning' : 'info'} className="hidden sm:inline-flex shadow-sm">
                  {caseData.status}
                </Badge>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden xl:flex p-1 rounded-lg border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
               <button 
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  className={`p-2 rounded-md transition-all ${rightPanelOpen ? 'shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                  style={{ backgroundColor: rightPanelOpen ? 'var(--color-surface)' : 'transparent', color: 'var(--color-text)' }}
                  title="Toggle Intelligence"
                >
                  {rightPanelOpen ? <PanelRightClose size={16}/> : <PanelRightOpen size={16}/>}
               </button>
            </div>
            <Button variant="primary" icon={Plus} size="sm" className="hidden md:flex uppercase tracking-wider font-bold text-xs px-6 shadow-lg shadow-blue-500/20">Execute</Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 flex space-x-1 overflow-x-auto no-scrollbar">
            {TAB_CONFIG.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => handleTabChange(tab.id)} 
                    className="group flex items-center whitespace-nowrap px-4 py-3 border-b-2 text-[11px] font-bold uppercase tracking-wider transition-all relative top-[1px]"
                    style={{ 
                        borderColor: isActive ? 'var(--color-primary)' : 'transparent',
                        color: isActive ? 'var(--color-primary)' : 'var(--color-textMuted)',
                        backgroundColor: isActive ? 'var(--color-background)' : 'transparent',
                        borderTopLeftRadius: 'var(--radius-md)',
                        borderTopRightRadius: 'var(--radius-md)',
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" style={{ opacity: isActive ? 1 : 0.7 }} />
                    {tab.label}
                  </button>
                );
            })}
        </div>
      </header>

      {/* 2. Main Content Layout (Flex Row) */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Center: Workspace */}
        <main 
            className={`flex-1 overflow-y-auto min-w-0 transition-opacity duration-300 ${isPending ? 'opacity-60 grayscale' : 'opacity-100'}`}
            style={{ 
                backgroundColor: 'var(--color-surface)',
            }}
        >
            <div className="mx-auto h-full p-6 pt-4 pb-20" style={{ maxWidth: 'var(--spacing-container)' }}>
                {activeTab === 'Overview' && <CaseOverview caseData={{...caseData, parties}} onTimeEntryAdded={(e) => setBillingEntries([e, ...billingEntries])} />}
                {activeTab === 'Workflow' && <CaseWorkflow stages={stages} generatingWorkflow={generatingWorkflow} onGenerateWorkflow={handleGenerateWorkflow} />}
                {activeTab === 'Documents' && <CaseDocuments documents={documents} analyzingId={analyzingId} onAnalyze={handleAnalyze} onDocumentCreated={(d) => { /* logic */ }} />}
                {activeTab === 'Motions' && <CaseMotions caseId={caseData.id} caseTitle={caseData.title} documents={documents} />}
                {activeTab === 'Parties' && <CaseParties parties={parties} onUpdate={setParties} />}
                {activeTab === 'Evidence' && <CaseEvidence caseId={caseData.id} />}
                {activeTab === 'Discovery' && <CaseDiscovery caseId={caseData.id} />}
                {activeTab === 'Messages' && <CaseMessages caseData={caseData} />}
                {activeTab === 'Strategy' && <CaseStrategy citations={caseData.citations} arguments={caseData.arguments} defenses={caseData.defenses} evidence={caseEvidence} />}
                {activeTab === 'Planning' && <CasePlanning caseData={caseData} />}
                {activeTab === 'Projects' && <CaseProjects projects={projects} onAddProject={addProject} onAddTask={addTaskToProject} onUpdateTaskStatus={updateProjectTaskStatus} />}
                {activeTab === 'Billing' && <CaseBilling billingModel={caseData.billingModel || 'Hourly'} value={caseData.value} entries={billingEntries} />}
                {activeTab === 'Closure' && <CaseClosure caseData={caseData} onComplete={onBack} />}
            </div>
        </main>

        {/* Right: Intelligence Panel */}
        {rightPanelOpen && (
            <aside 
                className="w-[420px] overflow-y-auto shrink-0 hidden 2xl:block shadow-[inset_10px_0_15px_-3px_rgba(0,0,0,0.01)]"
                style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderLeft: '1px solid var(--color-border)',
                }}
            >
                <div className="space-y-8 p-6">
                    
                    {/* Matter Intelligence */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--color-textMuted)' }}>Litigation Intel</h3>
                            <button className="transition-colors p-1.5 rounded-lg hover:bg-slate-100" style={{ color: 'var(--color-primary)' }}>
                                <Maximize2 size={14}/>
                            </button>
                        </div>
                        
                        <div 
                            className="p-8 rounded-[2rem] relative overflow-hidden group transition-all hover:shadow-lg"
                            style={{ 
                                backgroundColor: 'var(--color-background)', 
                                border: '1px solid var(--color-border)' 
                            }}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Briefcase size={120}/></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-textMuted)' }}>Win Probability</span>
                                    <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-primaryLight)', color: 'var(--color-primary)' }}>
                                        <Target size={20}/>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black tracking-tighter tabular-nums" style={{ color: 'var(--color-text)' }}>72%</span>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--color-success)', color: '#ffffff' }}>+4.2%</span>
                                </div>
                                <div className="h-3 w-full rounded-full mt-6 overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                                    <div className="h-full w-[72%] rounded-full relative" style={{ backgroundColor: 'var(--color-primary)' }}>
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Judicial Profile */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg text-white shadow-lg" style={{ backgroundColor: 'var(--color-secondary)' }}><Scale size={16}/></div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--color-text)' }}>Judicial Profile</h3>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                            <table className="w-full text-xs">
                                <tbody className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                                    <tr>
                                        <td className="p-4 font-bold uppercase w-[40%]" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}>Presiding</td>
                                        <td className="p-4 font-bold" style={{ color: 'var(--color-text)' }}>{caseData.judge || 'Bench Pending'}</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                                        <td className="p-4 font-bold uppercase" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-textMuted)' }}>Grant Rate</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold" style={{ color: 'var(--color-primary)' }}>42%</span>
                                                <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                                                    <div className="h-full w-[42%]" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Financial Monitor */}
                    <div className="rounded-[2rem] p-8 shadow-xl relative overflow-hidden group text-white" style={{ backgroundColor: 'var(--color-secondary)' }}>
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700"><BarChart3 size={140}/></div>
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">Matter Health</h4>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-bold tabular-nums tracking-tight">$124.5k</span>
                                <span className="text-xs font-medium opacity-60">/ $150k Cap</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-8">
                                <div className="h-full w-[83%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                            </div>
                            <button className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-secondary)' }}>
                                Audit Finances
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        )}
      </div>
    </div>
  );
};
