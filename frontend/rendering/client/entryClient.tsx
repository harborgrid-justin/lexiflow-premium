/**
 * Client Entry Point
 *
 * Main entry point for client-side application initialization.
 * Handles hydration of the server-rendered application.
 *
 * @module rendering/client/entryClient
 */

import { HydratedRouter } from "react-router/dom";

import { hydrationService } from "./hydrationService.tsx";

/**
 * Initializes the client-side application
 * Hydrates the server-rendered HTML with React
 */
export function initializeClient(): void {
  if (typeof window === "undefined") {
    console.warn("[ClientEntry] Attempted to initialize client in non-browser environment");
    return;
  }

  // Hydrate the application
  hydrationService.hydrate(<HydratedRouter />);
}

/**
 * Default export for direct execution
 */
export default initializeClient;
