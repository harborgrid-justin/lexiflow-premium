
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Case, TimelineEvent, EvidenceItem } from '../../types';
import { 
  LayoutDashboard, Users, Clock, Lightbulb, Calendar, 
  Briefcase, CheckSquare, MessageSquare, Gavel, Search, 
  Fingerprint, FileText, Folder, PenTool, FileSearch, 
  DollarSign, Plus, MoreVertical, X, Layers, Target, ShieldAlert
} from 'lucide-react';
import { CaseOverview } from './CaseOverview';
import { CaseDocuments } from './CaseDocuments';
import { CaseWorkflow } from './CaseWorkflow';
import { CaseDrafting } from './CaseDrafting';
import { CaseBilling } from './CaseBilling';
import { CaseContractReview } from './CaseContractReview';
import { CaseTimeline } from './CaseTimeline';
import { CaseEvidence } from './CaseEvidence';
import { CaseDiscovery } from './CaseDiscovery';
import { CaseMessages } from './CaseMessages';
import { CaseParties } from './CaseParties';
import { CaseMotions } from './CaseMotions';
import { CaseStrategy } from './CaseStrategy';
import { CaseArgumentManager } from './CaseArgumentManager';
import { CaseRiskManager } from './CaseRiskManager';
import { CasePlanning } from './CasePlanning';
import { CaseProjects } from './CaseProjects';
import { CaseCollaboration } from './CaseCollaboration';
import { useCaseDetail } from '../../hooks/useCaseDetail';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { CaseDetailHeader } from './CaseDetailHeader';
import { DataService } from '../../services/dataService';
import { CASE_DETAIL_TABS } from './CaseDetailConfig';

interface CaseDetailProps {
  caseData: Case;
  onBack: () => void;
  onSelectCase?: (c: Case) => void;
  initialTab?: string;
}

