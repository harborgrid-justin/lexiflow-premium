# Discovery Repository Refactoring Plan - D1SC0V

## Overview
Refactor DiscoveryRepository.ts (1333 LOC) into focused service modules (~90 LOC each)

**Agent ID**: typescript-architect
**Task ID**: discovery-repository-refactoring
**Started**: 2026-01-11
**Target**: 14-15 focused service modules

## Current Structure Analysis

### Main Repository (1333 LOC)
- Dashboard & Analytics (30 LOC)
- Custodians (95 LOC)
- Depositions (45 LOC)
- ESI Sources (100 LOC)
- Productions (95 LOC)
- Custodian Interviews (55 LOC)
- Discovery Requests (85 LOC)
- Review & Processing (140 LOC)
- Document Review (40 LOC)
- Examinations & Transcripts (90 LOC)
- Vendors & Reporters (60 LOC)
- Sanctions & Stipulations (100 LOC)
- Rule 27 Petitions (15 LOC)
- Legal Holds & Privilege Log (95 LOC)
- Utility Operations (100 LOC)
- Collections Management (120 LOC)
- Timeline (20 LOC)

### Existing Discovery Subdirectory Files (OLD - Need Update)
- `CustodianOperations.ts` - includes IndexedDB fallback (OUTDATED)
- `DepositionOperations.ts` - includes IndexedDB fallback (OUTDATED)
- `EsiSourceOperations.ts` - includes IndexedDB fallback (OUTDATED)
- `InterviewOperations.ts` - includes IndexedDB fallback (OUTDATED)
- `LegalHoldOperations.ts` - includes IndexedDB fallback (OUTDATED)
- `RequestOperations.ts` - includes IndexedDB fallback (OUTDATED)
- `utils.ts` - validation utilities (KEEP)

## Refactoring Strategy

### Phase 1: Core Infrastructure (PRIORITY)
1. **Create shared utilities module** (~50 LOC)
   - Path: `discovery/shared/validation.ts`
   - Move validation helpers from main repo
   - Add type guards and common error handlers

2. **Create base types module** (~60 LOC)
   - Path: `discovery/shared/types.ts`
   - Extract FunnelStat interface
   - Add common filter types
   - Export re-used types

### Phase 2: Entity Service Modules (14 modules @ ~90 LOC each)

#### 1. Dashboard Service (~90 LOC)
**Path**: `discovery/services/DashboardService.ts`
- `getFunnelStats()`
- `getCustodianStats()`
- Future: analytics aggregation methods

#### 2. Custodian Service (~95 LOC)
**Path**: `discovery/services/CustodianService.ts`
- `getCustodians(caseId?)`
- `addCustodian(custodian)`
- `updateCustodian(custodian)`
- `deleteCustodian(id)`

#### 3. Deposition Service (~90 LOC)
**Path**: `discovery/services/DepositionService.ts`
- `getDepositions(caseId?)`
- `addDeposition(deposition)`

#### 4. ESI Source Service (~100 LOC)
**Path**: `discovery/services/ESISourceService.ts`
- `getESISources(caseId?)`
- `addESISource(source)`
- `updateESISourceStatus(id, status)`

#### 5. Production Service (~95 LOC)
**Path**: `discovery/services/ProductionService.ts`
- `getProductions(caseId?)`
- `createProduction(production)`
- `downloadProduction(id)`

#### 6. Interview Service (~90 LOC)
**Path**: `discovery/services/InterviewService.ts`
- `getInterviews(caseId?)`
- `createInterview(interview)`

#### 7. Discovery Request Service (~95 LOC)
**Path**: `discovery/services/DiscoveryRequestService.ts`
- `getRequests(caseId?)`
- `addRequest(request)`
- `updateRequestStatus(id, status)`

#### 8. Review Batch Service (~90 LOC)
**Path**: `discovery/services/ReviewBatchService.ts`
- `getReviewBatches(caseId)`
- `createReviewBatch(batch)`

#### 9. Processing Job Service (~90 LOC)
**Path**: `discovery/services/ProcessingJobService.ts`
- `getProcessingJobs(caseId?)`
- `getProcessingJob(id)`
- `createProcessingJob(data)`
- `updateProcessingJob(id, data)`
- `deleteProcessingJob(id)`

#### 10. Document Review Service (~90 LOC)
**Path**: `discovery/services/DocumentReviewService.ts`
- `getReviewDocuments(filters?)`
- `updateDocumentCoding(id, coding, notes?)`

#### 11. Examination Service (~95 LOC)
**Path**: `discovery/services/ExaminationService.ts`
- `getExaminations(caseId?)`
- `addExamination(examination)`
- `getTranscripts(caseId?)`
- `addTranscript(transcript)`

#### 12. Vendor Service (~90 LOC)
**Path**: `discovery/services/VendorService.ts`
- `getVendors()`
- `addVendor(vendor)`
- `getReporters()`

