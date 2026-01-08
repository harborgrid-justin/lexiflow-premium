/**
 * @module hooks/useCaseDetail
 * @category Hooks - Case Management
 *
 * Manages detailed case view with multiple data queries and AI operations.
 * Provides workflow generation, document analysis, and legal drafting.
 *
 * @example
 * ```typescript
 * const detail = useCaseDetail(caseData, 'Overview');
 *
 * // Tab navigation
 * <Tabs activeTab={detail.activeTab} onChange={detail.setActiveTab} />
 *
 * // AI features
 * await detail.generateAIWorkflow();
 * await detail.analyzeWithAI(documentId);
 * await detail.draftDocument('pleading', 'Motion to dismiss...');
 * ```
 */

import { DEBUG_API_SIMULATION_DELAY_MS } from "@/config/features/features.config";
import { DataService } from "@/services/data/dataService";
import {
  Case,
  LegalDocument,
  Motion,
  Party,
  Project,
  TimeEntry,
  TimelineEvent,
  WorkflowStage,
  WorkflowTask,
} from "@/types";
import { queryKeys } from "@/utils/queryKeys";
import { useMemo, useState } from "react";
import { useNotify } from "./useNotify";
import { queryClient, useQuery } from "./useQueryHooks";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useCaseDetail hook
 */
export interface UseCaseDetailReturn {
  /** Active tab name */
  activeTab: string;
  /** Set active tab */
  setActiveTab: (tab: string) => void;
  /** Documents for this case */
  documents: LegalDocument[];
  /** Set documents */
  setDocuments: (
    updater:
      | LegalDocument[]
      | ((prev: LegalDocument[] | undefined) => LegalDocument[])
  ) => void;
  /** Whether documents are loading */
  loadingDocs?: boolean;
  /** Workflow stages */
  stages: WorkflowStage[];
  /** All tasks */
  allTasks?: WorkflowTask[];
  /** Billing entries */
  billingEntries: TimeEntry[];
  /** Set billing entries */
  setBillingEntries: (
    updater: TimeEntry[] | ((prev: TimeEntry[] | undefined) => TimeEntry[])
  ) => void;
  /** Motions */
  motions?: Motion[];
  /** Projects */
  projects: Project[];
  /** Add project */
  addProject: (project: Project) => Promise<void>;
  /** Add task to project */
  addTaskToProject: (projectId: string, task: WorkflowTask) => void;
  /** Update project task status */
  updateProjectTaskStatus: (projectId: string, taskId: string) => Promise<void>;
  /** Parties */
  parties: Party[];
  /** Set parties */
  setParties: (parties: Party[]) => void;
  /** Timeline events */
  timelineEvents: TimelineEvent[];
  /** Generate AI workflow */
  generateAIWorkflow: () => Promise<void>;
  /** Whether workflow is generating */
  generatingWorkflow: boolean;
  /** Analyze document with AI */
  analyzeWithAI: (docId: string) => Promise<void>;
  /** Currently analyzing document ID */
  analyzingId: string | null;
  /** Draft document prompt */
  draftPrompt: string;
  /** Set draft prompt */
  setDraftPrompt: (prompt: string) => void;
  /** Draft result */
  draftResult: string;
  /** Draft document with AI */
  draftDocument: (docType: string, prompt: string) => Promise<void>;
  /** Whether drafting is in progress */
  isDrafting: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Manages detailed case view with AI-powered operations.
 *
 * @param caseData - Case data object
 * @param initialTab - Initial tab to display
 * @returns Object with case detail state and operations
 */
export function useCaseDetail(
  caseData: Case,
  initialTab: string = "Overview",
  initialDocuments?: LegalDocument[],
  initialParties?: Party[]
): UseCaseDetailReturn {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [generatingWorkflow, setGeneratingWorkflow] = useState(false);
  const [analyzingId] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftResult] = useState("");
  const [isDrafting] = useState(false);
  const notify = useNotify();

  // --- DATA QUERIES (Parallel Fetching) ---

