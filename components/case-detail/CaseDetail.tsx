
import React, { useMemo, useState, useCallback, useEffect, useTransition } from 'react';
import { Case, TimelineEvent, EvidenceItem, NexusNodeData } from '../types';
import { CaseDetailHeader } from './CaseDetailHeader';
import { CaseDetailContent } from './CaseDetailContent';
import { CaseTimeline } from './CaseTimeline';
import { useCaseDetail } from '../hooks/useCaseDetail';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { DataService } from '../services/dataService';
import { CASE_DETAIL_TABS } from './CaseDetailConfig';
import { X, Plus, MoreVertical } from 'lucide-react';
import { CaseDetailMobileMenu } from './CaseDetailMobileMenu';
import { HolographicRouting } from '../services/holographicRouting';
import { NexusInspector } from '../visual/NexusInspector';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { CaseDetailNavigation } from './layout/CaseDetailNavigation';

interface CaseDetailProps {
  caseData: Case;
  onBack: () => void;
  onSelectCase?: (c: Case) => void;
  initialTab?: string;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ caseData, onBack, onSelectCase, initialTab }) => {
  const { theme } = useTheme();
  // Initialize hook with the deep-linked tab to prevent flashes
  const hookData = useCaseDetail(caseData, initialTab);
  
  const [isPending, startTransition] = useTransition();
  const [showMobileTimeline, setShowMobileTimeline] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [caseEvidence, setCaseEvidence] = useState<EvidenceItem[]>([]);
  const [nexusInspectorItem, setNexusInspectorItem] = useState<NexusNodeData | null>(null);

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
          const resolvedTab = HolographicRouting.resolveTab('cases', initialTab);
          if (resolvedTab) {
              startTransition(() => {
                hookData.setActiveTab(resolvedTab);
              });
          }
      }
  }, [initialTab, hookData.setActiveTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = CASE_DETAIL_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
        startTransition(() => {
          hookData.setActiveTab(parent.subTabs[0].id);
        });
        setNexusInspectorItem(null); // Close inspector on tab change
    }
  }, [hookData]);
  
  const handleSubTabChange = (tabId: string) => {
      startTransition(() => {
        hookData.setActiveTab(tabId);
      });
      setNexusInspectorItem(null); // Close inspector on sub-tab change
  };

  const handleTimelineClick = (event: TimelineEvent) => {
      setShowMobileTimeline(false);
      const tabMap: Record<string, string> = {
        'motion': 'Motions',
        'hearing': 'Motions',
        'document': 'Documents',
        'task': 'Workflow',
        'billing': 'Billing',
        'milestone': 'Planning',
        'planning': 'Planning'
      };
      
      if (tabMap[event.type]) {
          startTransition(() => {
            hookData.setActiveTab(tabMap[event.type]);
          });
      }
  };

  return (
    <div className={cn("h-full flex flex-col relative", theme.background)}>
      {/* Mobile Timeline Overlay */}
      {showMobileTimeline && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileTimeline(false)}>
            <div className={cn("absolute right-0 top-0 bottom-0 w-80 shadow-2xl p-4 animate-in slide-in-from-right h-full flex flex-col", theme.surface.default)} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className={cn("font-bold", theme.text.primary)}>Case Timeline</h3>
                    <button onClick={() => setShowMobileTimeline(false)} className={cn("p-2 rounded-full transition-colors", theme.text.secondary, `hover:${theme.surface.highlight}`)}><X className="h-5 w-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <CaseTimeline events={hookData.timelineEvents} onEventClick={handleTimelineClick} />
                </div>
            </div>
        </div>
      )}
      
      <CaseDetailMobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onNavigate={(tab) => {
            startTransition(() => {
                hookData.setActiveTab(tab);
            });
            setShowMobileMenu(false);
        }}
      />

      {/* Top Header & Navigation */}
      <CaseDetailHeader 
        id={caseData.id}
        title={caseData.title}
        status={caseData.status}
        client={caseData.client}
        clientId={caseData.clientId as any}
        jurisdiction={caseData.jurisdiction}
        onBack={onBack} 
        onShowTimeline={() => setShowMobileTimeline(true)}
      />

      <CaseDetailNavigation 
        activeTab={hookData.activeTab}
        setActiveTab={handleSubTabChange}
        onParentTabChange={handleParentTabChange}
      />

      {/* Main Content */}
      <div className={cn("flex-1 overflow-hidden min-h-0 flex", isPending && "opacity-60 transition-opacity")}>
          <div className={cn("flex-1 overflow-hidden min-h-0 transition-all duration-300", nexusInspectorItem ? 'pr-4' : 'pr-0')}>
                <div className={cn("h-full overflow-y-auto scroll-smooth", 'px-6')}>
                  <ErrorBoundary>
                    <CaseDetailContent 
                        {...hookData} 
                        caseData={caseData}
                        evidence={caseEvidence}
                        onTimeEntryAdded={(e) => hookData.setBillingEntries(prev => prev ? [e, ...prev] : [e])}
                        onNavigateToCase={onSelectCase}
                        onUpdateParties={hookData.setParties}
                        onTimelineClick={handleTimelineClick}
                        onAddProject={hookData.addProject}
                        onAddTask={hookData.addTaskToProject}
                        onUpdateTask={hookData.updateProjectTaskStatus}
                        onGenerateWorkflow={hookData.handleGenerateWorkflow}
                        onAnalyzeDoc={hookData.handleAnalyze}
                        onDocumentCreated={(d) => { hookData.setDocuments(prev => prev ? [...prev, d] : [d]); hookData.setActiveTab('Documents'); }}
                        onDraft={hookData.handleDraft}
                        onNodeClick={setNexusInspectorItem}
                    />
                  </ErrorBoundary>
                </div>
          </div>

          {/* Nexus Inspector Panel */}
          <div className={cn("transition-all duration-300 overflow-hidden", nexusInspectorItem ? 'w-96' : 'w-0')}>
              <NexusInspector item={nexusInspectorItem} onClose={() => setNexusInspectorItem(null)} />
          </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className={cn("md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 pl-4 rounded-full shadow-2xl z-40 border backdrop-blur-md pb-safe", theme.surface.default, theme.border.default)}>
          <span className={cn("text-xs font-bold mr-2 uppercase tracking-wider", theme.text.primary)}>{hookData.activeTab}</span>
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
