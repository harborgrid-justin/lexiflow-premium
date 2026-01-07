/**
 * Workflow Query Keys for React Query
 */

export const WORKFLOW_QUERY_KEYS = {
  templates: {
    all: () => ["workflow", "templates"] as const,
    byId: (id: string) => ["workflow", "templates", id] as const,
    byCategory: (category: string) =>
      ["workflow", "templates", "category", category] as const,
    active: () => ["workflow", "templates", "active"] as const,
  },
  instances: {
    all: () => ["workflow", "instances"] as const,
    byId: (id: string) => ["workflow", "instances", id] as const,
    byCase: (caseId: string) =>
      ["workflow", "instances", "case", caseId] as const,
    byMatter: (matterId: string) =>
      ["workflow", "instances", "matter", matterId] as const,
    active: () => ["workflow", "instances", "active"] as const,
  },
  analytics: {
    all: () => ["workflow", "analytics"] as const,
  },
} as const;