  // 1. Documents
  const { data: documents = [] } = useQuery<LegalDocument[]>(
    queryKeys.documents.byCaseId(caseData?.id),
    () => DataService.documents.getByCaseId(caseData.id),
    {
      enabled: !!caseData?.id,
      initialData: initialDocuments,
    }
  );

  // 2. Tasks / Workflow
  const { data: allTasks = [] } = useQuery<WorkflowTask[]>(
    queryKeys.tasks.byCaseId(caseData?.id),
    () => DataService.tasks.getByCaseId(caseData.id),
    { enabled: !!caseData?.id }
  );

  // 3. Billing
  const { data: billingEntries = [] } = useQuery<TimeEntry[]>(
    queryKeys.billing.timeEntries(),
    () => DataService.billing.getTimeEntries({ caseId: caseData.id }),
    { enabled: !!caseData?.id }
  );

  // 4. Motions
  const { data: motions = [] } = useQuery<Motion[]>(
    queryKeys.motions.byCaseId(caseData?.id),
    () => DataService.motions.getByCaseId(caseData.id),
    { enabled: !!caseData?.id }
  );

  // 6. Docket Entries
  const { data: docketEntries = [] } = useQuery<DocketEntry[]>(
    queryKeys.docket.byCaseId(caseData?.id),
    async () => {
      const response = await DataService.docket.getAll({
        caseId: caseData.id,
        limit: 1000,
      });
      // Handle PaginatedResponse structure: { data: DocketEntry[], ... }
      if (response && typeof response === "object" && "data" in response) {
        return (response as { data?: unknown[] }).data || [];
      }
      return Array.isArray(response) ? response : [];
    },
    { enabled: !!caseData?.id }
  );

  // 5. Projects
  const { data: projects = [] } = useQuery<Project[]>(
    queryKeys.projects.byCaseId(caseData?.id),
    () => DataService.projects.getByCaseId(caseData.id),
    { enabled: !!caseData?.id }
  );

  // Local state for parties (as they are often edited locally before save)
  const [parties, setParties] = useState<Party[]>(
    initialParties || caseData.parties || []
  );

  // Derived Stages from Tasks
  // Groups tasks into Active and Completed stages for workflow visualization
  const stages = useMemo(() => {
    if (!Array.isArray(allTasks) || allTasks.length === 0) return [];
    return [
      {
        id: "s1",
        title: "Active Tasks",
        status: "Active",
        tasks: allTasks.filter(
          (t) =>
            t.status?.toString() !== "COMPLETED" &&
            t.status?.toString() !== "Done"
        ),
      },
      {
        id: "s2",
        title: "Completed",
        status: "Completed",
        tasks: allTasks.filter(
          (t) =>
            t.status?.toString() === "COMPLETED" ||
            t.status?.toString() === "Done"
        ),
      },
    ] as WorkflowStage[];
  }, [allTasks]);

  // --- COMPUTED ---

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    events.push({
      id: "init",
      date: caseData.filingDate,
      title: "Case Filed",
      type: "milestone",
      description: `Filed in ${caseData.court}`,
    });

    // Ensure documents is an array before iterating
    if (Array.isArray(documents)) {
      documents.forEach((d) => {
        events.push({
          id: d.id,
          date: d.uploadDate,
          title: `Doc Upload: ${d.title}`,
          type: "document",
          description: d.summary || d.type,
          relatedId: d.id,
        });
      });
    }

    // Ensure billingEntries is an array before iterating
    if (Array.isArray(billingEntries)) {
      billingEntries.forEach((b) => {
        events.push({
          id: b.id,
          date: b.date,
          title: "Billable Time Logged",
          type: "billing",
          description: `${(b.duration / 60).toFixed(1)}h - ${b.description}`,
          relatedId: b.id,
        });
      });
    }

