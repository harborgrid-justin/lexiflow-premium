/**
 * Search History
 * @module services/search/core/history
 */

import { StorageUtils } from "@/utils/storage";

import { validateHistoryTerm } from "./validation";

const HISTORY_KEY = "lexiflow_search_history";
const MAX_HISTORY_SIZE = 10;

/** Save search term to history - maintains last 10 unique searches */
export function saveHistory(term: string): void {
  if (!validateHistoryTerm(term)) return;

  try {
    const history = StorageUtils.get<string[]>(HISTORY_KEY, []);
    const newHistory = [term, ...history.filter((h) => h !== term)].slice(
      0,
      MAX_HISTORY_SIZE,
    );
    StorageUtils.set(HISTORY_KEY, newHistory);
    console.warn(`[SearchService] Saved to history: "${term}"`);
  } catch (error) {
    console.error("[SearchService.saveHistory] Error:", error);
  }
}

/** Get search history - returns up to 10 most recent searches */
export function getHistory(): string[] {
  try {
    return StorageUtils.get<string[]>(HISTORY_KEY, []);
  } catch (error) {
    console.error("[SearchService.getHistory] Error:", error);
    return [];
  }
}
