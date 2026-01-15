/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                   LEXIFLOW SYNC ENGINE (COMPATIBILITY SHIM)               ║
 * ║                                                                           ║
 * ║  This file now re-exports from the modularized sync/ directory.          ║
 * ║  The original 1031 LOC monolith has been split into focused modules.     ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/data/syncEngine
 * @deprecated Use '@/services/data/sync' for direct imports
 * @since 2025-12-18 (Original Implementation)
 * @refactored 2026-01-11 (Modularized into sync/ directory)
 *
 * @migration
 * Old import: import { SyncEngine } from '@/services/data/syncEngine';
 * New import: import { SyncEngine } from '@/services/data/sync';
 *
 * This compatibility shim maintains backward compatibility for existing consumers.
 * All functionality is preserved - this is a transparent refactoring.
 */

// Re-export everything from the modularized sync engine
export { SyncEngine } from "./sync/sync-engine.service";
export type { Mutation } from "./sync/types/syncTypes";
