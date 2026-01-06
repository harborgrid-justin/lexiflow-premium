/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.depositions.all() });
 * queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.depositions.byCase(caseId) });
 */
export const DISCOVERY_QUERY_KEYS = {
  // Collections
  collections: {
    all: () => ["discovery", "collections"] as const,
    byId: (id: string) => ["discovery", "collections", id] as const,
    byCase: (caseId: string) =>
      ["discovery", "collections", "case", caseId] as const,
  },
  // Processing Jobs
  processing: {
    all: () => ["discovery", "processing"] as const,
    byId: (id: string) => ["discovery", "processing", id] as const,
    byCase: (caseId: string) =>
      ["discovery", "processing", "case", caseId] as const,
  },
  // Depositions
  depositions: {
    all: () => ["discovery", "depositions"] as const,
    byId: (id: string) => ["discovery", "depositions", id] as const,
    byCase: (caseId: string) =>
      ["discovery", "depositions", "case", caseId] as const,
  },
  // ESI Sources
  esiSources: {
    all: () => ["discovery", "esi-sources"] as const,
    byId: (id: string) => ["discovery", "esi-sources", id] as const,
    byCase: (caseId: string) =>
      ["discovery", "esi-sources", "case", caseId] as const,
  },
  // Productions
  productions: {
    all: () => ["discovery", "productions"] as const,
    byId: (id: string) => ["discovery", "productions", id] as const,
    byCase: (caseId: string) =>
      ["discovery", "productions", "case", caseId] as const,
  },
  // Custodians
  custodians: {
    all: () => ["discovery", "custodians"] as const,
    byId: (id: string) => ["discovery", "custodians", id] as const,
    byCase: (caseId: string) =>
      ["discovery", "custodians", "case", caseId] as const,
    stats: () => ["discovery", "custodians", "stats"] as const,
  },
  // Interviews
  interviews: {
    all: () => ["discovery", "interviews"] as const,
    byId: (id: string) => ["discovery", "interviews", id] as const,
    byCase: (caseId: string) =>
      ["discovery", "interviews", "case", caseId] as const,
  },
  // Discovery Requests
  requests: {
    all: () => ["discovery", "requests"] as const,
    byId: (id: string) => ["discovery", "requests", id] as const,
    byCase: (caseId: string) =>
      ["discovery", "requests", "case", caseId] as const,
  },
  // Legal Holds
  legalHolds: {
    all: () => ["discovery", "legal-holds"] as const,
    byId: (id: string) => ["discovery", "legal-holds", id] as const,
  },
  // Privilege Log
  privilegeLog: {
    all: () => ["discovery", "privilege-log"] as const,
    byId: (id: string) => ["discovery", "privilege-log", id] as const,
  },
  // Review & Processing
  reviewBatches: {
    all: () => ["discovery", "review-batches"] as const,
    byCase: (caseId: string) =>
      ["discovery", "review-batches", "case", caseId] as const,
  },
  processingJobs: {
    all: () => ["discovery", "processing-jobs"] as const,
    byId: (id: string) => ["discovery", "processing-jobs", id] as const,
  },
  // Extended discovery
  examinations: {
    all: () => ["discovery", "examinations"] as const,
    byCase: (caseId: string) =>
      ["discovery", "examinations", "case", caseId] as const,
  },
  transcripts: {
    all: () => ["discovery", "transcripts"] as const,
    byCase: (caseId: string) =>
      ["discovery", "transcripts", "case", caseId] as const,
  },
  vendors: {
    all: () => ["discovery", "vendors"] as const,
  },
  sanctions: {
    all: () => ["discovery", "sanctions"] as const,
    byCase: (caseId: string) =>
      ["discovery", "sanctions", "case", caseId] as const,
  },
  stipulations: {
    all: () => ["discovery", "stipulations"] as const,
    byCase: (caseId: string) =>
      ["discovery", "stipulations", "case", caseId] as const,
  },
  // Analytics
  funnelStats: () => ["discovery", "analytics", "funnel"] as const,
} as const;
