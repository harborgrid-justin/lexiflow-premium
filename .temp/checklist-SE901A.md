# SyncEngine Modularization Checklist

**Task ID:** SE901A
**Status:** In Progress
**Last Updated:** 2026-01-11

## Phase 1: Type & Config Extraction

- [ ] Create `types/syncTypes.ts`
  - [ ] Extract `Mutation` interface
  - [ ] Extract `CacheEntry` interface
  - [ ] Add comprehensive JSDoc
  - [ ] Export types

- [ ] Create `config/syncConfig.ts`
  - [ ] Extract `QUEUE_KEY`
  - [ ] Extract `MAX_CACHE_SIZE`
  - [ ] Extract `CACHE_TTL_MS`
  - [ ] Extract `MAX_RETRY_ATTEMPTS`
  - [ ] Extract `BASE_RETRY_DELAY`
  - [ ] Add configuration documentation

- [ ] Update original syncEngine.ts imports

## Phase 2: Utility Extraction

- [ ] Create `utils/patchGenerator.ts`
  - [ ] Extract `createPatch()` function
  - [ ] Add comprehensive JSDoc
  - [ ] Add usage examples
  - [ ] Export function

- [ ] Update syncEngine.ts to import patchGenerator

## Phase 3: Cache Module

- [ ] Create `cache/cacheManager.ts`
  - [ ] Create `CacheManager` class/module
  - [ ] Extract `cleanupCache()` logic
  - [ ] Extract `enforceCacheLimit()` logic
  - [ ] Extract `startCleanupTimer()` logic
  - [ ] Extract `getCacheStats()` logic
  - [ ] Extract `stopCleanupTimer()` logic
  - [ ] Export CacheManager instance

- [ ] Update syncEngine.ts to use CacheManager
- [ ] Verify cache behavior unchanged

## Phase 4: Queue Module

- [ ] Create `queue/queueManager.ts`
  - [ ] Create `QueueManager` class/module
  - [ ] Extract `getQueue()` logic
  - [ ] Extract `enqueue()` logic
  - [ ] Extract `dequeue()` logic
  - [ ] Extract `peek()` logic
  - [ ] Extract `update()` logic
  - [ ] Extract `count()` logic
  - [ ] Extract `getFailed()` logic
  - [ ] Extract `resetFailed()` logic
  - [ ] Extract `clear()` logic
  - [ ] Export QueueManager instance

- [ ] Update syncEngine.ts to use QueueManager
- [ ] Verify queue operations unchanged

## Phase 5: Backend Sync Module

- [ ] Create `sync/backendSync.ts`
  - [ ] Create `BackendSyncService` class/module
  - [ ] Extract `processMutation()` logic
  - [ ] Extract `calculateBackoffDelay()` logic
  - [ ] Extract `processQueue()` logic
  - [ ] Extract `syncFromBackend()` logic
  - [ ] Extract `getBackendStatus()` logic
  - [ ] Export BackendSyncService instance

- [ ] Update syncEngine.ts to use BackendSyncService
- [ ] Verify network operations work correctly

## Phase 6: Main API Refactor

- [ ] Refactor `sync/syncEngine.ts` to facade
  - [ ] Import all modules
  - [ ] Delegate `getQueue()` to QueueManager
  - [ ] Delegate `enqueue()` to QueueManager + CacheManager
  - [ ] Delegate `dequeue()` to QueueManager + CacheManager
  - [ ] Delegate `peek()` to QueueManager
  - [ ] Delegate `update()` to QueueManager
  - [ ] Delegate `count()` to QueueManager
  - [ ] Delegate `getFailed()` to QueueManager
  - [ ] Delegate `resetFailed()` to QueueManager
  - [ ] Delegate `clear()` to QueueManager
  - [ ] Delegate `cleanupCache()` to CacheManager
  - [ ] Delegate `getCacheStats()` to CacheManager
  - [ ] Delegate `stopCleanupTimer()` to CacheManager
  - [ ] Delegate `syncMutation()` to BackendSyncService
  - [ ] Delegate `processQueue()` to BackendSyncService
  - [ ] Delegate `syncFromBackend()` to BackendSyncService
  - [ ] Delegate `getBackendStatus()` to BackendSyncService
  - [ ] Delegate `getBackoffDelay()` to BackendSyncService

- [ ] Verify all 27 public methods work identically
- [ ] Test with SyncContext integration

## Phase 7: Barrel Export & Final Testing

- [ ] Create `index.ts` barrel export
  - [ ] Export `SyncEngine` singleton
  - [ ] Export `Mutation` type
  - [ ] Export other public types as needed

- [ ] Update consumer imports
  - [ ] No changes needed (same import path)
  - [ ] Verify `SyncContext.tsx` works
  - [ ] Verify `core-services.ts` works
  - [ ] Verify `services/index.ts` works

- [ ] Final documentation
  - [ ] Update module-level JSDoc
  - [ ] Add architectural notes
  - [ ] Document module boundaries

## Testing & Validation

- [ ] Type checking passes
- [ ] No TypeScript errors
- [ ] All imports resolve correctly
- [ ] Cache operations work as before
- [ ] Queue operations work as before
- [ ] Backend sync works as before
- [ ] SyncContext integration works
- [ ] Performance characteristics unchanged

## Cleanup

- [ ] Remove original syncEngine.ts (replaced by modular version)
- [ ] Archive plan to `.temp/completed/`
- [ ] Create completion summary
