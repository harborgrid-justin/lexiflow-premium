/**
 * Global Search Engine
 * @module services/search/core/engine
 */

import { SearchWorker } from "../searchWorker";
import type { GlobalSearchResult } from "./types";
import { validateQuery } from "./validation";
import { hydrateSearchIndex } from "./hydration";

/** GlobalSearchEngine - Manages Web Worker singleton for off-thread search indexing */
export class GlobalSearchEngine {
  private worker: Worker | null = null;
  private requestId = 0;
  private isHydrated = false;
  private hydrationPromise: Promise<void> | null = null;
  private pendingRequests = new Map<
    number,
    (results: GlobalSearchResult[]) => void
  >();

  constructor() {
    if (typeof Worker !== "undefined") {
      const worker = SearchWorker.create();
      if (worker) {
        this.worker = worker;
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
        console.log("[GlobalSearchEngine] Worker initialized");
      }
    } else {
      // Worker API not available (often happens in dev/test/SSR)
      // console.warn('[GlobalSearchEngine] Worker API not available (SSR mode)');
    }
  }

  private handleWorkerMessage(e: MessageEvent): void {
    try {
      const { results, requestId } = e.data;
      const resolver = this.pendingRequests.get(requestId);
      if (resolver) {
        resolver(results);
        this.pendingRequests.delete(requestId);
      }
    } catch (error) {
      console.error("[GlobalSearchEngine.handleWorkerMessage] Error:", error);
    }
  }

  private async hydrate(): Promise<void> {
    if (this.isHydrated) return;
    if (this.hydrationPromise) return this.hydrationPromise;

    this.hydrationPromise = (async () => {
      const startTime = performance.now();
      const searchItems = await hydrateSearchIndex();

      if (!this.worker) {
        console.warn(
          "[GlobalSearchEngine] Worker not available, skipping indexing"
        );
        this.isHydrated = true;
        return;
      }

      this.worker.postMessage({
        type: "UPDATE",
        payload: { items: searchItems, fields: ["title", "subtitle", "type"] },
      });
      console.log(
        `[GlobalSearchEngine] Hydration complete: ${searchItems.length} items in ${(performance.now() - startTime).toFixed(2)}ms`
      );
      this.isHydrated = true;
    })();

    return this.hydrationPromise;
  }

  async search(query: string): Promise<GlobalSearchResult[]> {
    validateQuery(query, "search");
    if (!this.worker) return [];

    await this.hydrate();
    return new Promise<GlobalSearchResult[]>((resolve) => {
      const reqId = ++this.requestId;
      this.pendingRequests.set(reqId, resolve);
      this.worker!.postMessage({
        type: "SEARCH",
        payload: { query, requestId: reqId },
      });
    });
  }

  isReady(): boolean {
    return this.isHydrated;
  }
}
