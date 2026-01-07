/**
 * Client-side state hydration
 */

import { store } from "../store";

export function hydrateClientState(): void {
  if (typeof window === "undefined") return;

  // Look for server-rendered state in window object
  const serverState = (window as any).__INITIAL_STATE__;

  if (serverState) {
    store.hydrate(serverState);

    // Clean up
    delete (window as any).__INITIAL_STATE__;
  }
}

// Auto-hydrate on load
if (typeof window !== "undefined") {
  hydrateClientState();
}
