/**
 * Client-side state hydration
 */

import { store } from "../store";

// Type for the expected store state structure
type StoreState = Record<string, unknown>;

export function hydrateClientState(): void {
  if (typeof window === "undefined") return;

  // Look for server-rendered state in window object
  const serverState = (window as { __INITIAL_STATE__?: unknown })
    .__INITIAL_STATE__;

  if (serverState && typeof serverState === "object") {
    store.hydrate(serverState as StoreState);

    // Clean up
    delete (window as { __INITIAL_STATE__?: unknown }).__INITIAL_STATE__;
  }
}

// Auto-hydrate on load
if (typeof window !== "undefined") {
  hydrateClientState();
}
