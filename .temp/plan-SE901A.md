# SyncEngine Modularization Plan

**Task ID:** SE901A
**Agent:** TypeScript Architect
**Created:** 2026-01-11
**Status:** In Progress

## Objective

Break down `/workspaces/lexiflow-premium/frontend/src/services/data/syncEngine.ts` (1031 LOC) into focused, maintainable modules of ~90 LOC each while preserving all functionality and the existing API.

## Current State Analysis

### File Structure
- **Total LOC:** 1031
- **Main Components:**
  1. Type definitions (Mutation, CacheEntry)
  2. Configuration constants
  3. Utility functions (patch generation, cache management)
  4. Backend sync integration
  5. SyncEngine singleton API (27 public methods)

### Dependencies
- Used by: `SyncContext.tsx`, `core-services.ts`, `services/index.ts`
- Imports: `apiClient`, `LinearHash`, `StorageUtils`, config modules

## Proposed Module Structure

### 1. **types/syncTypes.ts** (~40 LOC)
- Core type definitions: `Mutation`, `CacheEntry`
- Type exports for external consumers
- No implementation logic

### 2. **config/syncConfig.ts** (~30 LOC)
- Configuration constants
- TTL values, retry limits, storage keys
- Environment-specific settings

### 3. **utils/patchGenerator.ts** (~60 LOC)
- `createPatch()` function
- JSON Patch generation logic
- Diff calculation utilities

### 4. **cache/cacheManager.ts** (~110 LOC)
- Cache lifecycle management
- `cleanupCache()`, `enforceCacheLimit()`
- Cache statistics and monitoring
- Timer management

### 5. **queue/queueManager.ts** (~100 LOC)
- Core queue operations
- `enqueue()`, `dequeue()`, `peek()`
- Queue persistence via StorageUtils
- Queue state management

### 6. **sync/backendSync.ts** (~120 LOC)
- Backend integration
- `processMutation()`, `processQueue()`
- Retry logic and exponential backoff
- Network communication

### 7. **sync/syncEngine.ts** (~90 LOC)
- Main API facade (singleton pattern)
- Orchestrates all modules
- Maintains backward compatibility
- Public API surface

### 8. **index.ts** (~20 LOC)
- Barrel export
- Re-exports public types and SyncEngine
- Clean module interface

## Implementation Phases

### Phase 1: Type Extraction (Low Risk)
- Extract types to `types/syncTypes.ts`
- Extract config to `config/syncConfig.ts`
- Update imports in original file
- **No API changes**

### Phase 2: Utility Extraction (Low Risk)
- Extract patch generation to `utils/patchGenerator.ts`
- Update imports
- **No API changes**

### Phase 3: Cache Module (Medium Risk)
- Extract cache logic to `cache/cacheManager.ts`
- Create `CacheManager` class/module
- Update SyncEngine to use new module
- **Verify cache behavior unchanged**

### Phase 4: Queue Module (Medium Risk)
- Extract queue operations to `queue/queueManager.ts`
- Create `QueueManager` class/module
- Update SyncEngine to delegate to QueueManager
- **Verify queue operations unchanged**

### Phase 5: Backend Sync Module (High Risk)
- Extract backend sync to `sync/backendSync.ts`
- Create `BackendSyncService`
- Update SyncEngine to use BackendSyncService
- **Test network operations thoroughly**

### Phase 6: Main API Refactor (Critical)
- Refactor `syncEngine.ts` to facade pattern
- Delegate to specialized modules
- **Verify ALL public methods work identically**
- **Test with SyncContext integration**

### Phase 7: Barrel Export & Documentation
- Create `index.ts` barrel export
- Update all import paths in consumers
- Update documentation
- **Final integration testing**

## Testing Strategy

### Unit Tests (Per Module)
- Type definitions compile correctly
- Config values accessible
- Patch generation produces correct diffs
- Cache eviction works as expected
- Queue operations maintain FIFO order
- Backend sync handles retries correctly

### Integration Tests
- SyncEngine API surface unchanged
- SyncContext.tsx works without modification
- Queue persistence across modules
- Cache coherence across operations

### Regression Tests
- All existing consumers work unchanged
- Network sync behavior identical
- Error handling preserved
- Performance characteristics maintained

## Deliverables

1. ✅ 8 new TypeScript modules (~90 LOC each)
2. ✅ Preserved API compatibility
3. ✅ Updated imports in consumers
4. ✅ Comprehensive JSDoc comments
5. ✅ Type safety maintained/improved
6. ✅ All functionality preserved

## Success Criteria

- [x] Original file broken into focused modules
- [ ] Each module ≤ 120 LOC (target ~90 LOC)
- [ ] All tests pass (if exist)
- [ ] No breaking changes to public API
- [ ] SyncContext works without changes
- [ ] Improved maintainability and testability
- [ ] Clear separation of concerns

## Risk Mitigation

1. **API Compatibility Risk:** Maintain exact same public API, use facade pattern
2. **State Management Risk:** Ensure singleton cache/queue instances work across modules
3. **Import Cycle Risk:** Carefully design module dependencies (types → config → utils → services)
4. **Testing Gap Risk:** Manually verify all SyncEngine methods before/after

## Timeline

- **Phase 1-2:** 30 minutes (low risk extractions)
- **Phase 3-4:** 45 minutes (module creation + integration)
- **Phase 5:** 30 minutes (backend sync extraction)
- **Phase 6:** 45 minutes (facade refactor + testing)
- **Phase 7:** 30 minutes (documentation + final testing)
- **Total:** ~3 hours

## Notes

- Original file has excellent documentation - preserve it
- Cache uses `LinearHash` for O(1) operations - maintain this
- Queue persistence via `StorageUtils` - keep abstraction
- Backend sync has complex retry logic - extract carefully
- SyncContext depends on exact API - no breaking changes allowed
