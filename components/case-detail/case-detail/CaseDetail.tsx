
import React, { useMemo, useState, useCallback, useEffect, useTransition } from 'react';
import { Case, TimelineEvent, EvidenceItem, NexusNodeData } from '../../../types';
import { CaseDetailHeader } from '../CaseDetailHeader';
import { CaseDetailContent } from '../CaseDetailContent';
import { useCaseDetail } from '../../../hooks/useCaseDetail';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { DataService } from '../../../services/dataService';
import { CASE_DETAIL_TABS } from '../CaseDetailConfig';
import { Plus, MoreVertical } from 'lucide-react';
import { CaseDetailMobileMenu } from '../CaseDetailMobileMenu';
import { HolographicRouting } from '../../../services/holographicRouting';
import { NexusInspector } from '../../visual/NexusInspector';
import { ErrorBoundary } from '../../common/ErrorBoundary';
import { CaseDetailNavigation } from '../layout/CaseDetailNavigation';
import { MobileTimelineOverlay } from '../MobileTimelineOverlay';

interface CaseDetailProps {
  caseData: Case;
  onBack: () => void;
  onSelectCase?: (c: Case) => void;
  initialTab?: string;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ caseData, onBack, onSelectCase, initialTab }) => {
  const { theme } = useTheme();
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
        setNexusInspectorItem(null);
    }
  }, [hookData]);
  
  const handleSubTabChange = (tabId: string) => {
      startTransition(() => {
        hookData.setActiveTab(tabId);
      });
      setNexusInspectorItem(null);
  };

  const handleTimelineClick = (event: TimelineEvent) => {
      setShowMobileTimeline(false);
      const tabMap: Record<string, string> = {
        'motion': 'Motions', 'hearing': 'Motions', 'document': 'Documents', 'task': 'Workflow', 
        'billing': 'Billing', 'milestone': 'Planning', 'planning': 'Planning'
      };
      if (tabMap[event.type]) {
          startTransition(() => {
            hookData.setActiveTab(tabMap[event.type]);
          });
      }
  };

  return (
    <div className={cn("h-full flex flex-col relative", theme.background)}>
      <MobileTimelineOverlay 
          isOpen={showMobileTimeline} 
          onClose={() => setShowMobileTimeline(false)} 
          events={hookData.timelineEvents} 
          onEventClick={handleTimelineClick} 
      />
      
      <CaseDetailMobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onNavigate={(tab) => {
            startTransition(() => { hookData.setActiveTab(tab); });
            setShowMobileMenu(false);
        }}
      />

      <CaseDetailHeader 
        id={caseData.id} title={caseData.title} status={caseData.status} client={caseData.client} 
        clientId={caseData.clientId as any} jurisdiction={caseData.jurisdiction}
        onBack={onBack} onShowTimeline={() => setShowMobileTimeline(true)}
      />

      <CaseDetailNavigation 
        activeTab={hookData.activeTab}
        setActiveTab={handleSubTabChange}
        onParentTabChange={handleParentTabChange}
      />

      <div className={cn("flex-1 overflow-hidden min-h-0 flex", isPending && "opacity-60 transition-opacity")}>
          <div className={cn("flex-1 overflow-hidden min-h-0 transition-all duration-300", nexusInspectorItem ? 'pr-4' : 'pr-0')}>
                <div className={cn("h-full overflow-y-auto scroll-smooth", 'px-6')}>
                  <ErrorBoundary>
                    <CaseDetailContent 
                        {...hookData} caseData={caseData} evidence={caseEvidence}
                        onTimeEntryAdded={(e) => hookData.setBillingEntries(prev => prev ? [e, ...prev] : [e])}
                        onNavigateToCase={onSelectCase} onUpdateParties={hookData.setParties} onTimelineClick={handleTimelineClick}
                        onAddProject={hookData.addProject} onAddTask={hookData.addTaskToProject} onUpdateTask={hookData.updateProjectTaskStatus}
                        onGenerateWorkflow={hookData.handleGenerateWorkflow} onAnalyzeDoc={hookData.handleAnalyze}
                        onDocumentCreated={(d) => { hookData.setDocuments(prev => prev ? [...prev, d] : [d]); hookData.setActiveTab('Documents'); }}
                        onDraft={hookData.handleDraft} onNodeClick={setNexusInspectorItem}
                    />
                  </ErrorBoundary>
                </div>
          </div>

          <div className={cn("transition-all duration-300 overflow-hidden", nexusInspectorItem ? 'w-96' : 'w-0')}>
              <NexusInspector item={nexusInspectorItem} onClose={() => setNexusInspectorItem(null)} />
          </div>
      </div>

      <div className={cn("md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 pl-4 rounded-full shadow-2xl z-40 border backdrop-blur-md pb-safe", theme.surface.default, theme.border.default)}>
          <span className={cn("text-xs font-bold mr-2 uppercase tracking-wider", theme.text.primary)}>{hookData.activeTab}</span>
          <div className={cn("h-6 w-px", theme.border.default)}></div>
          <button onClick={() => setShowMobileMenu(true)} className={cn("p-2 rounded-full transition-colors shadow-lg", theme.primary.DEFAULT, theme.text.inverse)}><Plus className="h-5 w-5"/></button>
          <button onClick={() => setShowMobileMenu(true)} className={cn("p-2 rounded-full", theme.text.secondary, `hover:${theme.text.primary}`)}><MoreVertical className="h-5 w-5"/></button>
      </div>
    </div>
  );
};
