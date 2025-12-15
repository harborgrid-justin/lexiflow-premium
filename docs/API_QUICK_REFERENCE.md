# Quick Reference: Backend API Integration

## 🚀 Getting Started

### 1. Enable Backend API Mode
Add to your `.env`:
```env
VITE_USE_BACKEND_API=true
VITE_API_URL=http://localhost:3000
VITE_API_PREFIX=/api/v1
```

### 2. Start the Backend
```bash
cd backend
npm install
npm run start:dev
```

### 3. Use in Frontend
```typescript
import { apiServices } from '@/services';

// Works immediately with authentication
const cases = await apiServices.cases.getAll();
```

## 📦 Available Service Modules

### Core (`apiServices`)
- `cases` - Case management
- `documents` - Document operations
- `docket` - Docket entries
- `evidence` - Evidence items
- `billing` - Time entries & invoicing
- `auth` - Authentication
- `users` - User management
- `notifications` - Notifications
- `webhooks` - Webhook configuration
- `apiKeys` - API key management
- `rateTables` - Billing rate tables
- `feeAgreements` - Fee agreements
- `custodians` - Discovery custodians
- `examinations` - Discovery examinations

### Extended (`extendedApiServices`)
- `trustAccounts` - Trust account management
- `billingAnalytics` - WIP, realization, AR aging
- `reports` - Report templates & generation
- `processingJobs` - Background job monitoring
- `dashboard` - Dashboard data
- `casePhases` - Case phase tracking
- `caseTeams` - Case team management
- `motions` - Motion tracking
- `parties` - Party management
- `pleadings` - Pleading management
- `clauses` - Clause library

### Discovery (`discoveryApiServices`)
- `legalHolds` - Legal hold notices
- `depositions` - Deposition management
- `discoveryRequests` - Discovery requests
- `esiSources` - ESI source tracking
- `privilegeLog` - Privilege log entries
- `productions` - Document productions
- `custodianInterviews` - Custodian interviews

### Compliance (`complianceApiServices`)
- `conflictChecks` - Conflict of interest checks
- `ethicalWalls` - Ethical wall management
- `auditLogs` - System audit trail
- `permissions` - Permission management
- `rlsPolicies` - Row-level security policies
- `complianceReports` - Compliance reporting

## 💡 Common Patterns

### Authentication
```typescript
import { apiServices } from '@/services';

// Login
const { accessToken, user } = await apiServices.auth.login(email, password);

// Get current user
const user = await apiServices.auth.getCurrentUser();

// Logout
await apiServices.auth.logout();
```

### CRUD Operations
```typescript
// GET all (with pagination)
const items = await apiServices.cases.getAll({
  page: 1,
  limit: 50,
  status: 'Active'
});

// GET by ID
const item = await apiServices.cases.getById(id);

// CREATE
const newItem = await apiServices.cases.add(data);

// UPDATE
const updated = await apiServices.cases.update(id, changes);

// DELETE
await apiServices.cases.delete(id);
```

### File Upload
```typescript
// Single file
const doc = await apiServices.documents.upload(file, {
  caseId,
  title: 'Contract'
});

// Multiple files
const docs = await apiServices.documents.bulkUpload(files, { caseId });

// Download
const blob = await apiServices.documents.download(docId);
```

### Error Handling
```typescript
try {
  const data = await apiServices.cases.getById(id);
} catch (error) {
  if (error.statusCode === 404) {
    console.error('Not found');
  } else if (error.statusCode === 401) {
    // Redirect to login
  } else {
    console.error(error.message);
  }
}
```

## 📊 Key Fixes Applied

### Path Corrections
- ✅ Rate Tables: `/billing/rate-tables` → `/api/v1/billing/rates`
- ✅ Webhooks: `/admin/webhooks` → `/api/v1/webhooks`

### New Features Added
- ✅ Case archiving
- ✅ Document versioning & redaction
- ✅ Bulk operations
- ✅ Password reset flow
- ✅ MFA support
- ✅ Time entry approval workflow
- ✅ Trust account management
- ✅ Billing analytics
- ✅ Report generation
- ✅ Processing job monitoring
- ✅ Complete discovery module
- ✅ Complete compliance module

## 📈 Coverage Improvement

**Before:** 15% coverage (~35 endpoints)  
**After:** 77% coverage (~180 endpoints)  
**Improvement:** +62% (+145 endpoints)

## 🔗 More Information

- **Gap Analysis:** `/docs/BACKEND_FRONTEND_GAP_ANALYSIS.md`
- **Integration Summary:** `/docs/BACKEND_FRONTEND_INTEGRATION_COMPLETE.md`
- **Backend Swagger:** http://localhost:3000/api/docs
- **Backend README:** `/backend/README.md`

## 🎯 Next Steps

1. Update UI components to use API services instead of IndexedDB
2. Add loading states and error handling
3. Implement pagination UI for lists
4. Add success/error toast notifications
5. Test all endpoints with backend running

---

**Last Updated:** December 15, 2025
