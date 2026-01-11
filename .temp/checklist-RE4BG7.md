# Refactoring Checklist - RE4BG7

## Pre-Refactor Validation
- [ ] Verify current build status (`npm run build`)
- [ ] Document current file LOC counts
- [ ] Identify all import locations (completed: 11 RealEstate, 0 Billing, 34 Gemini)
- [ ] Create `.temp` directory structure

## Phase 1: RealEstateDomain Refactor
- [ ] Create module directory: `frontend/src/services/domain/RealEstateDomain/`
- [ ] Extract `types.ts` (~120 LOC)
- [ ] Extract `queryKeys.ts` (~20 LOC)
- [ ] Extract `propertyOperations.ts` (~90 LOC)
- [ ] Extract `disposalOperations.ts` (~75 LOC)
- [ ] Extract `encroachmentOperations.ts` (~80 LOC)
- [ ] Extract `acquisitionOperations.ts` (~65 LOC)
- [ ] Extract `utilizationOperations.ts` (~50 LOC)
- [ ] Extract `costShareOperations.ts` (~70 LOC)
- [ ] Extract `outgrantOperations.ts` (~50 LOC)
- [ ] Extract `otherFinancialOperations.ts` (~100 LOC)
- [ ] Extract `auditOperations.ts` (~60 LOC)
- [ ] Create `index.ts` barrel export
- [ ] Verify all 11 consuming files still work
- [ ] Delete original `RealEstateDomain.ts`

## Phase 2: BillingDomain Refactor
- [ ] Create module directory: `frontend/src/services/domain/BillingDomain/`
- [ ] Extract `types.ts` (~50 LOC)
- [ ] Extract `queryKeys.ts` (~25 LOC)
- [ ] Extract `repository.ts` (~120 LOC)
- [ ] Extract `timeEntryOperations.ts` (~100 LOC)
- [ ] Extract `rateOperations.ts` (~45 LOC)
- [ ] Extract `invoiceOperations.ts` (~100 LOC)
- [ ] Extract `trustOperations.ts` (~100 LOC)
- [ ] Extract `analyticsOperations.ts` (~120 LOC)
- [ ] Extract `utilityOperations.ts` (~40 LOC)
- [ ] Create `index.ts` barrel export
- [ ] Delete original `BillingDomain.ts`

## Phase 3: GeminiService Refactor
- [ ] Create module directory: `frontend/src/services/features/research/geminiService/`
- [ ] Extract `types.ts` (~40 LOC)
- [ ] Extract `client.ts` (~30 LOC)
- [ ] Extract `documentProcessing.ts` (~100 LOC)
- [ ] Extract `legalResearch.ts` (~100 LOC)
- [ ] Extract `contentGeneration.ts` (~100 LOC)
- [ ] Extract `dataProcessing.ts` (~90 LOC)
- [ ] Extract `workflowAutomation.ts` (~100 LOC)
- [ ] Create `index.ts` barrel export
- [ ] Verify all 34 consuming files still work
- [ ] Delete original `geminiService.ts`

## Phase 4: Build & Validation
- [ ] Run `npm run build` - verify no errors
- [ ] Run type-check if available
- [ ] Smoke test RealEstate module in dev mode
- [ ] Smoke test Billing module in dev mode
- [ ] Smoke test Gemini AI features in dev mode
- [ ] Verify no console errors

## Documentation Updates
- [ ] Update task-status with completion
- [ ] Update progress report
- [ ] Create completion summary
- [ ] Move all files to `.temp/completed/`

## Rollback Plan (if needed)
- [ ] Restore original files from git
- [ ] Delete new module directories
- [ ] Verify build works
