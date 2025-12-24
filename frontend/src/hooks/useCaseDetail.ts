
import { useState, useMemo } from 'react';
import { Case, LegalDocument, WorkflowStage, TimeEntry, TimelineEvent, Party, Project, WorkflowTask, Motion } from '../types';
import { GeminiService } from '../services/features/research/geminiService';
import { DataService } from '../services/data/dataService';
import { useQuery, useMutation, queryClient } from './useQueryHooks';
import { queryKeys } from '../utils/queryKeys';
import { useNotify } from './useNotify';
import { DEBUG_API_SIMULATION_DELAY_MS } from '../config/features/features.config';

export const useCaseDetail = (caseData: Case, initialTab: string = 'Overview') => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [generatingWorkflow, setGeneratingWorkflow] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [draftResult, setDraftResult] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const notify = useNotify();

  // --- DATA QUERIES (Parallel Fetching) ---
  
  // 1. Documents
  const { data: documents = [], isLoading: loadingDocs } = useQuery<LegalDocument[]>(
    queryKeys.documents.byCaseId(caseData?.id),
    () => DataService.documents.getByCaseId(caseData.id),
    { enabled: !!caseData?.id }
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

  // 5. Projects
  const { data: projects = [] } = useQuery<Project[]>(
    queryKeys.projects.byCaseId(caseData?.id),
    () => DataService.projects.getByCaseId(caseData.id),
    { enabled: !!caseData?.id }
  );

  // Local state for parties (as they are often edited locally before save)
  const [parties, setParties] = useState<Party[]>(caseData.parties || []);

  // Derived Stages from Tasks
  // Groups tasks into Active and Completed stages for workflow visualization
  const stages = useMemo(() => {
    if (!Array.isArray(allTasks) || allTasks.length === 0) return [];
    return [
        { id: 's1', title: 'Active Tasks', status: 'Active', tasks: allTasks.filter(t => t.status !== 'Done') },
        { id: 's2', title: 'Completed', status: 'Completed', tasks: allTasks.filter(t => t.status === 'Done') }
    ] as WorkflowStage[];
  }, [allTasks]);

  // --- COMPUTED ---

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    events.push({ id: 'init', date: caseData.filingDate, title: 'Case Filed', type: 'milestone', description: `Filed in ${caseData.court}` });
    
    // Ensure documents is an array before iterating
    if (Array.isArray(documents)) {
      documents.forEach(d => {
          events.push({ id: d.id, date: d.uploadDate, title: `Doc Upload: ${d.title}`, type: 'document', description: d.summary || d.type, relatedId: d.id });
      });
    }
    
    // Ensure billingEntries is an array before iterating
    if (Array.isArray(billingEntries)) {
      billingEntries.forEach(b => {
          events.push({ id: b.id, date: b.date, title: 'Billable Time Logged', type: 'billing', description: `${(b.duration/60).toFixed(1)}h - ${b.description}`, relatedId: b.id });
      });
    }

    // Ensure motions is an array before iterating
    if (Array.isArray(motions)) {
      motions.forEach(m => {
          if(m.filingDate) {
              events.push({ id: `mot-file-${m.id}`, date: m.filingDate, title: `Motion Filed: ${m.title}`, type: 'motion', description: `Type: ${m.type} | Status: ${m.status}`, relatedId: m.id });
          }
          if(m.hearingDate) {
              events.push({ id: `mot-hear-${m.id}`, date: m.hearingDate, title: `Hearing Scheduled: ${m.title}`, type: 'hearing', description: `Court Appearance Required`, relatedId: m.id });
          }
      });
    }

    return events.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [caseData, documents, billingEntries, motions]);

  // --- ACTIONS ---

  const { mutate: updateDocuments } = useMutation(
      (doc: LegalDocument) => DataService.documents.update(doc.id, doc),
      { invalidateKeys: [queryKeys.documents.byCaseId(caseData.id)] }
  );

  const handleAnalyze = async (doc: LegalDocument) => {
    setAnalyzingId(doc.id);
    try {
        const result = await GeminiService.analyzeDocument(doc.content);
        const updated = { ...doc, summary: result.summary, riskScore: result.riskScore };
        updateDocuments(updated); // Optimistic update via mutation
    } catch (e) {
        console.error("Analysis failed", e);
        notify.error("AI analysis failed to complete.");
    } finally {
        setAnalyzingId(null);
    }
  };

  const handleDraft = async () => {
    if(!draftPrompt.trim()) return;
    setIsDrafting(true);
    try {
        const text = await GeminiService.generateDraft(`${draftPrompt}\n\nCase: ${caseData.title}\nClient: ${caseData.client}`, 'Motion/Clause');
        setDraftResult(text);
    } catch (e) {
        console.error("Drafting failed", e);
        notify.error("AI drafting failed to complete.");
    } finally {
        setIsDrafting(false);
    }
  };

  const handleGenerateWorkflow = async () => {
    setGeneratingWorkflow(true);
    // In real app, this would call a mutation to add tasks to DB
    setTimeout(() => setGeneratingWorkflow(false), DEBUG_API_SIMULATION_DELAY_MS + 500);
  };

  const setDocumentsWrapper = (updater: LegalDocument[] | ((prev: LegalDocument[] | undefined) => LegalDocument[])) => {
     queryClient.setQueryData<LegalDocument[]>(queryKeys.documents.byCaseId(caseData.id), updater);
  };
  
  const setBillingWrapper = (updater: TimeEntry[] | ((prev: TimeEntry[] | undefined) => TimeEntry[])) => {
      queryClient.setQueryData<TimeEntry[]>(queryKeys.billing.timeEntries(), updater);
  };

  // Compatibility wrappers for the existing UI that expects addProject callbacks
  const addProject = async (project: Project) => {
      // Optimistic update
      queryClient.setQueryData(queryKeys.projects.byCaseId(caseData.id), [...projects, project]);
  };

  const addTaskToProject = (projectId: string, task: WorkflowTask) => {
      // Logic handled in components via direct DB calls mostly, 
      // but this forces a refresh of the projects query
      queryClient.invalidate(queryKeys.projects.byCaseId(caseData.id));
      queryClient.invalidate(queryKeys.tasks.byCaseId(caseData.id));
  };

  const updateProjectTaskStatus = async (projectId: string, taskId: string) => {
      try {
          // Find the task in the current tasks list
          const task = allTasks.find(t => t.id === taskId);
          if (!task) {
              console.warn(`Task ${taskId} not found`);
              return;
          }

          // Toggle task status between Done and Pending
          const newStatus = task.status === 'Done' ? 'Pending' : 'Done';

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
    setStages: () => {}, // Read-only derived from tasks now
    parties,
    setParties,
    projects,
    setProjects: () => {}, // Handled via query
    addProject,
    addTaskToProject,
    updateProjectTaskStatus,
    billingEntries,
    setBillingEntries: setBillingWrapper,
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
  };
};

