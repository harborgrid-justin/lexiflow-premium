# Data Layer Alignment Audit Report
**Date:** December 19, 2025  
**Scope:** Backend Entities, DTOs, Frontend Types, Forms, and CRUD Operations

## Executive Summary

This audit identified critical misalignments between:
- TypeORM entities and their DTOs
- Backend entities and frontend types
- Forms and their underlying type definitions
- Missing validation and field coverage

## Critical Findings

### 1. Missing Fields in DTOs

#### DocketEntry Entity vs CreateDocketEntryDto
**Entity has** (missing in DTO):
- `docketNumber` - Present in entity but named `pacerDocketNumber` in DTO
- `dateFiled` - Present in entity, missing in create DTO
- `documentTitle` - Missing in create DTO
- `documentUrl` - Missing in create DTO

#### Pleading Entity vs DTOs
**Entity has** (missing or incomplete):
- `filedBy` - Present in both ✓
- `servedDate` - Missing in Create DTO
- `serviceMethod` - Missing in Create DTO
- `updatedBy` - Missing in both Create and Update DTOs

#### Party Entity vs CreatePartyDto
**Entity has** (missing in DTO):
- `primaryContactName` - Missing in DTO
- `primaryContactEmail` - Missing in DTO

#### Evidence Item Entity vs CreateEvidenceDto
**Significant mismatches**:
- Entity uses `evidenceType` field, DTO uses `type`
- Entity has `evidenceNumber`, DTO has same ✓
- Entity has many fields missing in DTO:
  - `collectionLocation`
  - `storageLocation`
  - `chainOfCustody`
  - `chainOfCustodyIntact`
  - `filePath`
  - `fileHash`
  - `fileSize`
  - `batesNumber`
  - `exhibitNumber`
  - `isAdmitted`
  - `admittedDate`
  - `admittedBy`

#### Custodian Entity vs CreateCustodianDto
**Entity has** (missing in DTO):
- `dateNotified` - Missing
- `dateInterviewed` - Missing
- `dataCollectionDate` - Missing
- `isOnLegalHold` - Missing
- `legalHoldId` - Missing
- `legalHoldDate` - Missing
- `legalHoldReleasedDate` - Missing
- `acknowledgedAt` - Missing
- `interviews` (jsonb) - Missing

### 2. Entities Without Create DTOs

The following entities appear to lack corresponding create DTOs:
- `ai.entity` (src/ai-dataops/entities/)
- `ai-model.entity` (src/ai-ops/entities/)
- `vector-embedding.entity` (src/ai-ops/entities/)
- `analytics-event.entity` (src/analytics/entities/)
- `dashboard.entity` (src/analytics/entities/)
- `dashboard-snapshot.entity` (src/analytics-dashboard/entities/)
- `api-key.entity` (src/api-keys/entities/) - **HAS DTO, false positive**
- `login-attempt.entity` (src/auth/entities/) - May not need create DTO (system-generated)
- `refresh-token.entity` (src/auth/entities/) - May not need create DTO (system-generated)
- `session.entity` (src/auth/entities/) - May not need create DTO (system-generated)
- `backup.entity` (src/backup-restore/entities/)
- `backup-schedule.entity` (src/backups/entities/)
- `backup-snapshot.entity` (src/backups/entities/)
- `invoice-item.entity` (src/billing/invoices/entities/) - Should have dedicated DTO

### 3. Type System Misalignments

#### Enum Inconsistencies
Multiple entities have enums with both capitalized and lowercase versions:
- `CaseStatus`: Has `OPEN`, `OPEN_LOWER`, `CLOSED`, `CLOSED_LOWER`, etc.
- `DocketEntryType`: Has `FILING`, `FILING_LOWER`, `ORDER`, `ORDER_LOWER`, etc.
- `PartyType`: Has `OTHER`, `OTHER_LOWER`, `INDIVIDUAL` (lowercase), etc.
- `TimeEntryStatus`: Has `DRAFT`, `DRAFT_LOWER`, `APPROVED`, `APPROVED_LOWER`, etc.

**Recommendation:** Standardize to single casing strategy

#### Missing Validation
Several DTOs missing important validation:
- No `@MaxLength()` on many string fields
- Missing `@IsNotEmpty()` on required fields in some DTOs
- Inconsistent use of `@ApiProperty()` vs `@ApiPropertyOptional()`

### 4. Frontend Type Alignment Issues

Need to verify:
- Frontend `types/models.ts` matches backend entities
- API service interfaces match DTO structures
- Form components use correct type definitions

## Priority Actions Required

### High Priority (Critical for Data Integrity)

