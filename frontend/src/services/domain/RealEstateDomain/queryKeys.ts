/**
 * RealEstateDomain Query Keys
 * React Query cache keys for real estate operations
 */

export const REAL_ESTATE_QUERY_KEYS = {
  all: () => ["real-estate"] as const,
  properties: () => ["real-estate", "properties"] as const,
  property: (id: string) => ["real-estate", "properties", id] as const,
  disposals: () => ["real-estate", "disposals"] as const,
  encroachments: () => ["real-estate", "encroachments"] as const,
  acquisitions: () => ["real-estate", "acquisitions"] as const,
  utilization: () => ["real-estate", "utilization"] as const,
  costShares: () => ["real-estate", "cost-shares"] as const,
  outgrants: () => ["real-estate", "outgrants"] as const,
  solicitations: () => ["real-estate", "solicitations"] as const,
  relocations: () => ["real-estate", "relocations"] as const,
  auditItems: () => ["real-estate", "audit-items"] as const,
  portfolioStats: () => ["real-estate", "portfolio-stats"] as const,
} as const;
