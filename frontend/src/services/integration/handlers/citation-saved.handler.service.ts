/**
 * CitationSavedHandler - Research -> Pleadings Integration
 *
 * Responsibility: Cache research and create pleading suggestions
 * Integration: Opp #7 from architecture docs
 */

import { db } from "@/services/data/db.service";
import type { SystemEventPayloads } from "@/types/integration-types";
import { SystemEventType } from "@/types/integration-types";
import { BaseEventHandler } from "./base-event.handler.service";

export class CitationSavedHandler extends BaseEventHandler<
  SystemEventPayloads[typeof SystemEventType.CITATION_SAVED]
> {
  readonly eventType = SystemEventType.CITATION_SAVED;

  async handle(
    payload: SystemEventPayloads[typeof SystemEventType.CITATION_SAVED]
  ) {
    const actions: string[] = [];
    const { citation, queryContext } = payload;

    // Cache research results
    await this.cacheResearchResult(citation, queryContext);
    actions.push("Updated Pleading Builder Context Cache");

    // Create suggestions for high-relevance citations
    if (citation.relevance && Number(citation.relevance) >= 8) {
      const suggestionCount = await this.createPleadingSuggestions(citation);
      if (suggestionCount > 0) {
        actions.push(
          `Created citation suggestions for ${suggestionCount} active pleading(s)`
        );
      }
    }

    return this.createSuccess(actions);
  }

  private async cacheResearchResult(
    citation: SystemEventPayloads[typeof SystemEventType.CITATION_SAVED]["citation"],
    queryContext: string | undefined
  ): Promise<void> {
    const cacheEntry = {
      id: `cache-${Date.now()}`,
      citationId: citation.id,
      caseId: citation.caseId,
      authority: citation.authority,
      citationText: citation.citation,
      context: queryContext,
      relevanceScore: citation.relevance || 0,
      cachedAt: new Date().toISOString(),
    };

    await db.put("researchCache", cacheEntry);
  }

  private async createPleadingSuggestions(
    citation: SystemEventPayloads[typeof SystemEventType.CITATION_SAVED]["citation"]
  ): Promise<number> {
    const { DataService } = await import("@/services/data/dataService");

    const activePleadings = await DataService.pleadings.getByIndex(
      "status",
      "Draft"
    );
    const casePleadings = activePleadings.filter(
      (pl: unknown) => (pl as { caseId: string }).caseId === citation.caseId
    );

    for (const pleading of casePleadings) {
      await db.put("pleadingSuggestions", {
        id: `sugg-${Date.now()}-${pleading.id}`,
        pleadingId: pleading.id,
        citationId: citation.id,
        suggestionType: "citation",
        priority: "High",
        createdAt: new Date().toISOString(),
      });
    }

    return casePleadings.length;
  }
}