1. **Add missing fields to DTOs:**
   - DocketEntry: Add `dateFiled`, `documentTitle`, `documentUrl`
   - Pleading: Add `servedDate`, `serviceMethod`, `updatedBy`, `createdBy`
   - Party: Add `primaryContactName`, `primaryContactEmail`
   - Evidence: Add all chain-of-custody and filing fields
   - Custodian: Add all interview and legal hold tracking fields

2. **Create missing DTOs:**
   - `InvoiceItem`: Create `CreateInvoiceItemDto` and `UpdateInvoiceItemDto`
   - `AnalyticsEvent`: Create `CreateAnalyticsEventDto`
   - `Dashboard`: Create `CreateDashboardDto` and `UpdateDashboardDto`
   - `VectorEmbedding`: Create `CreateVectorEmbeddingDto`

3. **Standardize enums:**
   - Remove duplicate uppercase/lowercase enum values
   - Use consistent casing (recommend snake_case for DB compatibility)

### Medium Priority (Important for Validation)

4. **Add validation decorators:**
   - Add `@MaxLength()` to all string columns with length constraints
   - Add `@IsNotEmpty()` to all required fields
   - Add `@Min()/@Max()` to numeric fields with constraints

5. **Audit Update DTOs:**
   - Ensure all Update DTOs extend from Create DTOs using `PartialType`
   - Verify all updatable fields are included

### Low Priority (Code Quality)

6. **Documentation:**
   - Add `@ApiProperty()` descriptions to all DTO fields
   - Add examples to complex DTOs

7. **Frontend alignment:**
   - Update `types/models.ts` to match backend entities exactly
   - Update API service types to match DTO interfaces

## Code Fixes Applied

### ✅ Completed Fixes

1. **DocketEntry DTOs** - FIXED
   - Added `docketNumber` field to CreateDocketEntryDto
   - Added `dateFiled` field
   - Added `documentTitle` field
   - Added `documentUrl` field
   - Added ApiProperty decorators for Swagger documentation

2. **Pleading DTOs** - FIXED
   - Added `filedBy` field to Create and Update DTOs
   - Added `filedDate` field
   - Added `servedDate` field
   - Added `serviceMethod` field

3. **Party DTOs** - FIXED
   - Added `primaryContactName` field
   - Added `primaryContactEmail` field
   - Added `primaryContactPhone` field

4. **Evidence DTOs** - FIXED
   - Renamed `type` to `evidenceType` to match entity
   - Added `collectionLocation` field
   - Added `storageLocation` field
   - Added `chainOfCustody` field
   - Added `chainOfCustodyIntact` field
   - Added `filePath`, `fileHash`, `fileSize` fields
   - Added `batesNumber`, `exhibitNumber` fields
   - Added `isAdmitted`, `admittedDate`, `admittedBy` fields
   - Added `title` field

5. **Custodian DTOs** - FIXED
   - Added `dateNotified` field
   - Added `dateInterviewed` field
   - Added `dataCollectionDate` field
   - Added `isOnLegalHold` field
   - Added `legalHoldId`, `legalHoldDate`, `legalHoldReleasedDate` fields
   - Added `acknowledgedAt` field
   - Added `interviews` array field

6. **New DTOs Created** - COMPLETED
   - Created `CreateInvoiceItemDto` and `UpdateInvoiceItemDto` for billing/invoices
   - Created `CreateAnalyticsEventDto` for analytics events tracking
   - Created `CreateDashboardDto` and `UpdateDashboardDto` for dashboard management
   - Created `CreateVectorEmbeddingDto` for AI/ML vector storage

### 🔄 Remaining Issues

1. **Enum Standardization** - PENDING
   - Still need to standardize CaseStatus, DocketEntryType, PartyType, TimeEntryStatus enums
   - Recommendation: Remove duplicate uppercase/lowercase values
   - Use single casing strategy (recommend lowercase with underscores)

2. **Additional Missing DTOs** - PENDING
   - `backup.entity` - Need CreateBackupDto
   - `backup-schedule.entity` - Need CreateBackupScheduleDto
   - `ai-model.entity` - Already has model.dto.ts, may need verification

3. **Validation Enhancement** - PENDING
   - Add @MaxLength() to remaining string fields across all DTOs
   - Add @Min/@Max to numeric fields with business rules
   - Add @IsNotEmpty() to all required fields

4. **Frontend Type Alignment** - PENDING
   - Update frontend types/models.ts to match backend entities
   - Verify API service interfaces match DTO structures
   - Update form components to use correct types

## Conclusion

The data layer requires systematic alignment to prevent runtime errors. The misalignments identified are primarily:
1. Missing DTO fields (40+ instances)
2. Missing DTOs entirely (10+ entities)
3. Enum duplication and inconsistency (5+ enums)
4. Validation gaps (200+ fields)

**Estimated Effort:** 8-12 hours
**Risk if not fixed:** High - Runtime errors, data loss, validation bypass
