/**
 * CaseDetail.tsx
 * 
 * Main case detail view component - lazy-loaded for code splitting.
 * Production-grade tabbed interface with full navigation and data management.
 * 
 * @module components/case-detail/CaseDetail
 * @category Case Management - Core
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useCallback, useMemo } from 'react';
import { Plus } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES - COMPONENTS
// ============================================================================
import { CaseDetailHeader } from '@/features/cases/components/detail/CaseDetailHeader';
import { CaseDetailNavigation } from '@/features/cases/components/detail/layout/CaseDetailNavigation';
import { CaseDetailMobileMenu } from '@/features/cases/components/detail/CaseDetailMobileMenu';
import { MobileTimelineOverlay } from '@/features/cases/components/detail/MobileTimelineOverlay';

// Tab Content Components
import { CaseOverview } from '@/features/cases/components/detail/overview/CaseOverview';
import { CaseParties } from '@/features/cases/components/detail/CaseParties';
import { CaseTimeline } from '@/features/cases/components/detail/CaseTimeline';
import { CaseStrategy } from '@/features/cases/components/detail/CaseStrategy';
import { CaseArgumentManager } from '@/features/cases/components/detail/CaseArgumentManager';
import { CaseRiskManager } from '@/features/cases/components/detail/CaseRiskManager';
import { CasePlanning } from '@/features/cases/components/detail/CasePlanning';
import { CaseProjects } from '@/features/cases/components/detail/projects/CaseProjects';
import { CaseWorkflow } from '@/features/cases/components/detail/CaseWorkflow';
import { CaseCollaboration } from '@/features/cases/components/detail/collaboration/CaseCollaboration';
import { CaseMotions } from '@/features/cases/components/detail/motions/CaseMotions';
import { CaseDiscovery } from '@/features/cases/components/detail/CaseDiscovery';
import { CaseEvidence } from '@/features/cases/components/detail/CaseEvidence';
import { CaseDocuments } from '@/features/cases/components/detail/CaseDocuments';
import { CaseDrafting } from '@/features/cases/components/detail/CaseDrafting';
import { CaseContractReview } from '@/features/cases/components/detail/CaseContractReview';
import { CaseBilling } from '@/features/cases/components/detail/CaseBilling';

// ============================================================================
// INTERNAL DEPENDENCIES - HOOKS & CONTEXT
// ============================================================================
import { useTheme } from '@/providers/ThemeContext';
import { useCaseDetail } from '@/hooks/useCaseDetail';

// ============================================================================
// INTERNAL DEPENDENCIES - SERVICES & UTILS
// ============================================================================
import { cn } from '@/utils/cn';
import { CASE_DETAIL_TABS } from '@/features/cases/components/detail/CaseDetailConfig';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Case, TimeEntry, LegalDocument } from '@/types';

interface CaseDetailProps {
  caseData: Case;
  onBack?: () => void;
  onSelectCase?: (c: Case) => void;
  initialTab?: string;
}

/**
 * CaseDetail - Production-grade case detail interface with full tabbed navigation
 * 
 * Features:
 * - Two-level tab navigation (parent categories + sub-tabs)
 * - Mobile-responsive with overlay menus
 * - Lazy-loaded tab content
 * - Integrated data management via useCaseDetail hook
 * - Real-time timeline and collaboration features
 */
