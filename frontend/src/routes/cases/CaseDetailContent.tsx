import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

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

// Types
import { LegalDocument, TimeEntry } from '@/types';

export default function CaseDetailContent() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Consume from context
  const {
    caseData,
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

  const handleAnalyze = useCallback((doc: LegalDocument) => analyzeWithAI(doc.id), [analyzeWithAI]);
  const handleDraft = useCallback(() => draftDocument('Motion/Clause', draftPrompt), [draftDocument, draftPrompt]);
  const handleGenerateWorkflow = useCallback(() => generateAIWorkflow(), [generateAIWorkflow]);

  const handleTimeEntryAdded = useCallback((entry: TimeEntry) => {
    setBillingEntries((prev: TimeEntry[] | undefined) => [...(prev || []), entry]);
  }, [setBillingEntries]);

  const handleDocumentCreated = useCallback((doc: LegalDocument) => {
    setDocuments((prev: LegalDocument[] | undefined) => [...(prev || []), doc]);
  }, [setDocuments]);

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'Overview':
        return <CaseOverview caseData={caseData} onTimeEntryAdded={handleTimeEntryAdded} onNavigateToCase={(c) => navigate(`/cases/${c.id}`)} />;
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
    handleDocumentCreated, theme, setActiveTab, setDraftPrompt, navigate
  ]);

  return renderTabContent;
}
