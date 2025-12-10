import { useQuery } from '../services/queryClient';
import { DataService } from '../services/dataService';
import { STORES } from '../services/db';
import { Case, LegalDocument, DocketEntry, WorkflowTask, EvidenceItem, TrialExhibit, Project, Conversation, ResearchSession, Client, User } from '../types';

/**
 * Domain-specific hooks to standardize data fetching and cache keys.
 */

export const useCases = () => useQuery<Case[]>([STORES.CASES, 'all'], DataService.cases.getAll);

export const useDocuments = () => useQuery<LegalDocument[]>([STORES.DOCUMENTS, 'all'], DataService.documents.getAll);

export const useDocket = () => useQuery<DocketEntry[]>([STORES.DOCKET, 'all'], DataService.docket.getAll);

export const useTasks = () => useQuery<WorkflowTask[]>([STORES.TASKS, 'all'], DataService.tasks.getAll);

export const useEvidence = () => useQuery<EvidenceItem[]>([STORES.EVIDENCE, 'all'], DataService.evidence.getAll);

export const useExhibits = (caseId?: string) => useQuery<TrialExhibit[]>(
    [STORES.EXHIBITS, caseId || 'all'],
    () => DataService.trial.getExhibits(caseId)
);

export const useStaff = () => useQuery<any[]>([STORES.STAFF, 'all'], DataService.hr.getStaff);

export const useClients = () => useQuery<Client[]>([STORES.CLIENTS, 'all'], DataService.clients.getAll);

export const useUsers = () => useQuery<User[]>([STORES.USERS, 'all'], DataService.users.getAll);

export const useProjects = (caseId: string) => useQuery<Project[]>(
    [STORES.PROJECTS, caseId], 
    () => DataService.projects.getByCaseId(caseId)
);

export const useConversations = () => useQuery<Conversation[]>(
    [STORES.CONVERSATIONS, 'all'], 
    DataService.messenger.getConversations
);

export const useResearchHistory = () => useQuery<ResearchSession[]>(
    ['research', 'history'], 
    DataService.research.getHistory
);