#### 13. Sanction & Stipulation Service (~95 LOC)
**Path**: `discovery/services/SanctionStipulationService.ts`
- `getSanctions(caseId?)`
- `addSanctionMotion(motion)`
- `getStipulations(caseId?)`
- `addStipulation(stipulation)`

#### 14. Legal Hold & Privilege Service (~95 LOC)
**Path**: `discovery/services/LegalHoldPrivilegeService.ts`
- `getLegalHolds()`
- `getLegalHoldsEnhanced()`
- `getPrivilegeLog()`
- `getPrivilegeLogEnhanced()`

#### 15. Collection Service (~95 LOC)
**Path**: `discovery/services/CollectionService.ts`
- `getCollections(caseId?)`
- `getCollection(id)`
- `createCollection(data)`
- `updateCollection(id, data)`
- `deleteCollection(id)`
- `startCollection(id)` (from utility ops)

#### 16. Timeline Service (~70 LOC)
**Path**: `discovery/services/TimelineService.ts`
- `getTimelineEvents(caseId?)`
- `syncDeadlines()` (from utility ops)

#### 17. Petition Service (~50 LOC)
**Path**: `discovery/services/PetitionService.ts`
- `getPetitions()`

### Phase 3: Main Repository Refactor
**Path**: `repositories/DiscoveryRepository.ts` (~150 LOC)
- Import all service modules
- Delegate all methods to appropriate services
- Maintain same public API surface
- Keep constructor and initialization
- Export DISCOVERY_QUERY_KEYS

### Phase 4: Update & Cleanup
1. Delete old operations files in `discovery/` subdirectory
2. Update any imports in consuming components
3. Verify type safety across all modules
4. Run build to ensure no breaking changes

## File Structure (Final)

```
frontend/src/services/data/repositories/
├── DiscoveryRepository.ts (NEW - 150 LOC facade)
├── discovery/
│   ├── shared/
│   │   ├── validation.ts (50 LOC)
│   │   └── types.ts (60 LOC)
│   └── services/
│       ├── DashboardService.ts (90 LOC)
│       ├── CustodianService.ts (95 LOC)
│       ├── DepositionService.ts (90 LOC)
│       ├── ESISourceService.ts (100 LOC)
│       ├── ProductionService.ts (95 LOC)
│       ├── InterviewService.ts (90 LOC)
│       ├── DiscoveryRequestService.ts (95 LOC)
│       ├── ReviewBatchService.ts (90 LOC)
│       ├── ProcessingJobService.ts (90 LOC)
│       ├── DocumentReviewService.ts (90 LOC)
│       ├── ExaminationService.ts (95 LOC)
│       ├── VendorService.ts (90 LOC)
│       ├── SanctionStipulationService.ts (95 LOC)
│       ├── LegalHoldPrivilegeService.ts (95 LOC)
│       ├── CollectionService.ts (95 LOC)
│       ├── TimelineService.ts (70 LOC)
│       └── PetitionService.ts (50 LOC)
```

## Implementation Approach

### Service Module Pattern
Each service module follows this structure:

```typescript
/**
 * [Service Name] Service
 * Handles [domain] operations for discovery management
 *
 * @module [ServiceName]Service
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";
import { validateId, validateCaseId } from "../shared/validation";
import type { [Types] } from "@/types";

export class [ServiceName]Service {
  /**
   * Method documentation
   * @param params - Parameter description
   * @returns Promise with result
   * @throws Error conditions
   */
  async method(params): Promise<ReturnType> {
    // Validation
    // API call with error handling
    // Return typed result
  }
}

export const [serviceName]Service = new [ServiceName]Service();
```

### Main Repository Pattern (Facade)
```typescript
export class DiscoveryRepository {
  constructor() {
    this.logInitialization();
  }

  private logInitialization(): void { /* ... */ }

  // Delegate to services
  getCustodians = custodianService.getCustodians;
  addCustodian = custodianService.addCustodian;
  // ... etc for all methods
}
```

## Quality Checklist
- [ ] All services are ~90 LOC (±10 LOC acceptable)
- [ ] Type safety maintained throughout
- [ ] All imports updated correctly
- [ ] No breaking changes to public API
- [ ] Proper JSDoc documentation
- [ ] Error handling consistent
- [ ] Validation centralized
- [ ] Build succeeds without errors
- [ ] Query keys properly exported

## Success Metrics
- **Before**: 1 file, 1333 LOC
- **After**: 19 files, avg ~85 LOC per service, 1 facade ~150 LOC
- **Maintainability**: Each service focuses on single domain
- **Type Safety**: Maintained end-to-end
- **API Compatibility**: 100% backward compatible

## Timeline
- Phase 1: Shared utilities (30 min)
- Phase 2: 17 service modules (2-3 hours)
- Phase 3: Main repository refactor (30 min)
- Phase 4: Cleanup & verification (30 min)
- **Total**: ~4-5 hours

## Risk Mitigation
- Keep original file until all tests pass
- Create services incrementally
- Test each service independently
- Verify imports before deleting old code
- Run full build after each phase
