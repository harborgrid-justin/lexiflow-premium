/**
 * Query Key Types for React Query Integration
 * 
 * This file provides TypeScript types for all query keys used across the application.
 * These types ensure type safety when using React Query for cache management.
 * 
 * @module QueryKeyTypes
 */

/**
 * Generic query key type for entity-based queries
 * Ensures consistent structure across all query keys
 */
export type GenericEntityQueryKeys<TEntity extends string> = {
  all: () => readonly [TEntity];
  byId: (id: string) => readonly [TEntity, string];
  byCase: (caseId: string) => readonly [TEntity, 'case', string];
  search: (query: string) => readonly [TEntity, 'search', string];
  filter: (filter: Record<string, unknown>) => readonly [TEntity, 'filter', Record<string, unknown>];
};

/**
 * Billing query key types
 */
export type BillingQueryKeys = {
  timeEntries: {
    all: () => readonly ['billing', 'timeEntries'];
    byId: (id: string) => readonly ['billing', 'timeEntries', string];
    byCase: (caseId: string) => readonly ['billing', 'timeEntries', 'case', string];
    byUser: (userId: string) => readonly ['billing', 'timeEntries', 'user', string];
    byStatus: (status: string) => readonly ['billing', 'timeEntries', 'status', string];
  };
  invoices: {
    all: () => readonly ['billing', 'invoices'];
    byId: (id: string) => readonly ['billing', 'invoices', string];
    byCase: (caseId: string) => readonly ['billing', 'invoices', 'case', string];
    byClient: (clientId: string) => readonly ['billing', 'invoices', 'client', string];
    byStatus: (status: string) => readonly ['billing', 'invoices', 'status', string];
  };
  trustAccounts: {
    all: () => readonly ['billing', 'trustAccounts'];
    byId: (id: string) => readonly ['billing', 'trustAccounts', string];
    transactions: (accountId: string) => readonly ['billing', 'trustAccounts', string, 'transactions'];
  };
  stats: {
    wip: (caseId?: string) => readonly ['billing', 'stats', 'wip', string?];
    realization: (period?: string) => readonly ['billing', 'stats', 'realization', string?];
    overview: () => readonly ['billing', 'stats', 'overview'];
    performance: (period: string) => readonly ['billing', 'stats', 'performance', string];
  };
  rates: {
    all: () => readonly ['billing', 'rates'];
    byTimekeeper: (timekeeperId: string) => readonly ['billing', 'rates', 'timekeeper', string];
  };
};

/**
 * Workflow query key types
 */
export type WorkflowQueryKeys = {
  processes: {
    all: () => readonly ['workflow', 'processes'];
    byId: (id: string) => readonly ['workflow', 'processes', string];
    byCase: (caseId: string) => readonly ['workflow', 'processes', 'case', string];
    byStatus: (status: string) => readonly ['workflow', 'processes', 'status', string];
  };
  templates: {
    all: () => readonly ['workflow', 'templates'];
    byId: (id: string) => readonly ['workflow', 'templates', string];
    byCategory: (category: string) => readonly ['workflow', 'templates', 'category', string];
  };
  tasks: {
    all: () => readonly ['workflow', 'tasks'];
    byProcess: (processId: string) => readonly ['workflow', 'tasks', 'process', string];
    byAssignee: (userId: string) => readonly ['workflow', 'tasks', 'assignee', string];
  };
  analytics: {
    all: () => readonly ['workflow', 'analytics'];
    byPeriod: (period: string) => readonly ['workflow', 'analytics', 'period', string];
  };
};

/**
 * Trial query key types
 */
export type TrialQueryKeys = {
  exhibits: {
    all: () => readonly ['trial', 'exhibits'];
    byId: (id: string) => readonly ['trial', 'exhibits', string];
    byCase: (caseId: string) => readonly ['trial', 'exhibits', 'case', string];
    byStatus: (status: string) => readonly ['trial', 'exhibits', 'status', string];
  };
  jurors: {
    all: () => readonly ['trial', 'jurors'];
    byCase: (caseId: string) => readonly ['trial', 'jurors', 'case', string];
    byStatus: (status: string) => readonly ['trial', 'jurors', 'status', string];
  };
  witnesses: {
    all: () => readonly ['trial', 'witnesses'];
    byCase: (caseId: string) => readonly ['trial', 'witnesses', 'case', string];
    byType: (type: string) => readonly ['trial', 'witnesses', 'type', string];
  };
  facts: {
    byCase: (caseId: string) => readonly ['trial', 'facts', 'case', string];
  };
};

