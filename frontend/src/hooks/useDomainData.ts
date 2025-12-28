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
import { DataService } from '@/services';
import { queryKeys } from '@/utils/queryKeys';

// CRITICAL FIX: Import useQuery from the Hooks layer, not the Infrastructure layer
import { useQuery } from './useQueryHooks'; 
import type { QueryState } from '@/services/infrastructure/queryTypes';

// Types
import { 
    Case, LegalDocument, DocketEntry, WorkflowTask, EvidenceItem, 
    TrialExhibit, Project, Conversation, ResearchSession, Client, User,
    SchemaTable, PipelineJob, Connector, DataDictionaryItem
} from '@/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Standard query result with data, loading, and error states.
 */
export interface UseQueryResult<T> extends QueryState<T> {
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<T>;
}

// ============================================================================
// DOMAIN DATA HOOKS
// ============================================================================

// --- CORE LEGAL ---

/**
 * Fetch all cases from the data service.
 */
export function useCases(): UseQueryResult<Case[]> {
    return useQuery<Case[]>(queryKeys.cases.all(), () => DataService.cases.getAll());
}

/**
 * Fetch all documents from the data service.
 */
export function useDocuments(): UseQueryResult<LegalDocument[]> {
    return useQuery<LegalDocument[]>(queryKeys.documents.all(), () => DataService.documents.getAll());
}

/**
 * Fetch all docket entries from the data service.
 */
export function useDocket(): UseQueryResult<DocketEntry[]> {
    return useQuery<DocketEntry[]>(queryKeys.docket.all(), () => DataService.docket.getAll());
}

/**
 * Fetch all workflow tasks from the data service.
 */
export function useTasks(): UseQueryResult<WorkflowTask[]> {
    return useQuery<WorkflowTask[]>(queryKeys.tasks.all(), () => DataService.tasks.getAll());
}

/**
 * Fetch all evidence items from the data service.
 */
export function useEvidence(): UseQueryResult<EvidenceItem[]> {
    return useQuery<EvidenceItem[]>(queryKeys.evidence.all(), () => DataService.evidence.getAll());
}

/**
 * Fetch trial exhibits, optionally filtered by case ID.
 */
export function useExhibits(caseId?: string): UseQueryResult<TrialExhibit[]> {
    return useQuery<TrialExhibit[]>(
        queryKeys.exhibits.byCaseId(caseId || "all"),
        () => DataService.trial.getExhibits(caseId)
    );
}

/**
 * Fetch all staff members from the data service.
 */
export function useStaff(): UseQueryResult<User[]> {
    return useQuery<User[]>(queryKeys.staff.all(), () => DataService.hr.getStaff());
}

/**
 * Fetch all clients from the data service.
 */
export function useClients(): UseQueryResult<Client[]> {
    return useQuery<Client[]>(queryKeys.clients.all(), () => DataService.clients.getAll());
}

/**
 * Fetch all users from the data service.
 */
export function useUsers(): UseQueryResult<User[]> {
    return useQuery<User[]>(queryKeys.users.all(), () => DataService.users.getAll());
}

/**
 * Fetch projects for a specific case.
 */
export function useProjects(caseId: string): UseQueryResult<Project[]> {
    return useQuery<Project[]>(
        queryKeys.projects.byCaseId(caseId), 
        () => DataService.projects.getByCaseId(caseId)
    );
}

/**
 * Fetch all messenger conversations.
 */
export function useConversations(): UseQueryResult<Conversation[]> {
    return useQuery<Conversation[]>(
        ['conversations', 'all'], 
        () => DataService.messenger.getConversations()
    );
}

/**
 * Fetch research session history.
 */
export function useResearchHistory(): UseQueryResult<ResearchSession[]> {
    return useQuery<ResearchSession[]>(
        ['research', 'history'], 
        () => DataService.research.getHistory()
    );
}

// --- DATA PLATFORM / ADMIN ---

/**
 * Fetch schema tables from the data catalog.
 */
export function useSchemaTables(): UseQueryResult<SchemaTable[]> {
    return useQuery<SchemaTable[]>(
        ['schema', 'tables'],
        () => DataService.catalog.getSchemaTables()
    );
}

/**
 * Fetch pipeline jobs from admin service.
 */
export function usePipelines(): UseQueryResult<PipelineJob[]> {
    return useQuery<PipelineJob[]>(
        ['admin', 'pipelines'],
        () => DataService.admin.getPipelines()
    );
}

/**
 * Fetch connectors from admin service.
 */
export function useConnectors(): UseQueryResult<Connector[]> {
    return useQuery<Connector[]>(
        ['admin', 'connectors'],
        () => DataService.admin.getConnectors()
    );
}

/**
 * Fetch data dictionary items from the catalog.
 */
export function useDataDictionary(): UseQueryResult<DataDictionaryItem[]> {
    return useQuery<DataDictionaryItem[]>(
        ['catalog', 'dictionary'],
        () => DataService.catalog.getDictionary()
    );
}
