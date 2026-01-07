/**
 * SSR Dehydrate - Serialize query cache for client
 */

export interface DehydratedState {
  queries: Array<{
    key: string[];
    data: unknown;
  }>;
}

export function dehydrate(): DehydratedState {
  // Extract cache state for serialization
  // In production, use proper dehydration from TanStack Query
  return {
    queries: [],
  };
}

export function serializeDehydratedState(state: DehydratedState): string {
  return JSON.stringify(state);
}
