/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                      SYNC ENGINE BARREL EXPORT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @module services/data/sync
 * @description Public API exports for offline-first synchronization engine
 * @author LexiFlow Engineering Team
 * @since 2026-01-11
 */

// Main SyncEngine API
export { SyncEngine } from "./sync-engine.service";

// Public Types
export type { Mutation, CacheStats, SyncResult } from "./types/syncTypes";
