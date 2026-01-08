/**
 * Cache Infrastructure for Next.js 16 Server Actions
 *
 * Provides:
 * - Cache tag definitions for all entities
 * - Cache profiles (max, hours, days, weeks)
 * - Revalidation helpers with updateTag/revalidateTag
 * - "use cache" directive support
 */

import { revalidateTag, revalidatePath, unstable_cache } from 'next/cache';

// ============================================================================
// Cache Tag Definitions
// ============================================================================

/**
 * Entity cache tags - used for cache invalidation
 */
export const CacheTags = {
  // Core entities
  CASES: 'cases',
  CASE: (id: string) => `case:${id}`,
  CASE_TEAM: (caseId: string) => `case-team:${caseId}`,
  CASE_FINANCIALS: (caseId: string) => `case-financials:${caseId}`,

  // Matters
  MATTERS: 'matters',
  MATTER: (id: string) => `matter:${id}`,

  // Clients
  CLIENTS: 'clients',
  CLIENT: (id: string) => `client:${id}`,
  CLIENT_CASES: (clientId: string) => `client-cases:${clientId}`,
  CLIENT_INVOICES: (clientId: string) => `client-invoices:${clientId}`,

  // Documents
  DOCUMENTS: 'documents',
  DOCUMENT: (id: string) => `document:${id}`,
  DOCUMENT_VERSIONS: (documentId: string) => `document-versions:${documentId}`,
  DOCUMENT_FOLDER: (folderId: string) => `document-folder:${folderId}`,
  FOLDERS: 'folders',

  // Parties
  PARTIES: 'parties',
  PARTY: (id: string) => `party:${id}`,
  CASE_PARTIES: (caseId: string) => `case-parties:${caseId}`,

  // Billing & Financial
  INVOICES: 'invoices',
  INVOICE: (id: string) => `invoice:${id}`,
  TIME_ENTRIES: 'time-entries',
  TIME_ENTRY: (id: string) => `time-entry:${id}`,
  EXPENSES: 'expenses',
  EXPENSE: (id: string) => `expense:${id}`,
  TRUST_ACCOUNTS: 'trust-accounts',
  TRUST_ACCOUNT: (id: string) => `trust-account:${id}`,

  // Discovery
  DISCOVERY_REQUESTS: 'discovery-requests',
  DISCOVERY_REQUEST: (id: string) => `discovery-request:${id}`,
  DEPOSITIONS: 'depositions',
  DEPOSITION: (id: string) => `deposition:${id}`,

  // Docket
  DOCKET_ENTRIES: 'docket-entries',
  DOCKET_ENTRY: (id: string) => `docket-entry:${id}`,
  CASE_DOCKET: (caseId: string) => `case-docket:${caseId}`,

  // Users & Auth
  USERS: 'users',
  USER: (id: string) => `user:${id}`,
  USER_PROFILE: (userId: string) => `user-profile:${userId}`,

  // Dashboard & Analytics
  DASHBOARD: 'dashboard',
  DASHBOARD_USER: (userId: string) => `dashboard:${userId}`,
  ANALYTICS: 'analytics',
  CASE_ANALYTICS: (caseId: string) => `case-analytics:${caseId}`,

  // Notifications
  NOTIFICATIONS: 'notifications',
  USER_NOTIFICATIONS: (userId: string) => `notifications:${userId}`,

  // Calendar
  CALENDAR: 'calendar',
  COURT_DATES: 'court-dates',
  DEADLINES: 'deadlines',

  // Workflows
  WORKFLOWS: 'workflows',
  WORKFLOW: (id: string) => `workflow:${id}`,
  TASKS: 'tasks',
  TASK: (id: string) => `task:${id}`,
} as const;

// ============================================================================
// Cache Profiles
// ============================================================================

/**
 * Cache duration profiles in seconds
 */
export const CacheProfiles = {
  /** No caching - always fetch fresh */
  NONE: 0,
  /** Real-time data - very short cache (10 seconds) */
  REALTIME: 10,
  /** Fast refresh - 1 minute cache */
  FAST: 60,
  /** Standard cache - 5 minutes */
  DEFAULT: 300,
  /** Moderate cache - 15 minutes */
  MODERATE: 900,
  /** Hourly cache - 1 hour */
  HOURLY: 3600,
  /** Daily cache - 24 hours */
  DAILY: 86400,
  /** Weekly cache - 7 days */
  WEEKLY: 604800,
  /** Monthly cache - 30 days */
  MONTHLY: 2592000,
  /** Maximum cache - 1 year (for immutable data) */
  MAX: 31536000,
} as const;

export type CacheProfileKey = keyof typeof CacheProfiles;
export type CacheDuration = (typeof CacheProfiles)[CacheProfileKey];

// ============================================================================
// Cache Revalidation Helpers
// ============================================================================

/**
 * Revalidate a single cache tag
 * Use for user-initiated actions (updateTag semantics)
 */
export function invalidateTag(tag: string): void {
  revalidateTag(tag);
}

/**
 * Revalidate multiple cache tags
 */
