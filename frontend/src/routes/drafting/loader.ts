/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Drafting Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import {
  draftingApi,
  type DraftingStats,
  type DraftingTemplate,
  type GeneratedDocument,
} from "@api/domains/drafting";

export interface DraftingLoaderData {
  recentDrafts: GeneratedDocument[];
  templates: DraftingTemplate[];
  approvals: GeneratedDocument[];
  stats: DraftingStats;
}

export async function draftingLoader() {
  const [recentDrafts, templates, approvals, stats] = await Promise.all([
    draftingApi.getRecentDrafts().catch(() => []),
    draftingApi.templates.getAll().catch(() => []),
    draftingApi.dashboard.getPendingApprovals().catch(() => []),
    draftingApi
      .getStats()
      .catch(
        () =>
          ({
            drafts: 0,
            templates: 0,
            pendingReviews: 0,
            myTemplates: 0,
          }) as DraftingStats,
      ),
  ]);

  return {
    recentDrafts,
    templates,
    approvals,
    stats,
  };
}
