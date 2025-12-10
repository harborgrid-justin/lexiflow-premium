
import React, { Suspense, lazy } from 'react';
import { Case, LegalDocument, WorkflowStage, TimeEntry, Party, Project, EvidenceItem, TimelineEvent } from '../../../types';
import { CaseOverview } from '../CaseOverview';
import { CaseDocuments } from '../CaseDocuments';
import { CaseWorkflow } from '../CaseWorkflow';
import { CaseDrafting } from '../CaseDrafting';
import { CaseBilling } from '../CaseBilling';
import { CaseContractReview } from '../CaseContractReview';
import { CaseTimeline } from '../CaseTimeline';
import { CaseEvidence } from '../CaseEvidence';
import { CaseDiscovery } from '../CaseDiscovery';
import { CaseMessages } from '../CaseMessages';
import { CaseParties } from '../CaseParties';
import { CaseMotions } from '../motions/CaseMotions';
import { CaseStrategy } from '../CaseStrategy';
import { CaseArgumentManager } from '../CaseArgumentManager';
import { CaseRiskManager } from '../CaseRiskManager';
import { CasePlanning } from '../CasePlanning';
import { CaseProjects } from '../projects/CaseProjects';
import { CaseCollaboration } from '../collaboration/CaseCollaboration';
import { ExhibitManager } from '../../ExhibitManager'; 
import { EvidenceVault } from '../../EvidenceVault';   
import { ResearchTool } from '../../ResearchTool';     
import { LazyLoader } from '../../common/LazyLoader';

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
}

export const CaseDetailContent: React.FC<CaseDetailContentProps> = (props) => {
  const { activeTab, caseData } = props;

  // Dictionary Mapping for cleaner routing
  const contentMap: Record<string, React.ReactNode> = {
    'Overview': <CaseOverview caseData={{...caseData, parties: props.parties}} onTimeEntryAdded={props.onTimeEntryAdded} onNavigateToCase={props.onNavigateToCase} />,
    'Parties': <CaseParties parties={props.parties} onUpdate={props.onUpdateParties} />,
    'Timeline': <CaseTimeline events={props.timelineEvents} onEventClick={props.onTimelineClick} />,
    'Research': <ResearchTool caseId={caseData.id} />,
    'Arguments': <CaseArgumentManager caseData={caseData} evidence={props.evidence} />,
    'Risk': <CaseRiskManager caseData={caseData} />,
    'Strategy': <CaseStrategy citations={caseData.citations} arguments={caseData.arguments} defenses={caseData.defenses} evidence={props.evidence} />,
    'Planning': <CasePlanning caseData={caseData} />,
    'Projects': <CaseProjects projects={props.projects} onAddProject={props.onAddProject} onAddTask={props.onAddTask} onUpdateTaskStatus={props.onUpdateTask} />,
    'Workflow': <CaseWorkflow stages={props.stages} generatingWorkflow={props.generatingWorkflow} onGenerateWorkflow={props.onGenerateWorkflow} />,
    'Collaboration': <CaseCollaboration caseId={caseData.id} />,
    'Motions': <CaseMotions caseId={caseData.id} caseTitle={caseData.title} documents={props.documents} />,
    'Discovery': <CaseDiscovery caseId={caseData.id} />,
    'Evidence': <EvidenceVault caseId={caseData.id} />,
    'Exhibits': <ExhibitManager caseId={caseData.id} initialTab="list" />,
    'Documents': <CaseDocuments documents={props.documents} analyzingId={props.analyzingId} onAnalyze={props.onAnalyzeDoc} onDocumentCreated={props.onDocumentCreated} />,
    'Drafting': <CaseDrafting caseTitle={caseData.title} draftPrompt={props.draftPrompt} setDraftPrompt={props.setDraftPrompt} draftResult={props.draftResult} isDrafting={props.isDrafting} onDraft={props.onDraft} />,
    'Contract Review': <CaseContractReview />,
    'Billing': <CaseBilling billingModel={caseData.billingModel || 'Hourly'} value={caseData.value || 0} entries={props.billingEntries} />
  };

  return <>{contentMap[activeTab] || contentMap['Overview']}</>;
};
// FIX: This file is obsolete and can be safely deleted.
