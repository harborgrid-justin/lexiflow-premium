import React from 'react';
import { Case, LegalDocument, WorkflowStage, TimeEntry, Party, Project, EvidenceItem, TimelineEvent } from '../../types';
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
import { CaseCollaboration } from './collaboration/CaseCollaboration';
import { NexusGraph } from '../visual/NexusGraph';

interface CaseDetailContentProps {
  activeTab: string;
  caseData: Case;
  parties: Party[];
  documents: LegalDocument[];
  stages: WorkflowStage[];
  projects: Project[];
  billingEntries: TimeEntry[];
  evidence: EvidenceItem[];
  timelineEvents: TimelineEvent[];
  generatingWorkflow: boolean;
  analyzingId: string | null;
  draftPrompt: string;
  draftResult: string;
  isDrafting: boolean;
  onTimeEntryAdded: (e: TimeEntry) => void;
  onNavigateToCase?: (c: Case) => void;
  onUpdateParties: (p: Party[]) => void;
  onTimelineClick: (e: any) => void;
  onAddProject: (p: Project) => void;
  onAddTask: (pId: string, t: any) => void;
  onUpdateTask: (pId: string, tId: string) => void;
  onGenerateWorkflow: () => void;
  onAnalyzeDoc: (d: LegalDocument) => void;
  onDocumentCreated: (d: LegalDocument) => void;
  onDraft: () => void;
  setDraftPrompt: (s: string) => void;
  setBillingEntries: (updater: (prev: TimeEntry[]) => TimeEntry[]) => void;
  setDocuments: (docs: LegalDocument[]) => void;
  onNodeClick: (node: any) => void; // For Nexus Graph
}

export const CaseDetailContent: React.FC<CaseDetailContentProps> = (props) => {
  const { activeTab, caseData, parties, documents, stages, projects, billingEntries, evidence, timelineEvents } = props;

  switch (activeTab) {
    case 'Overview': return <CaseOverview caseData={{...caseData, parties}} onTimeEntryAdded={props.onTimeEntryAdded} onNavigateToCase={props.onNavigateToCase} />;
    case 'Nexus': return <NexusGraph caseData={caseData} parties={parties} evidence={evidence} onNodeClick={props.onNodeClick} />;
    case 'Parties': return <CaseParties parties={parties} onUpdate={props.onUpdateParties} />;
    case 'Timeline': return <CaseTimeline events={timelineEvents} onEventClick={props.onTimelineClick} />;
    case 'Arguments': return <CaseArgumentManager caseData={caseData} evidence={evidence} />;
    case 'Risk': return <CaseRiskManager caseData={caseData} />;
    case 'Strategy': return <CaseStrategy citations={caseData.citations} arguments={caseData.arguments} defenses={caseData.defenses} evidence={evidence} />;
    case 'Planning': return <CasePlanning caseData={caseData} />;
    case 'Projects': return <CaseProjects projects={projects} onAddProject={props.onAddProject} onAddTask={props.onAddTask} onUpdateTaskStatus={props.onUpdateTask} />;
    case 'Workflow': return <CaseWorkflow stages={stages} generatingWorkflow={props.generatingWorkflow} onGenerateWorkflow={props.onGenerateWorkflow} />;
    case 'Collaboration': return <CaseCollaboration caseId={caseData.id} />;
    case 'Motions': return <CaseMotions caseId={caseData.id} caseTitle={caseData.title} documents={documents} />;
    case 'Discovery': return <CaseDiscovery caseId={caseData.id} />;
    case 'Evidence': return <CaseEvidence caseId={caseData.id} />;
    case 'Documents': return <CaseDocuments documents={documents} analyzingId={props.analyzingId} onAnalyze={props.onAnalyzeDoc} onDocumentCreated={props.onDocumentCreated} />;
    case 'Drafting': return <CaseDrafting caseTitle={caseData.title} draftPrompt={props.draftPrompt} setDraftPrompt={props.setDraftPrompt} draftResult={props.draftResult} isDrafting={props.isDrafting} onDraft={props.onDraft} />;
    case 'Contract Review': return <CaseContractReview />;
    case 'Billing': return <CaseBilling billingModel={caseData.billingModel || 'Hourly'} value={caseData.value || 0} entries={billingEntries} />;
    default: return <CaseOverview caseData={{...caseData, parties}} onTimeEntryAdded={props.onTimeEntryAdded} onNavigateToCase={props.onNavigateToCase} />;
  }
};