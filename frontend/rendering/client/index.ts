/**
 * Client Rendering Module
 *
 * Exports all client-side rendering functionality including:
 * - Hydration service
 * - Client entry point
 *
 * @module rendering/client
 */

export { default as entryClient, initializeClient } from "./entryClient.tsx";
export { HydrationService, hydrationService } from "./hydrationService.tsx";
export type { HydrationConfig } from "./hydrationService.tsx";