    // Ensure motions is an array before iterating
    if (Array.isArray(motions)) {
      motions.forEach((m) => {
        if (m.filingDate) {
          events.push({
            id: `mot-file-${m.id}`,
            date: m.filingDate,
            title: `Motion Filed: ${m.title}`,
            type: "motion",
            description: `Type: ${m.type} | Status: ${m.status}`,
            relatedId: m.id,
          });
        }
        if (m.hearingDate) {
          events.push({
            id: `mot-hear-${m.id}`,
            date: m.hearingDate,
            title: `Hearing Scheduled: ${m.title}`,
            type: "hearing",
            description: `Court Appearance Required`,
            relatedId: m.id,
          });
        }
      });
    }

    // Ensure docketEntries is an array before iterating
    if (Array.isArray(docketEntries)) {
      docketEntries.forEach((entry) => {
        events.push({
          id: `docket-${entry.id}`,
          date: entry.dateFiled || entry.entryDate,
          title: entry.sequenceNumber
            ? `Docket ${entry.sequenceNumber}: ${entry.description}`
            : entry.description || "Docket Entry",
          type: "document", // Using valid TimelineEvent type
          description: entry.text || entry.description || "",
          relatedId: entry.id,
        });
      });
    }

    return events.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [caseData, documents, billingEntries, motions, docketEntries]);

  // --- ACTIONS ---

  const handleGenerateWorkflow = async () => {
    setGeneratingWorkflow(true);
    // In real app, this would call a mutation to add tasks to DB
    setTimeout(
      () => setGeneratingWorkflow(false),
      DEBUG_API_SIMULATION_DELAY_MS + 500
    );
  };

  const setDocumentsWrapper = (
    updater:
      | LegalDocument[]
      | ((prev: LegalDocument[] | undefined) => LegalDocument[])
  ) => {
    queryClient.setQueryData<LegalDocument[]>(
      queryKeys.documents.byCaseId(caseData.id),
      updater
    );
  };

  const setBillingWrapper = (
    updater: TimeEntry[] | ((prev: TimeEntry[] | undefined) => TimeEntry[])
  ) => {
    queryClient.setQueryData<TimeEntry[]>(
      queryKeys.billing.timeEntries(),
      updater
    );
  };

  // Compatibility wrappers for the existing UI that expects addProject callbacks
  const addProject = async (project: Project) => {
    // Optimistic update
    queryClient.setQueryData(queryKeys.projects.byCaseId(caseData.id), [
      ...projects,
      project,
    ]);
  };

  const addTaskToProject = () => {
    // Logic handled in components via direct DB calls mostly,
    // but this forces a refresh of the projects query
    queryClient.invalidate(queryKeys.projects.byCaseId(caseData.id));
    queryClient.invalidate(queryKeys.tasks.byCaseId(caseData.id));
  };

  const updateProjectTaskStatus = async (taskId: string) => {
    try {
      // Find the task in the current tasks list
      const task = allTasks.find((t) => t.id === taskId);
      if (!task) {
        console.warn(`Task ${taskId} not found`);
        return;
      }

      // Toggle task status between Done and Pending
      const newStatus =
        task.status?.toString() === "COMPLETED" ||
        task.status?.toString() === "Done"
          ? "Pending"
          : "Done";

      // Update via DataService
      await DataService.tasks.update(taskId, { status: newStatus });

      // Invalidate queries to refresh the UI
      queryClient.invalidate(queryKeys.projects.byCaseId(caseData.id));
      queryClient.invalidate(queryKeys.tasks.byCaseId(caseData.id));

      notify.success(`Task status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update task status", error);
      notify.error("Failed to update task status");
    }
  };

  return {
    activeTab,
    setActiveTab,
    documents,
    setDocuments: setDocumentsWrapper,
    stages,
    allTasks,
    parties,
    setParties,
    motions,
    projects,
    addProject,
    addTaskToProject,
    updateProjectTaskStatus,
    billingEntries,
    setBillingEntries: setBillingWrapper,
    generatingWorkflow,
    generateAIWorkflow: handleGenerateWorkflow,
    analyzeWithAI: async () => {}, // Not implemented
    analyzingId,
    draftPrompt,
    setDraftPrompt,
    draftResult,
    draftDocument: async () => {}, // Not implemented
    isDrafting,
    timelineEvents,
  };
}
