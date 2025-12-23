# API Contract Alignment Fixes - Agent #8

## Critical Mismatches Identified

### 1. Processing Jobs API
**Backend:** `/home/user/lexiflow-premium/backend/src/processing-jobs/processing-jobs.controller.ts`
**Frontend:** `/home/user/lexiflow-premium/frontend/services/api/admin/processing-jobs-api.ts`

Issues:
- Missing: POST /processing-jobs/:id/retry
- Path mismatch: GET /processing-jobs/statistics (backend) vs GET /processing-jobs/stats (frontend)
- Missing: GET /processing-jobs/entity/:entityType/:entityId

### 2. AI Ops API
**Backend:** `/home/user/lexiflow-premium/backend/src/ai-ops/ai-ops.controller.ts`
**Frontend:** `/home/user/lexiflow-premium/frontend/services/api/ai-ops-api.ts`

Issues:
- Missing: POST /ai-ops/execute - frontend expects to execute AI operations
- Missing: GET /ai-ops - frontend expects to list all operations
- Missing: GET /ai-ops/:id - frontend expects to get operation by ID

Current backend only has embeddings and models endpoints.
