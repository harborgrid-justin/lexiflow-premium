/**
 * @module hooks/useDomainData
 * @category Hooks - Data Access
 * @description Centralized domain-specific data fetching hooks with standardized cache keys. Provides
 * typed hooks for all major entities. Prevents magic string cache keys across components.
 * * NO THEME USAGE: Data access utility hooks for domain entities
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../services/data/dataService';
import { STORES } from '../services/data/db';

// CRITICAL FIX: Import useQuery from the Hooks layer, not the Infrastructure layer
import { useQuery } from './useQueryHooks'; 

// Types
import { 
    Case, LegalDocument, DocketEntry, WorkflowTask, EvidenceItem, 
    TrialExhibit, Project, Conversation, ResearchSession, Client, User,
    SchemaTable, PipelineJob, Connector, DataDictionaryItem
} from '../types';

// ============================================================================
// DOMAIN DATA HOOKS
// ============================================================================

// --- CORE LEGAL ---
export const useCases = () => 
    useQuery<Case[]>([STORES.CASES, 'all'], () => DataService.cases.getAll());

export const useDocuments = () => 
    useQuery<LegalDocument[]>([STORES.DOCUMENTS, 'all'], () => DataService.documents.getAll());

export const useDocket = () => 
    useQuery<DocketEntry[]>([STORES.DOCKET, 'all'], () => DataService.docket.getAll());

export const useTasks = () => 
    useQuery<WorkflowTask[]>([STORES.TASKS, 'all'], () => DataService.tasks.getAll());

export const useEvidence = () => 
    useQuery<EvidenceItem[]>([STORES.EVIDENCE, 'all'], () => DataService.evidence.getAll());

export const useExhibits = (caseId?: string) => 
    useQuery<TrialExhibit[]>(
        [STORES.EXHIBITS, caseId || 'all'],
        () => DataService.trial.getExhibits(caseId)
    );

export const useStaff = () => 
    useQuery<any[]>([STORES.STAFF, 'all'], () => DataService.hr.getStaff());

export const useClients = () => 
    useQuery<Client[]>([STORES.CLIENTS, 'all'], () => DataService.clients.getAll());

export const useUsers = () => 
    useQuery<User[]>([STORES.USERS, 'all'], () => DataService.users.getAll());

export const useProjects = (caseId: string) => 
    useQuery<Project[]>(
        [STORES.PROJECTS, caseId], 
        () => DataService.projects.getByCaseId(caseId)
    );

export const useConversations = () => 
    useQuery<Conversation[]>(
        [STORES.CONVERSATIONS, 'all'], 
        () => DataService.messenger.getConversations()
    );

export const useResearchHistory = () => 
    useQuery<ResearchSession[]>(
        ['research', 'history'], 
        () => DataService.research.getHistory()
    );

// --- DATA PLATFORM / ADMIN ---
export const useSchemaTables = () => 
    useQuery<SchemaTable[]>(
        ['schema', 'tables'],
        () => DataService.catalog.getSchemaTables()
    );

export const usePipelines = () => 
    useQuery<PipelineJob[]>(
        ['admin', 'pipelines'],
        () => DataService.admin.getPipelines()
    );

export const useConnectors = () => 
    useQuery<Connector[]>(
        ['admin', 'connectors'],
        () => DataService.admin.getConnectors()
    );

export const useDataDictionary = () => 
    useQuery<DataDictionaryItem[]>(
        ['catalog', 'dictionary'],
        () => DataService.catalog.getDictionary()
    );