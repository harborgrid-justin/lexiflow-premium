# API Modularization Plan - A7F9B2

## Objective
Break down 3 large API-related files into smaller, focused modules of approximately 90 LOC each while maintaining all existing functionality and proper TypeScript types.

## Target Files
1. `/workspaces/lexiflow-premium/frontend/src/services/infrastructure/apiClient.ts` (977 LOC)
2. `/workspaces/lexiflow-premium/frontend/src/api/domains/drafting.api.ts` (914 LOC)
3. `/workspaces/lexiflow-premium/frontend/src/api/workflow/workflow-advanced-api.ts` (910 LOC)

## Design Principles
- Target ~90 LOC per file
- Split by API domain/resource/feature
- Maintain all existing functionality
- Keep proper TypeScript types
- Ensure all imports are updated
- Maintain the existing API surface (no breaking changes)
- Use barrel exports (index.ts) for clean import paths

## Phase 1: apiClient.ts Refactoring (977 LOC → ~11 modules)

### Proposed Module Structure:
1. **types.ts** (~40 LOC) - Core types and interfaces
   - ApiError, PaginatedResponse, ServiceHealth, SystemHealth

2. **config.ts** (~30 LOC) - Configuration constants
   - Token keys, timeouts, base URL management

3. **auth-manager.ts** (~90 LOC) - Authentication token management
   - getAuthToken, setAuthTokens, clearAuthTokens, isAuthenticated

4. **request-builder.ts** (~80 LOC) - Request header and URL building
   - getHeaders, buildURL, validateEndpoint, validateData

5. **response-handler.ts** (~100 LOC) - Response processing and error handling
   - handleResponse, error parsing, case conversion

6. **token-refresh.ts** (~70 LOC) - Token refresh logic
   - refreshAccessToken with deduplication

7. **http-methods.ts** (~150 LOC) - Core HTTP methods
   - get, post, put, patch, delete

8. **blob-handler.ts** (~60 LOC) - Binary data handling
   - getBlob

9. **file-upload.ts** (~80 LOC) - File upload functionality
   - upload with multipart/form-data

10. **health-check.ts** (~120 LOC) - Health monitoring
    - healthCheck, checkServiceHealth, checkSystemHealth

11. **api-client.ts** (~90 LOC) - Main client class (composition)
    - Exports singleton, orchestrates all modules

12. **index.ts** (~20 LOC) - Barrel export

## Phase 2: drafting.api.ts Refactoring (914 LOC → ~10 modules)

### Proposed Module Structure:
1. **types.ts** (~100 LOC) - Core types
   - Enums, interfaces for templates and documents

2. **validation-types.ts** (~50 LOC) - Validation-specific types
   - ValidationError, TemplateValidationResult, etc.

3. **dashboard-api.ts** (~60 LOC) - Dashboard methods
   - getRecentDrafts, getTemplates, getPendingApprovals, getStats

4. **template-crud.ts** (~100 LOC) - Template CRUD operations
   - create, read, update, delete, archive, duplicate

5. **document-generation.ts** (~90 LOC) - Document generation
   - generateDocument, getAllGeneratedDocuments, getById, update

6. **document-workflow.ts** (~80 LOC) - Document workflow actions
   - submitForReview, approve, reject, finalize

7. **template-validator.ts** (~150 LOC) - Template validation logic
   - validateTemplate method from DraftingValidationService

8. **variable-validator.ts** (~120 LOC) - Variable validation
   - validateVariables method

9. **clause-validator.ts** (~100 LOC) - Clause validation
   - validateClauses, generatePreview methods

10. **drafting-api.ts** (~90 LOC) - Main API service class
    - DraftingApiService singleton

11. **index.ts** (~20 LOC) - Barrel export

## Phase 3: workflow-advanced-api.ts Refactoring (910 LOC → ~10 modules)

### Proposed Module Structure:
1. **conditional-branching-api.ts** (~90 LOC) - Feature 1
   - Conditional branching CRUD and evaluation

2. **parallel-execution-api.ts** (~80 LOC) - Feature 2
   - Parallel execution configuration and metrics

3. **versioning-api.ts** (~100 LOC) - Feature 3
   - Version CRUD, comparison, rollback

4. **template-library-api.ts** (~90 LOC) - Feature 4
   - Template search, AI categories, forking, rating

5. **sla-monitoring-api.ts** (~90 LOC) - Feature 5
   - SLA configuration, status calculation, dashboard

6. **approval-chains-api.ts** (~90 LOC) - Feature 6
   - Approval chain management and decisions

7. **rollback-api.ts** (~100 LOC) - Feature 7
   - Snapshot management and rollback operations

8. **analytics-api.ts** (~90 LOC) - Feature 8
   - Workflow analytics and real-time metrics

9. **ai-suggestions-api.ts** (~90 LOC) - Feature 9
   - AI-powered suggestions and feedback

10. **external-triggers-api.ts** (~100 LOC) - Feature 10
    - External trigger CRUD and event handling

11. **enhanced-operations-api.ts** (~100 LOC) - Enhanced workflow operations
    - CRUD, query, execute, pause/resume/cancel

12. **workflow-advanced-api.ts** (~60 LOC) - Main service class (composition)
    - Aggregates all feature modules

13. **index.ts** (~20 LOC) - Barrel export

## Implementation Strategy

### For Each File:
1. Create new directory structure
2. Extract types/interfaces to dedicated files
3. Split functionality into focused modules
4. Create index.ts barrel exports
5. Update original file to re-export from modules (backward compatibility)
6. Find and update all imports across the codebase

### Validation Steps:
1. TypeScript compilation success
2. No circular dependencies
3. All exports accessible
4. Existing API surface unchanged
5. Import paths work correctly

## Timeline
- Phase 1 (apiClient): ~60 minutes
- Phase 2 (drafting): ~45 minutes
- Phase 3 (workflow-advanced): ~45 minutes
- Verification & Testing: ~30 minutes
- Total: ~3 hours

## Deliverables
1. Modularized file structures for all 3 APIs
2. Barrel exports for clean import paths
3. Updated imports across codebase
4. Documentation of new structure
5. Verification that all functionality works