const PARENT_TABS = [
  {
    id: 'overview', label: 'Overview', icon: LayoutDashboard,
    subTabs: [
      { id: 'Overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'Nexus', label: 'Nexus Graph', icon: Layers },
      { id: 'Parties', label: 'Parties', icon: Users },
      { id: 'Timeline', label: 'Timeline', icon: Clock },
    ]
  },
  {
    id: 'strategy', label: 'Strategy', icon: Lightbulb,
    subTabs: [
      { id: 'Arguments', label: 'Argument Builder', icon: Target },
      { id: 'Risk', label: 'Risk Assessment', icon: ShieldAlert },
      { id: 'Strategy', label: 'Authority & Defenses', icon: Layers },
      { id: 'Planning', label: 'Case Plan', icon: Calendar },
    ]
  },
  {
    id: 'execution', label: 'Execution', icon: Briefcase,
    subTabs: [
      { id: 'Projects', label: 'Projects', icon: Briefcase },
      { id: 'Workflow', label: 'Tasks', icon: CheckSquare },
      { id: 'Collaboration', label: 'Collaboration', icon: MessageSquare },
    ]
  },
  {
    id: 'litigation', label: 'Litigation', icon: Gavel,
    subTabs: [
      { id: 'Motions', label: 'Motions', icon: Gavel },
      { id: 'Discovery', label: 'Discovery', icon: Search },
      { id: 'Evidence', label: 'Evidence', icon: Fingerprint },
    ]
  },
  {
    id: 'docs', label: 'Documents', icon: FileText,
    subTabs: [
      { id: 'Documents', label: 'Files', icon: Folder },
      { id: 'Drafting', label: 'Drafting', icon: PenTool },
      { id: 'Contract Review', label: 'Review', icon: FileSearch },
    ]
  },
  {
    id: 'finance', label: 'Finance', icon: DollarSign,
    subTabs: [
      { id: 'Billing', label: 'Billing', icon: DollarSign },
    ]
  }
];

export const CaseDetail: React.FC<CaseDetailProps> = ({ caseData, onBack, onSelectCase, initialTab }) => {
  const { theme } = useTheme();
  const {
    activeTab,
    setActiveTab,
    documents,
    setDocuments,
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
    draftPrompt,
    setDraftPrompt,
    draftResult,
    isDrafting,
    timelineEvents,
    handleAnalyze,
    handleDraft,
    handleGenerateWorkflow
  } = useCaseDetail(caseData);

  const [showMobileTimeline, setShowMobileTimeline] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [caseEvidence, setCaseEvidence] = useState<EvidenceItem[]>([]);

  useEffect(() => {
      const loadEvidence = async () => {
          const data = await DataService.evidence.getByCaseId(caseData.id);
          setCaseEvidence(data);
      };
      loadEvidence();
  }, [caseData.id]);

  // Handle Holographic Routing / Deep Linking
  useEffect(() => {
      if (initialTab) {
          const lower = initialTab.toLowerCase();
          const map: Record<string, string> = {
              'docket': 'Timeline',
              'calendar': 'Timeline',
              'tasks': 'Workflow',
              'workflow': 'Workflow',
              'intake': 'Overview',
              'conflicts': 'Risk',
              'resources': 'Overview',
              'trust': 'Billing',
              'experts': 'Strategy',
              'reporters': 'Discovery',
              'closing': 'Overview',
              'archived': 'Overview',
              'evidence': 'Evidence',
              'witnesses': 'Parties',
              'parties': 'Parties',
              'binder': 'Documents',
              'documents': 'Documents',
              'discovery': 'Discovery',
              'requests': 'Discovery',
              'depositions': 'Discovery',
              'interviews': 'Discovery',
              'motions': 'Motions',
              'filings': 'Motions',
              'orders': 'Motions',
              'billing': 'Billing',
              'invoices': 'Billing',
              'strategy': 'Strategy',
              'arguments': 'Arguments',
              'risk': 'Risk',
              'planning': 'Planning',
              'projects': 'Projects',
              'collaboration': 'Collaboration',
              'drafting': 'Drafting',
              'review': 'Contract Review',
              'nexus': 'Nexus'
          };
          
          if (map[lower]) {
              setActiveTab(map[lower]);
          } else {
              // Fallback: check if initialTab matches a tab ID directly (case insensitive)
              const directMatch = CASE_DETAIL_TABS.flatMap(g => g.subTabs).find(t => t.id.toLowerCase() === lower);
              if (directMatch) setActiveTab(directMatch.id);
          }
      }
  }, [initialTab, setActiveTab]);

  // Derived state for parent tab
  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id);
    }
  }, [setActiveTab]);

  const handleTimelineClick = (event: TimelineEvent) => {
      setShowMobileTimeline(false);
      switch(event.type) {
          case 'motion':
          case 'hearing':
              setActiveTab('Motions');
              break;
          case 'document':
              setActiveTab('Documents');
              break;
          case 'task':
              setActiveTab('Workflow');
              break;
          case 'billing':
              setActiveTab('Billing');
              break;
          case 'milestone':
          case 'planning':
              setActiveTab('Planning');
              break;
      }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <CaseOverview caseData={{...caseData, parties}} onTimeEntryAdded={(e) => setBillingEntries([e, ...billingEntries])} onNavigateToCase={onSelectCase} />;
      case 'Parties': return <CaseParties parties={parties} onUpdate={setParties} />;
      case 'Timeline': return <CaseTimeline events={timelineEvents} onEventClick={handleTimelineClick} />;
      case 'Arguments': return <CaseArgumentManager caseData={caseData} evidence={caseEvidence} />;
      case 'Risk': return <CaseRiskManager caseData={caseData} />;
      case 'Strategy': return <CaseStrategy citations={caseData.citations} arguments={caseData.arguments} defenses={caseData.defenses} evidence={caseEvidence} />;
      case 'Planning': return <CasePlanning caseData={caseData} />;
      case 'Projects': return <CaseProjects projects={projects} onAddProject={addProject} onAddTask={addTaskToProject} onUpdateTaskStatus={updateProjectTaskStatus} />;
      case 'Workflow': return <CaseWorkflow stages={stages} generatingWorkflow={generatingWorkflow} onGenerateWorkflow={handleGenerateWorkflow} />;
      case 'Collaboration': return <CaseCollaboration caseId={caseData.id} />;
      case 'Motions': return <CaseMotions caseId={caseData.id} caseTitle={caseData.title} documents={documents} />;
      case 'Discovery': return <CaseDiscovery caseId={caseData.id} />;
      case 'Evidence': return <CaseEvidence caseId={caseData.id} />;
      case 'Documents': return <CaseDocuments documents={documents} analyzingId={analyzingId} onAnalyze={handleAnalyze} onDocumentCreated={(d) => { setDocuments([...documents, d]); setActiveTab('Documents'); }} />;
      case 'Drafting': return <CaseDrafting caseTitle={caseData.title} draftPrompt={draftPrompt} setDraftPrompt={setDraftPrompt} draftResult={draftResult} isDrafting={isDrafting} onDraft={handleDraft} />;
      case 'Contract Review': return <CaseContractReview />;
      case 'Billing': return <CaseBilling billingModel={caseData.billingModel || 'Hourly'} value={caseData.value} entries={billingEntries} />;
      default: return <CaseOverview caseData={{...caseData, parties}} onTimeEntryAdded={(e) => setBillingEntries([e, ...billingEntries])} onNavigateToCase={onSelectCase} />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col relative", theme.background)}>
      {/* Mobile Timeline Overlay */}
      {showMobileTimeline && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileTimeline(false)}>
            <div className={cn("absolute right-0 top-0 bottom-0 w-80 shadow-2xl p-4 animate-in slide-in-from-right h-full flex flex-col", theme.surface)} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className={cn("font-bold", theme.text.primary)}>Case Timeline</h3>
                    <button onClick={() => setShowMobileTimeline(false)} className={cn("p-2 rounded-full transition-colors", theme.text.secondary, `hover:${theme.surfaceHighlight}`)}><X className="h-5 w-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <CaseTimeline events={timelineEvents} onEventClick={handleTimelineClick} />
                </div>
            </div>
        </div>
      )}

      {/* Mobile Quick Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden flex items-end justify-center pb-6" onClick={() => setShowMobileMenu(false)}>
            <div className={cn("rounded-xl shadow-2xl w-[90%] max-w-sm p-4 animate-in slide-in-from-bottom duration-200 space-y-2", theme.surface)} onClick={e => e.stopPropagation()}>
                <h4 className={cn("text-sm font-bold uppercase tracking-wide mb-3 px-2", theme.text.secondary)}>Quick Actions</h4>
                <button onClick={() => { setActiveTab('Documents'); setShowMobileMenu(false); }} className={cn("w-full flex items-center p-3 rounded-lg border font-medium", theme.surface, theme.border.default, theme.text.primary, `hover:${theme.surfaceHighlight}`)}>
                    <FileText className="h-5 w-5 mr-3 text-blue-600"/> Upload Document
                </button>
                <button onClick={() => { setActiveTab('Billing'); setShowMobileMenu(false); }} className={cn("w-full flex items-center p-3 rounded-lg border font-medium", theme.surface, theme.border.default, theme.text.primary, `hover:${theme.surfaceHighlight}`)}>
                    <Clock className="h-5 w-5 mr-3 text-green-600"/> Log Billable Time
                </button>
                <button onClick={() => { setActiveTab('Workflow'); setShowMobileMenu(false); }} className={cn("w-full flex items-center p-3 rounded-lg border font-medium", theme.surface, theme.border.default, theme.text.primary, `hover:${theme.surfaceHighlight}`)}>
                    <Plus className="h-5 w-5 mr-3 text-purple-600"/> Add Task
                </button>
                <button onClick={() => setShowMobileMenu(false)} className={cn("w-full p-3 rounded-lg font-bold mt-2", theme.surfaceHighlight, theme.text.secondary)}>
                    Cancel
                </button>
            </div>
        </div>
      )}

      {/* Top Header & Navigation */}
      <CaseDetailHeader 
        caseData={caseData} 
        onBack={onBack} 
        onShowTimeline={() => setShowMobileTimeline(true)}
      />

      <div className="px-6 pt-2 shrink-0">
        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                        activeParentTab.id === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surfaceHighlight, theme.border.default)}>
            {activeParentTab.subTabs.map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                    className={cn(
                        "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                        activeTab === tab.id 
                            ? cn(theme.surface, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                            : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface}`)
                    )}
                >
                    <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Left Timeline Widget (Desktop Only) - Only show on Overview */}
            {activeTab === 'Overview' && (
              <div className={cn("hidden lg:block lg:col-span-3 h-full overflow-hidden border-r", theme.border.default)}>
                  <CaseTimeline events={timelineEvents} onEventClick={handleTimelineClick} />
              </div>
            )}

            {/* Main Content Area */}
            <div className={cn("h-full overflow-y-auto pr-0 md:pr-2 pb-24 md:pb-6 scroll-smooth", activeTab === 'Overview' ? 'lg:col-span-9' : 'lg:col-span-12 px-6')}>
                {renderContent()}
            </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className={cn("md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 pl-4 rounded-full shadow-2xl z-40 border backdrop-blur-md", theme.surface, theme.border.default)}>
          <span className={cn("text-xs font-bold mr-2 uppercase tracking-wider", theme.text.primary)}>{activeTab}</span>
          <div className={cn("h-6 w-px", theme.border.default)}></div>
          <button 
            onClick={() => setShowMobileMenu(true)} 
            className={cn("p-2 rounded-full transition-colors shadow-lg", theme.primary.DEFAULT, theme.text.inverse)}
          >
            <Plus className="h-5 w-5"/>
          </button>
          <button 
            onClick={() => setShowMobileMenu(true)}
            className={cn("p-2 rounded-full", theme.text.secondary, `hover:${theme.text.primary}`)}
          >
            <MoreVertical className="h-5 w-5"/>
          </button>
      </div>
    </div>
  );
};
