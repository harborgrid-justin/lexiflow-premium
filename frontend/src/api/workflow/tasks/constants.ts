/**
 * Task Query Keys for React Query
 */

export const TASKS_QUERY_KEYS = {
  all: () => ["tasks"] as const,
  lists: () => ["tasks", "list"] as const,
  list: (filters?: string) => ["tasks", "list", filters] as const,
  details: () => ["tasks", "detail"] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
  byCase: (caseId: string) => ["tasks", "case", caseId] as const,
  byAssignee: (userId: string) => ["tasks", "assignee", userId] as const,
  statistics: () => ["tasks", "statistics"] as const,
  overdue: () => ["tasks", "overdue"] as const,
  upcoming: () => ["tasks", "upcoming"] as const,
  completed: () => ["tasks", "completed"] as const,
} as const;
