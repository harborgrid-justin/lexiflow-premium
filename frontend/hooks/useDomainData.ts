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
import { queryKeys } from '../utils/queryKeys';

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
    useQuery<Case[]>(queryKeys.cases.all(), () => DataService.cases.getAll());

export const useDocuments = () => 
    useQuery<LegalDocument[]>(queryKeys.documents.all(), () => DataService.documents.getAll());

export const useDocket = () => 
    useQuery<DocketEntry[]>(queryKeys.docket.all(), () => DataService.docket.getAll());

export const useTasks = () => 
    useQuery<WorkflowTask[]>(queryKeys.tasks.all(), () => DataService.tasks.getAll());

export const useEvidence = () => 
    useQuery<EvidenceItem[]>(queryKeys.evidence.all(), () => DataService.evidence.getAll());

export const useExhibits = (caseId?: string) => 
    useQuery<TrialExhibit[]>(
        queryKeys.exhibits.byCaseId(caseId || "all"),
        () => DataService.trial.getExhibits(caseId)
    );

export const useStaff = () => 
    useQuery<any[]>(queryKeys.staff.all(), () => DataService.hr.getStaff());

export const useClients = () => 
    useQuery<Client[]>(queryKeys.clients.all(), () => DataService.clients.getAll());

export const useUsers = () => 
    useQuery<User[]>(queryKeys.users.all(), () => DataService.users.getAll());

export const useProjects = (caseId: string) => 
    useQuery<Project[]>(
        queryKeys.projects.byCaseId(caseId), 
        () => DataService.projects.getByCaseId(caseId)
    );

export const useConversations = () => 
    useQuery<Conversation[]>(
        ['conversations', 'all'], 
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