/**
 * Template query key types
 */
export type TemplateQueryKeys = {
  all: () => readonly ['templates'];
  byId: (id: string) => readonly ['templates', string];
  byCategory: (category: string) => readonly ['templates', 'category', string];
  byType: (type: string) => readonly ['templates', 'type', string];
  search: (query: string) => readonly ['templates', 'search', string];
};

/**
 * Organization query key types
 */
export type OrganizationQueryKeys = {
  all: () => readonly ['organizations'];
  byId: (id: string) => readonly ['organizations', string];
  byType: (type: string) => readonly ['organizations', 'type', string];
  byJurisdiction: (jurisdiction: string) => readonly ['organizations', 'jurisdiction', string];
  search: (query: string) => readonly ['organizations', 'search', string];
};

/**
 * User query key types
 */
export type UserQueryKeys = {
  all: () => readonly ['users'];
  byId: (id: string) => readonly ['users', string];
  byRole: (role: string) => readonly ['users', 'role', string];
  byDepartment: (department: string) => readonly ['users', 'department', string];
  search: (query: string) => readonly ['users', 'search', string];
};

/**
 * Risk query key types
 */
export type RiskQueryKeys = {
  all: () => readonly ['risks'];
  byId: (id: string) => readonly ['risks', string];
  byCase: (caseId: string) => readonly ['risks', 'case', string];
  byImpact: (impact: string) => readonly ['risks', 'impact', string];
  byProbability: (probability: string) => readonly ['risks', 'probability', string];
  byStatus: (status: string) => readonly ['risks', 'status', string];
};

/**
 * Entity query key types
 */
export type EntityQueryKeys = {
  all: () => readonly ['entities'];
  byId: (id: string) => readonly ['entities', string];
  byType: (type: string) => readonly ['entities', 'type', string];
  byCase: (caseId: string) => readonly ['entities', 'case', string];
  search: (query: string) => readonly ['entities', 'search', string];
};

/**
 * Rule query key types
 */
export type RuleQueryKeys = {
  all: () => readonly ['rules'];
  byId: (id: string) => readonly ['rules', string];
  byJurisdiction: (jurisdiction: string) => readonly ['rules', 'jurisdiction', string];
  byType: (type: string) => readonly ['rules', 'type', string];
  byCategory: (category: string) => readonly ['rules', 'category', string];
  search: (query: string) => readonly ['rules', 'search', string];
};

/**
 * Analysis query key types
 */
export type AnalysisQueryKeys = {
  sessions: {
    all: () => readonly ['analysis', 'sessions'];
    byId: (id: string) => readonly ['analysis', 'sessions', string];
    byCase: (caseId: string) => readonly ['analysis', 'sessions', 'case', string];
  };
  judgeProfiles: {
    all: () => readonly ['analysis', 'judgeProfiles'];
    byJudge: (judgeName: string) => readonly ['analysis', 'judgeProfiles', string];
  };
  counselProfiles: {
    all: () => readonly ['analysis', 'counselProfiles'];
    byCounsel: (counselName: string) => readonly ['analysis', 'counselProfiles', string];
  };
  predictions: {
    byCase: (caseId: string) => readonly ['analysis', 'predictions', 'case', string];
  };
};

/**
 * Utility type for extracting query key from query key object
 */
export type QueryKey = readonly (string | number | Record<string, unknown> | undefined)[];

/**
 * Type guard to check if a value is a valid query key
 */
export function isQueryKey(value: unknown): value is QueryKey {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'string' || 
    typeof item === 'number' || 
    typeof item === 'undefined' ||
    (typeof item === 'object' && item !== null)
  );
}

/**
 * Type for query options with type-safe query keys
 */
export type TypedQueryOptions<TData = unknown, TError = Error> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
};

/**
 * Type for mutation options with type-safe mutation keys
 */
export type TypedMutationOptions<TData = unknown, TVariables = unknown, TError = Error> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
};
