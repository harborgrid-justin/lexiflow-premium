import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

// Components
import { CaseDetailHeader } from '@/routes/cases/components/detail/CaseDetailHeader';
import { CaseDetailMobileMenu } from '@/routes/cases/components/detail/CaseDetailMobileMenu';
import { CaseDetailNavigation } from '@/routes/cases/components/detail/layout/CaseDetailNavigation';
import { MobileTimelineOverlay } from '@/routes/cases/components/detail/MobileTimelineOverlay';

// Tab Content Components
import { CaseArgumentManager } from '@/routes/cases/components/detail/CaseArgumentManager';
import { CaseBilling } from '@/routes/cases/components/detail/CaseBilling';
import { CaseContractReview } from '@/routes/cases/components/detail/CaseContractReview';
import { CaseDiscovery } from '@/routes/cases/components/detail/CaseDiscovery';
import { CaseDocuments } from '@/routes/cases/components/detail/CaseDocuments';
import { CaseDrafting } from '@/routes/cases/components/detail/CaseDrafting';
import { CaseEvidence } from '@/routes/cases/components/detail/CaseEvidence';
import { CaseParties } from '@/routes/cases/components/detail/CaseParties';
import { CasePlanning } from '@/routes/cases/components/detail/CasePlanning';
import { CaseRiskManager } from '@/routes/cases/components/detail/CaseRiskManager';
import { CaseStrategy } from '@/routes/cases/components/detail/CaseStrategy';
import { CaseTimeline } from '@/routes/cases/components/detail/CaseTimeline';
import { CaseWorkflow } from '@/routes/cases/components/detail/CaseWorkflow';
import { CaseCollaboration } from '@/routes/cases/components/detail/collaboration/CaseCollaboration';
import { CaseMotions } from '@/routes/cases/components/detail/motions/CaseMotions';
import { CaseOverview } from '@/routes/cases/components/detail/overview/CaseOverview';
import { CaseProjects } from '@/routes/cases/components/detail/projects/CaseProjects';

// Hooks & Context
import { useTheme } from "@/hooks/useTheme";
import { useCaseDetailContext } from './CaseDetailContext';

// Services & Utils
import { cn } from '@/lib/cn';
import { CASE_DETAIL_TABS } from '@/routes/cases/components/detail/CaseDetailConfig';

// Types
import { Case, LegalDocument, TimeEntry } from '@/types';

interface CaseDetailViewProps {
  caseData: Case;
  onBack?: () => void;
  onSelectCase?: (c: Case) => void;
}

export function CaseDetailView({ caseData, onBack, onSelectCase }: CaseDetailViewProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showTimelineOverlay, setShowTimelineOverlay] = useState(false);

  // Consume from context
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
  } = useCaseDetailContext();

  // Compatibility wrappers
  const handleAnalyze = useCallback((doc: any) => analyzeWithAI(doc.id), [analyzeWithAI]);
  const handleDraft = useCallback(() => draftDocument('Motion/Clause', draftPrompt), [draftDocument, draftPrompt]);
  const handleGenerateWorkflow = useCallback(() => generateAIWorkflow(), [generateAIWorkflow]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = CASE_DETAIL_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0]!.id);
    }
  }, [setActiveTab]);

  const handleTimeEntryAdded = useCallback((entry: TimeEntry) => {
    setBillingEntries((prev: TimeEntry[] | undefined) => [...(prev || []), entry]);
  }, [setBillingEntries]);

  const handleDocumentCreated = useCallback((doc: LegalDocument) => {
    setDocuments((prev: LegalDocument[] | undefined) => [...(prev || []), doc]);
  }, [setDocuments]);

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'Overview':
        return <CaseOverview caseData={caseData} onTimeEntryAdded={handleTimeEntryAdded} onNavigateToCase={onSelectCase} />;
      case 'Parties':
        return <CaseParties parties={parties} onUpdate={setParties} />;
      case 'Timeline':
        return <CaseTimeline events={timelineEvents} onEventClick={(e) => {
          if ((e.type as string) === 'docket' && e.id) {
            navigate(`/docket/${e.id}`);
          }
        }} />;
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
    handleDocumentCreated, onSelectCase, theme, setActiveTab, setDraftPrompt,
    navigate
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
        onBack={onBack || (() => { })}
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
}