export function invalidateTags(tags: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

/**
 * Revalidate all tags related to an entity
 */
export function invalidateEntity(
  entityType: 'case' | 'matter' | 'client' | 'document' | 'invoice',
  id: string
): void {
  const tagMap: Record<string, string[]> = {
    case: [CacheTags.CASES, CacheTags.CASE(id), CacheTags.CASE_TEAM(id), CacheTags.CASE_FINANCIALS(id)],
    matter: [CacheTags.MATTERS, CacheTags.MATTER(id)],
    client: [CacheTags.CLIENTS, CacheTags.CLIENT(id), CacheTags.CLIENT_CASES(id), CacheTags.CLIENT_INVOICES(id)],
    document: [CacheTags.DOCUMENTS, CacheTags.DOCUMENT(id), CacheTags.DOCUMENT_VERSIONS(id)],
    invoice: [CacheTags.INVOICES, CacheTags.INVOICE(id)],
  };

  invalidateTags(tagMap[entityType] ?? []);
}

/**
 * Revalidate a specific path
 */
export function invalidatePath(path: string, type: 'page' | 'layout' = 'page'): void {
  revalidatePath(path, type);
}

/**
 * Revalidate case and all related data
 */
export function invalidateCaseData(caseId: string): void {
  invalidateTags([
    CacheTags.CASES,
    CacheTags.CASE(caseId),
    CacheTags.CASE_TEAM(caseId),
    CacheTags.CASE_FINANCIALS(caseId),
    CacheTags.CASE_PARTIES(caseId),
    CacheTags.CASE_DOCKET(caseId),
    CacheTags.CASE_ANALYTICS(caseId),
  ]);
}

/**
 * Revalidate client and all related data
 */
export function invalidateClientData(clientId: string): void {
  invalidateTags([
    CacheTags.CLIENTS,
    CacheTags.CLIENT(clientId),
    CacheTags.CLIENT_CASES(clientId),
    CacheTags.CLIENT_INVOICES(clientId),
  ]);
}

/**
 * Revalidate document and related data
 */
export function invalidateDocumentData(documentId: string, folderId?: string): void {
  const tags = [
    CacheTags.DOCUMENTS,
    CacheTags.DOCUMENT(documentId),
    CacheTags.DOCUMENT_VERSIONS(documentId),
  ];

  if (folderId) {
    tags.push(CacheTags.DOCUMENT_FOLDER(folderId));
  }

  invalidateTags(tags);
}

/**
 * Revalidate user-specific data (dashboard, notifications)
 */
export function invalidateUserData(userId: string): void {
  invalidateTags([
    CacheTags.DASHBOARD_USER(userId),
    CacheTags.USER_NOTIFICATIONS(userId),
    CacheTags.USER_PROFILE(userId),
  ]);
}

// ============================================================================
// Cache Configuration Helpers
// ============================================================================

/**
 * Build fetch options with caching configuration
 */
export function buildCacheOptions(
  tags: string[],
  revalidate: CacheDuration = CacheProfiles.DEFAULT
): { next: { tags: string[]; revalidate: number } } {
  return {
    next: {
      tags,
      revalidate,
    },
  };
}

/**
 * Build cache key from parameters
 */
export function buildCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join('&');

  return `${prefix}:${sortedParams}`;
}

// ============================================================================
// Cached Function Wrapper
// ============================================================================

/**
 * Create a cached function with automatic tag management
 *
 * @example
 * ```typescript
 * const getCachedCases = createCachedFn(
 *   'getCases',
 *   async () => {
 *     return await api.getCases();
 *   },
 *   [CacheTags.CASES],
 *   CacheProfiles.DEFAULT
 * );
 * ```
 */
export function createCachedFn<TArgs extends unknown[], TReturn>(
  keyParts: string[],
  fn: (...args: TArgs) => Promise<TReturn>,
  tags: string[],
  revalidate: CacheDuration = CacheProfiles.DEFAULT
): (...args: TArgs) => Promise<TReturn> {
  return unstable_cache(fn, keyParts, {
    tags,
    revalidate,
  });
}

// ============================================================================
// Entity-Specific Cache Builders
// ============================================================================

/**
 * Build cache configuration for a case query
 */
export function caseCacheConfig(caseId?: string) {
  const tags = caseId
    ? [CacheTags.CASES, CacheTags.CASE(caseId)]
    : [CacheTags.CASES];

  return buildCacheOptions(tags, CacheProfiles.DEFAULT);
}

/**
 * Build cache configuration for a client query
 */
export function clientCacheConfig(clientId?: string) {
  const tags = clientId
    ? [CacheTags.CLIENTS, CacheTags.CLIENT(clientId)]
    : [CacheTags.CLIENTS];

  return buildCacheOptions(tags, CacheProfiles.DEFAULT);
}

/**
 * Build cache configuration for a document query
 */
export function documentCacheConfig(documentId?: string) {
  const tags = documentId
    ? [CacheTags.DOCUMENTS, CacheTags.DOCUMENT(documentId)]
    : [CacheTags.DOCUMENTS];

  return buildCacheOptions(tags, CacheProfiles.FAST);
}

/**
 * Build cache configuration for a matter query
 */
export function matterCacheConfig(matterId?: string) {
  const tags = matterId
    ? [CacheTags.MATTERS, CacheTags.MATTER(matterId)]
    : [CacheTags.MATTERS];

  return buildCacheOptions(tags, CacheProfiles.DEFAULT);
}

/**
 * Build cache configuration for dashboard data
 */
export function dashboardCacheConfig(userId: string) {
  return buildCacheOptions(
    [CacheTags.DASHBOARD, CacheTags.DASHBOARD_USER(userId)],
    CacheProfiles.REALTIME
  );
}

/**
 * Build cache configuration for analytics
 */
export function analyticsCacheConfig(caseId?: string) {
  const tags = caseId
    ? [CacheTags.ANALYTICS, CacheTags.CASE_ANALYTICS(caseId)]
    : [CacheTags.ANALYTICS];

  return buildCacheOptions(tags, CacheProfiles.HOURLY);
}

// ============================================================================
// Type Exports
// ============================================================================

export type CacheTag = (typeof CacheTags)[keyof typeof CacheTags] | string;
export type { CacheDuration as CacheRevalidateTime };
