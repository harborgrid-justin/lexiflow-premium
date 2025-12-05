
import { useState, useMemo } from 'react';
import { Case, LegalDocument, WorkflowStage, TimeEntry, TimelineEvent, Party, Project, WorkflowTask, Motion } from '../types';
import { GeminiService } from '../services/geminiService';
import { DataService } from '../services/dataService';
import { useQuery, useMutation, queryClient } from '../services/queryClient';
import { STORES } from '../services/db';

export const useCaseDetail = (caseData: Case, initialTab: string = 'Overview') => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [generatingWorkflow, setGeneratingWorkflow] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [draftResult, setDraftResult] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // --- DATA QUERIES (Parallel Fetching) ---
  
  // 1. Documents
  const { data: documents = [], isLoading: loadingDocs } = useQuery<LegalDocument[]>(
    [STORES.DOCUMENTS, caseData.id],
    () => DataService.documents.getByCaseId(caseData.id)
  );

  // 2. Tasks / Workflow
  const { data: allTasks = [] } = useQuery<WorkflowTask[]>(
    [STORES.TASKS, caseData.id],
    () => DataService.tasks.getByCaseId(caseData.id)
  );

  // 3. Billing
  const { data: billingEntries = [] } = useQuery<TimeEntry[]>(
    [STORES.BILLING, caseData.id],
    () => DataService.billing.getTimeEntries(caseData.id)
  );

  // 4. Motions
  const { data: motions = [] } = useQuery<Motion[]>(
    [STORES.MOTIONS, caseData.id],
    () => DataService.motions.getByCaseId(caseData.id)
  );

  // 5. Projects
  const { data: projects = [] } = useQuery<Project[]>(
    [STORES.PROJECTS, caseData.id],
    () => DataService.projects.getByCaseId(caseData.id)
  );

  // Local state for parties (as they are often edited locally before save)
  const [parties, setParties] = useState<Party[]>(caseData.parties || []);

  // Derived Stages from Tasks (Simulating workflow engine)
  const stages = useMemo(() => {
    if (allTasks.length === 0) return [];
    // In a real app, stages would be their own entity. 
    // Here we map a mock stage structure
    return [
        { id: 's1', title: 'Active Tasks', status: 'Active', tasks: allTasks.filter(t => t.status !== 'Done') },
        { id: 's2', title: 'Completed', status: 'Completed', tasks: allTasks.filter(t => t.status === 'Done') }
    ] as WorkflowStage[];
  }, [allTasks]);

  // --- COMPUTED ---

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    events.push({ id: 'init', date: caseData.filingDate, title: 'Case Filed', type: 'milestone', description: `Filed in ${caseData.court}` });
    
    documents.forEach(d => {
        events.push({ id: d.id, date: d.uploadDate, title: `Doc Upload: ${d.title}`, type: 'document', description: d.summary || d.type, relatedId: d.id });
    });
    
    billingEntries.forEach(b => {
        events.push({ id: b.id, date: b.date, title: 'Billable Time Logged', type: 'billing', description: `${(b.duration/60).toFixed(1)}h - ${b.description}`, relatedId: b.id });
    });

    motions.forEach(m => {
        if(m.filingDate) {
            events.push({ id: `mot-file-${m.id}`, date: m.filingDate, title: `Motion Filed: ${m.title}`, type: 'motion', description: `Type: ${m.type} | Status: ${m.status}`, relatedId: m.id });
        }
        if(m.hearingDate) {
            events.push({ id: `mot-hear-${m.id}`, date: m.hearingDate, title: `Hearing Scheduled: ${m.title}`, type: 'hearing', description: `Court Appearance Required`, relatedId: m.id });
        }
    });

    return events.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [caseData, documents, billingEntries, motions]);

  // --- ACTIONS ---

  const { mutate: updateDocuments } = useMutation(
      (doc: LegalDocument) => DataService.documents.update(doc.id, doc),
      { invalidateKeys: [[STORES.DOCUMENTS, caseData.id]] }
  );

  const handleAnalyze = async (doc: LegalDocument) => {
    setAnalyzingId(doc.id);
    try {
        const result = await GeminiService.analyzeDocument(doc.content);
        const updated = { ...doc, summary: result.summary, riskScore: result.riskScore };
        updateDocuments(updated); // Optimistic update via mutation
    } catch (e) {
        console.error("Analysis failed", e);
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
    } finally {
        setIsDrafting(false);
    }
  };

  const handleGenerateWorkflow = async () => {
    setGeneratingWorkflow(true);
    // In real app, this would call a mutation to add tasks to DB
    setTimeout(() => setGeneratingWorkflow(false), 1500);
  };

  const setDocumentsWrapper = (newDocs: LegalDocument[] | ((prev: LegalDocument[]) => LegalDocument[])) => {
     // This is a compatibility wrapper for components expecting setState
     // Ideally, we perform mutations, but for local UI updates without refetch:
     queryClient.setQueryData([STORES.DOCUMENTS, caseData.id], newDocs);
  };
  
  const setBillingWrapper = (newEntries: TimeEntry[]) => {
      queryClient.setQueryData([STORES.BILLING, caseData.id], newEntries);
  };

  // Compatibility wrappers for the existing UI that expects addProject callbacks
  const addProject = async (project: Project) => {
      // Optimistic update
      queryClient.setQueryData([STORES.PROJECTS, caseData.id], [...projects, project]);
  };

  const addTaskToProject = (projectId: string, task: WorkflowTask) => {
      // Logic handled in components via direct DB calls mostly, 
      // but this forces a refresh of the projects query
      queryClient.invalidate([STORES.PROJECTS, caseData.id]);
      queryClient.invalidate([STORES.TASKS, caseData.id]);
  };

  const updateProjectTaskStatus = (projectId: string, taskId: string) => {
      // Logic placeholder
      console.log("Update task status", projectId, taskId);
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
