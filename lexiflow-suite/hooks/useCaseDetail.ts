
import { useState, useMemo } from 'react';
import { Case, LegalDocument, WorkflowStage, TimeEntry, TimelineEvent, Party, Project, WorkflowTask } from '../types.ts';
import { GeminiService } from '../services/geminiService.ts';
import { MOCK_DOCUMENTS } from '../data/mockDocuments.ts';
import { MOCK_STAGES } from '../data/mockWorkflow.ts';
import { MOCK_TIME_ENTRIES } from '../data/mockBilling.ts';
import { MOCK_MOTIONS } from '../data/mockMotions.ts';
import { DataService } from '../services/dataService.ts';

export const useCaseDetail = (caseData: Case) => {
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Guideline 1: Initialize state with functional update if logic is heavy, but here straightforward filtering is fine.
  // Using a unique key for the component when switching cases is better than effects to reset state, 
  // but since we're inside a hook, we rely on the parent component to key the CaseDetail component or use useEffect to reset.
  // Given the structure, we'll initialize lazily.
  const [documents, setDocuments] = useState<LegalDocument[]>(() => {
    const docs = MOCK_DOCUMENTS.filter(d => d.caseId === caseData.id);
    return docs.length > 0 ? docs : MOCK_DOCUMENTS.slice(0, 1);
  });
  
  const [stages, setStages] = useState<WorkflowStage[]>(MOCK_STAGES);
  const [parties, setParties] = useState<Party[]>(caseData.parties || []);
  
  // Initialize Projects (Mock data if none exist on case)
  const [projects, setProjects] = useState<Project[]>(() => caseData.projects || [
    {
      id: 'proj-1',
      title: 'Deposition Preparation Phase 1',
      status: 'Active',
      priority: 'High',
      description: 'Prepare exhibits and outlines for key witness depositions (CEO, CFO).',
      lead: 'Alexandra H.',
      dueDate: '2024-04-15',
      tasks: [
        { id: 't-p1', title: 'Review CEO Emails 2022-2023', status: 'In Progress', assignee: 'James Doe', priority: 'High', dueDate: '2024-03-25', relatedModule: 'Discovery', actionLabel: 'View Documents' },
        { id: 't-p2', title: 'Draft Outline for CFO', status: 'Pending', assignee: 'Alexandra H.', priority: 'Medium', dueDate: '2024-04-01' }
      ]
    },
    {
      id: 'proj-2',
      title: 'Settlement Strategy',
      status: 'Planning',
      priority: 'Medium',
      description: 'Calculate damages model and prepare initial offer letter.',
      lead: 'Partner Committee',
      dueDate: '2024-05-01',
      tasks: [
        { id: 't-p3', title: 'Damages Analysis', status: 'Done', assignee: 'Finance Team', priority: 'High', dueDate: '2024-03-10', relatedModule: 'Billing', actionLabel: 'View Report' }
      ]
    }
  ]);
  
  const [billingEntries, setBillingEntries] = useState<TimeEntry[]>(() => {
    const entries = MOCK_TIME_ENTRIES.filter(e => e.caseId === caseData.id);
    return entries.length > 0 ? entries : MOCK_TIME_ENTRIES.slice(0, 2);
  });

  const [generatingWorkflow, setGeneratingWorkflow] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [draftResult, setDraftResult] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // Guideline 3 & 8: Memoize timeline events
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    events.push({ id: 'init', date: caseData.filingDate, title: 'Case Filed', type: 'milestone', description: `Filed in ${caseData.court}` });
    
    // Documents
    documents.forEach(d => {
        events.push({ id: d.id, date: d.uploadDate, title: `Doc Upload: ${d.title}`, type: 'document', description: d.summary || d.type, relatedId: d.id });
    });
    
    // Tasks
    stages.forEach(s => {
        s.tasks.forEach(t => {
            if(t.status === 'Done') events.push({ id: t.id, date: t.dueDate, title: `Task Completed: ${t.title}`, type: 'task', description: `Assigned to ${t.assignee}`, relatedId: t.id });
        });
    });
    
    // Billing
    billingEntries.forEach(b => {
        events.push({ id: b.id, date: b.date, title: 'Billable Time Logged', type: 'billing', description: `${(b.duration/60).toFixed(1)}h - ${b.description}`, relatedId: b.id });
    });

    // Motions & Hearings (NEW)
    const relevantMotions = MOCK_MOTIONS.filter(m => m.caseId === caseData.id);
    relevantMotions.forEach(m => {
        if(m.filingDate) {
            events.push({ id: `mot-file-${m.id}`, date: m.filingDate, title: `Motion Filed: ${m.title}`, type: 'motion', description: `Type: ${m.type} | Status: ${m.status}`, relatedId: m.id });
        }
        if(m.hearingDate) {
            events.push({ id: `mot-hear-${m.id}`, date: m.hearingDate, title: `Hearing Scheduled: ${m.title}`, type: 'hearing', description: `Court Appearance Required`, relatedId: m.id });
        }
    });

    return events.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [caseData.id, caseData.filingDate, caseData.court, documents, stages, billingEntries]);

  const handleAnalyze = async (doc: LegalDocument) => {
    setAnalyzingId(doc.id);
    const result = await GeminiService.analyzeDocument(doc.content);
    setDocuments(docs => docs.map(d => d.id === doc.id ? { ...d, summary: result.summary, riskScore: result.riskScore } : d));
    setAnalyzingId(null);
  };

  const handleDraft = async () => {
    if(!draftPrompt.trim()) return;
    setIsDrafting(true);
    const text = await GeminiService.generateDraft(`${draftPrompt}\n\nCase: ${caseData.title}\nClient: ${caseData.client}`, 'Motion/Clause');
    setDraftResult(text);
    setIsDrafting(false);
  };

  const handleGenerateWorkflow = async () => {
    setGeneratingWorkflow(true);
    const suggestedStages = await GeminiService.generateWorkflow(caseData.description);
    const newStages: WorkflowStage[] = suggestedStages.map((s, idx) => ({
      id: `gen-stage-${idx}`, title: s.title, status: idx === 0 ? 'Active' : 'Pending',
      tasks: s.tasks.map((t, tIdx) => ({ id: `gen-task-${idx}-${tIdx}`, title: t, status: 'Pending', assignee: 'Unassigned', dueDate: '2024-05-01', priority: 'Medium' }))
    }));
    setStages([...stages, ...newStages]);
    setGeneratingWorkflow(false);
  };

  // Project Handlers
  const addProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const addTaskToProject = (projectId: string, task: WorkflowTask) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, tasks: [...p.tasks, task] };
      }
      return p;
    }));
  };

  const updateProjectTaskStatus = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => {
        if (p.id !== projectId) return p;
        const newTasks = p.tasks.map(t => {
            if (t.id === taskId) {
                const newStatus: 'Pending' | 'In Progress' | 'Review' | 'Done' = t.status === 'Done' ? 'Pending' : 'Done';
                return { ...t, status: newStatus };
            }
            return t;
        });
        
        return { ...p, tasks: newTasks };
    }));
  };

  return {
    activeTab,
    setActiveTab,
    documents,
    setDocuments,
    stages,
    setStages,
    parties,
    setParties,
    projects,
    setProjects,
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
    handleAnalyze,
    handleDraft,
    handleGenerateWorkflow
  };
};
