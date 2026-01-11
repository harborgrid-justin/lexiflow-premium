# Discovery Repository Refactoring Checklist - D1SC0V

## Phase 1: Core Infrastructure
- [ ] Create `discovery/shared/validation.ts` with validation utilities
- [ ] Create `discovery/shared/types.ts` with shared type definitions
- [ ] Verify imports and exports work correctly

## Phase 2: Service Modules Creation

### Service Files (17 total)
- [ ] Create `DashboardService.ts` - dashboard & analytics operations
- [ ] Create `CustodianService.ts` - custodian CRUD operations
- [ ] Create `DepositionService.ts` - deposition operations
- [ ] Create `ESISourceService.ts` - ESI source operations
- [ ] Create `ProductionService.ts` - production set operations
- [ ] Create `InterviewService.ts` - custodian interview operations
- [ ] Create `DiscoveryRequestService.ts` - discovery request operations
- [ ] Create `ReviewBatchService.ts` - review batch operations
- [ ] Create `ProcessingJobService.ts` - processing job operations
- [ ] Create `DocumentReviewService.ts` - document review operations
- [ ] Create `ExaminationService.ts` - examination & transcript operations
- [ ] Create `VendorService.ts` - vendor & reporter operations
- [ ] Create `SanctionStipulationService.ts` - sanction & stipulation operations
- [ ] Create `LegalHoldPrivilegeService.ts` - legal hold & privilege log operations
- [ ] Create `CollectionService.ts` - collection management operations
- [ ] Create `TimelineService.ts` - timeline & deadline sync operations
- [ ] Create `PetitionService.ts` - Rule 27 petition operations

## Phase 3: Main Repository Refactor
- [ ] Update `DiscoveryRepository.ts` to facade pattern
- [ ] Import all service modules
- [ ] Delegate all methods to services
- [ ] Maintain constructor and initialization
- [ ] Keep DISCOVERY_QUERY_KEYS export
- [ ] Verify all public methods preserved

## Phase 4: Cleanup & Verification
- [ ] Delete old `discovery/CustodianOperations.ts`
- [ ] Delete old `discovery/DepositionOperations.ts`
- [ ] Delete old `discovery/EsiSourceOperations.ts`
- [ ] Delete old `discovery/InterviewOperations.ts`
- [ ] Delete old `discovery/LegalHoldOperations.ts`
- [ ] Delete old `discovery/RequestOperations.ts`
- [ ] Keep `discovery/utils.ts` if still needed (or replace with shared/validation.ts)
- [ ] Update any direct imports in consuming components
- [ ] Run TypeScript type check
- [ ] Run build verification
- [ ] Verify no breaking changes to API surface

## Quality Assurance
- [ ] Each service module is ~90 LOC (±10 acceptable)
- [ ] All services have proper JSDoc documentation
- [ ] Error handling is consistent across all services
- [ ] Validation uses centralized utilities
- [ ] Type safety maintained throughout
- [ ] No `any` types without justification
- [ ] All imports use absolute paths (@/ prefix)
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] Query keys properly accessible

## Testing & Validation
- [ ] Verify DiscoveryRepository instantiation works
- [ ] Check method delegation works correctly
- [ ] Confirm error handling propagates properly
- [ ] Test at least one operation from each service
- [ ] Verify query keys are importable

## Documentation
- [ ] Update inline documentation if needed
- [ ] Ensure all services have module-level docs
- [ ] Document any architectural decisions
- [ ] Create completion summary when done