export const CaseDetail = ({ 
  caseData, 
  onBack, 
  onSelectCase,
  initialTab = 'Overview'
}: CaseDetailProps) => {
  const { theme } = useTheme();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showTimelineOverlay, setShowTimelineOverlay] = useState(false);

  // Initialize case detail data and actions
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
    analyzeWithAI,
    draftDocument,
    generateAIWorkflow
  } = useCaseDetail(caseData, initialTab);

  // Compatibility wrappers for UI that expects old method names
  const handleAnalyze = (doc: unknown) => analyzeWithAI(doc.id);
  const handleDraft = () => draftDocument('Motion/Clause', draftPrompt);
  const handleGenerateWorkflow = () => generateAIWorkflow();

  // Handle parent tab navigation - switch to first sub-tab of clicked parent
  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = CASE_DETAIL_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id);
    }
  }, [setActiveTab]);

  // Handle adding time entry from overview
  const handleTimeEntryAdded = useCallback((entry: TimeEntry) => {
    setBillingEntries((prev: TimeEntry[] | undefined) => [...(prev || []), entry]);
  }, [setBillingEntries]);

  // Handle document creation callback
  const handleDocumentCreated = useCallback((doc: LegalDocument) => {
    setDocuments((prev: LegalDocument[] | undefined) => [...(prev || []), doc]);
  }, [setDocuments]);

  // Render active tab content
  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'Overview':
        return <CaseOverview caseData={caseData} onTimeEntryAdded={handleTimeEntryAdded} onNavigateToCase={onSelectCase} />;
      
      case 'Parties':
        return <CaseParties parties={parties} onUpdate={setParties} />;
      
      case 'Timeline':
        return <CaseTimeline events={timelineEvents} onEventClick={(e) => console.log('Event clicked:', e)} />;
      
      case 'Research':
        return <CaseStrategy caseId={caseData.id} evidence={[]} />;
      
      case 'Arguments':
        return <CaseArgumentManager caseData={caseData} evidence={[]} />;
      
      case 'Risk':
        return <CaseRiskManager caseData={caseData} />;
      
      case 'Strategy':
        return <CaseStrategy caseId={caseData.id} evidence={[]} />;
      
      case 'Planning':
        return <CasePlanning caseData={caseData} />;
      
      case 'Projects':
        return (
          <CaseProjects 
            projects={projects}
            onAddProject={addProject}
            onAddTask={addTaskToProject}
            onUpdateTaskStatus={updateProjectTaskStatus}
          />
        );
      
      case 'Workflow':
        return (
          <CaseWorkflow 
            stages={stages}
            generatingWorkflow={generatingWorkflow}
            onGenerateWorkflow={handleGenerateWorkflow}
            onNavigateToModule={(module) => setActiveTab(module)}
          />
        );
      
      case 'Collaboration':
        return <CaseCollaboration caseId={caseData.id} />;
      
      case 'Motions':
        return <CaseMotions caseId={caseData.id} caseTitle={caseData.title} />;
      
      case 'Discovery':
        return <CaseDiscovery caseId={caseData.id} />;
      
      case 'Evidence':
        return <CaseEvidence caseId={caseData.id} />;
      
      case 'Exhibits':
        return <CaseEvidence caseId={caseData.id} />;
      
      case 'Documents':
        return (
          <CaseDocuments 
            documents={documents}
            analyzingId={analyzingId}
            onAnalyze={handleAnalyze}
            onDocumentCreated={handleDocumentCreated}
          />
        );
      
      case 'Drafting':
        return (
          <CaseDrafting 
            caseTitle={caseData.title}
            draftPrompt={draftPrompt}
            setDraftPrompt={setDraftPrompt}
            draftResult={draftResult}
            isDrafting={isDrafting}
            onDraft={handleDraft}
          />
        );
      
      case 'Contract Review':
        return <CaseContractReview />;
      
      case 'Billing':
        return (
          <CaseBilling
            billingModel={caseData.billingModel || 'Hourly'}
            value={caseData.billingValue || 0}
            entries={billingEntries}
          />
        );
      
      default:
        return (
          <div className={cn("flex items-center justify-center h-96", theme.text.tertiary)}>
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Tab: {activeTab}</p>
              <p className="text-sm">Content component coming soon</p>
            </div>
          </div>
        );
    }
  }, [
    activeTab, caseData, parties, timelineEvents, projects, stages, documents, 
    billingEntries, analyzingId, generatingWorkflow, draftPrompt, draftResult, 
    isDrafting, setParties, addProject, addTaskToProject, updateProjectTaskStatus,
    handleAnalyze, handleDraft, handleGenerateWorkflow, handleTimeEntryAdded,
    handleDocumentCreated, onSelectCase, theme, setActiveTab
  ]);

  return (
    <div className={cn("h-full flex flex-col", theme.surface.default)}>
      {/* Header */}
      <CaseDetailHeader
        id={caseData.id}
        title={caseData.title}
        status={caseData.status}
        client={caseData.client}
        clientId={caseData.clientId || caseData.id}
        jurisdiction={caseData.jurisdiction}
        onBack={onBack || (() => {})}
        onShowTimeline={() => setShowTimelineOverlay(true)}
      />

      {/* Navigation */}
      <CaseDetailNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onParentTabChange={handleParentTabChange}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {renderTabContent}
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setShowMobileMenu(true)}
        title="Quick Actions Menu"
        aria-label="Open quick actions menu"
        className={cn(
          "md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center z-40",
          theme.action.primary.bg, theme.action.primary.text, theme.action.primary.hover
        )}
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Mobile Menus */}
      <CaseDetailMobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setShowMobileMenu(false);
        }}
      />

      <MobileTimelineOverlay
        isOpen={showTimelineOverlay}
        onClose={() => setShowTimelineOverlay(false)}
        events={timelineEvents}
        onEventClick={(e) => console.log('Timeline event:', e)}
      />
    </div>
  );
};

export default CaseDetail;
