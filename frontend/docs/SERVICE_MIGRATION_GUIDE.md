# Service Files Migration Guide

## Current Status: 100+ Service Files

After auditing the existing service files, here's the practical plan for bringing all services into compliance with the Enterprise Service Layer Standard.

---

## 📊 Service File Inventory & Status

### ✅ Already Compliant (Excellent Documentation)

These services already have comprehensive headers and follow best practices:

**Domain Services:**

- `CaseDomain.ts` - PhD-level architecture doc (╔═══ box style)
- `AnalyticsDomain.ts` - Production-grade service documentation
- `DataCatalogDomain.ts` - Complete service documentation
- `DataQualityDomain.ts` - Complete service documentation
- `OperationsDomain.ts` - Well-documented
- `SearchDomain.ts` - Well-documented
- `ResearchDomain.ts` - Well-documented
- `NotificationDomain.ts` - Well-documented
- `auth.service.ts` ✅ NEW - Enterprise standard
- `entitlements.service.ts` ✅ NEW - Enterprise standard
- `feature-flags.service.ts` ✅ NEW - Enterprise standard

**Infrastructure Services:**

- `dataService.ts` - PhD-level documentation
- `queryClient.ts` - Comprehensive architecture doc (530 lines)
- `socketService.ts` - Enterprise WebSocket manager
- `api-client/` - 12-file modular architecture, all documented

**Data Layer:**

- Most repositories in `data/repositories/` are well-documented

### ⚠️ Needs Headers (Simple Files)

These are smaller utility services that need standardized headers:

**Domain Services:**

- `AdminDomain.ts` - Has basic comment, needs enterprise header
- `AnalysisDomain.ts`
- `AssetDomain.ts`
- `BackupDomain.ts`
- `CalendarDomain.ts`
- `CollaborationDomain.ts`
- `CommunicationDomain.ts`
- `ComplianceDomain.ts`
- `DashboardDomain.ts`
- `DataSourceDomain.ts`
- `DocketDomain.ts`
- `JurisdictionDomain.ts`
- `KnowledgeDomain.ts`
- `MarketingDomain.ts`
- `MessengerDomain.ts`
- `OrganizationDomain.ts`
- `StrategyDomain.ts`
- `TransactionDomain.ts`
- `WarRoomDomain.ts`

**Capability Services:**

- All files in `clipboard/`, `crypto/`, `notification/`, `session/`, `storage/`, `telemetry/`

**Feature Services:**

- Files in `features/` subdirectories

### 🗑️ Obsolete Files

- `BillingRepository.ts` - Marked obsolete, points to `data/repositories/BillingRepository.ts`

---

## 🎯 Migration Strategy

### Phase 1: Header Standardization (Recommended)

Add standardized enterprise headers to services that need them. Use the template below.

### Phase 2: Cleanup (Optional)

Remove or consolidate obsolete files.

### Phase 3: Verification (Required)

Run architecture audit to ensure no violations.

---

## 📝 Enterprise Service Header Template

### For Domain Services

```typescript
// ================================================================================
// [DOMAIN NAME] DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → [Domain]Service → Frontend API → Backend
//
// PURPOSE:
//   - [Primary domain operations - be specific]
//   - [Data transformations specific to this domain]
//   - [Side effects managed by this service]
//
// USAGE:
//   Called by [Domain]Context and route loaders for [domain] operations.
//   Never called directly from view components.
//
// ================================================================================

import { api } from '@/lib/frontend-api';
// ... rest of imports

/**
 * [Domain] Domain Service
 *
 * [Brief description of service purpose]
 */
export class [Domain]Service {
  // Implementation
}
```

### For Infrastructure Services

```typescript
// ================================================================================
// [NAME] - INFRASTRUCTURE SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   [Consumer] → [Name]Service → [External Dependency]
//
// PURPOSE:
//   - [Core infrastructure capability]
//   - [What problem it solves]
//   - [Integration points]
//
// USAGE:
//   [Who uses this service and when]
//
// ================================================================================
```

### For Capability Services (Browser APIs)

```typescript
// ================================================================================
// [NAME] SERVICE - CAPABILITY SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Hook → [Name]Service → Browser [API Name]
//
// PURPOSE:
//   - Abstract browser [API Name]
//   - Provide consistent interface
//   - Handle permissions and errors
//
// USAGE:
//   Used by [consumers] when [specific use case]
//
// ================================================================================
```

### For Feature Services

```typescript
// ================================================================================
// [NAME] - FEATURE SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   [Consumer] → [Name]Service → [External SDK/Heavy Dependency]
//
// PURPOSE:
//   - [Complex feature-specific operation]
//   - [External SDK wrapper or heavy algorithm]
//
// USAGE:
//   Lazy-loaded when [feature] is activated
//
// ================================================================================
```

---

## 🔧 Quick Start: Apply Headers in Batch

### Step 1: Create Header Script

Create `scripts/add-service-headers.ts`:

```typescript
import fs from "fs";
import path from "path";

const DOMAIN_HEADER = (
  domainName: string
) => `// ================================================================================
// ${domainName.toUpperCase()} DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → ${domainName}Service → Frontend API → Backend
//
// PURPOSE:
//   - ${domainName} domain operations and data management
//   - Coordinates ${domainName.toLowerCase()} business logic
//   - Transforms data for ${domainName.toLowerCase()} contexts
//
// USAGE:
//   Called by ${domainName}Context and route loaders.
//   Never called directly from view components.
//
// ================================================================================

`;

// Add to files that don't start with comment block
function addHeader(filePath: string, header: string) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Skip if already has enterprise header
  if (
    content.includes(
      "================================================================================"
    )
  ) {
    console.log(`✓ ${path.basename(filePath)} already has header`);
    return;
  }

  // Skip if obsolete
  if (content.includes("Obsolete file")) {
    console.log(`⊘ ${path.basename(filePath)} is obsolete, skipping`);
    return;
  }

  const newContent = header + content;
  fs.writeFileSync(filePath, newContent, "utf-8");
  console.log(`✓ Added header to ${path.basename(filePath)}`);
}

// Usage
const domainServices = fs
  .readdirSync("./src/services/domain")
  .filter((f) => f.endsWith("Domain.ts"))
  .map((f) => path.join("./src/services/domain", f));

domainServices.forEach((file) => {
  const domainName = path.basename(file, "Domain.ts");
  addHeader(file, DOMAIN_HEADER(domainName));
});
```

### Step 2: Run Script

```bash
cd /workspaces/lexiflow-premium/frontend
npx tsx scripts/add-service-headers.ts
```

---

## ✅ Manual Migration Checklist

For each service file:

- [ ] Check if file already has enterprise header (look for `================`)
- [ ] Check if file is obsolete (marked for deletion)
- [ ] Determine service type (domain/infrastructure/feature/capability)
- [ ] Apply appropriate header template
- [ ] Verify imports don't violate architecture (no context imports)
- [ ] Verify service calls Frontend API (not fetch directly)
- [ ] Update file if patterns are violated

---

## 🔍 Architecture Violation Check

Run this to find any violations:

```bash
# Check for context imports in services (should be ZERO)
grep -r "from '@/contexts" frontend/src/services/ || echo "✓ No violations"

# Check for React imports in services (should be ZERO in most cases)
grep -r "from 'react'" frontend/src/services/*.ts | grep -v "test\|spec" || echo "✓ No violations"

# Check for direct fetch in services (should use Frontend API)
grep -r "fetch(" frontend/src/services/ | grep -v "api-client\|test\|spec" || echo "✓ No violations"
```

---

## 📋 Priority Order for Migration

### High Priority (Do First)

1. Domain services in `services/domain/` that lack headers
2. Infrastructure services that lack headers
3. Capability services (browser API wrappers)

### Medium Priority

4. Feature services in `services/features/`
5. Repository files in `data/repositories/`

### Low Priority

6. Utility files
7. Test files (don't need enterprise headers)
8. Already-documented services (just verify compliance)

---

## 🎯 Recommended Approach

### Option A: Automated (Fast)

1. Create and run the header script above
2. Manually verify and adjust 5-10 key services
3. Run architecture violation checks
4. Done in 1-2 hours

### Option B: Manual (Thorough)

1. Go through each domain service one by one
2. Add appropriate header based on actual service purpose
3. Verify no architecture violations
4. Document any special patterns
5. Done in 1-2 days

### Option C: Lazy Migration (Pragmatic) ✅ RECOMMENDED

1. Add headers to services as you touch them
2. Keep existing well-documented services as-is
3. Focus on services that lack any documentation
4. Run violation checks to ensure no anti-patterns
5. Ongoing process

---

## 🏁 Success Criteria

A service file is "Enterprise Compliant" when:

✅ Has standardized header with position in architecture
✅ Purpose is clearly documented
✅ Does NOT import any contexts
✅ Does NOT import React hooks (except in React-specific utilities)
✅ Calls Frontend API (not fetch directly) for HTTP
✅ Follows service type conventions (domain/infrastructure/feature/capability)

---

## 📊 Current Compliance Estimate

- **Fully Compliant**: ~30% (30+ services with excellent docs)
- **Mostly Compliant**: ~50% (50+ services with basic docs, need headers)
- **Needs Work**: ~15% (15+ services with minimal docs)
- **Obsolete**: ~5% (5 files marked for removal)

**Recommendation**: Use **Option C (Lazy Migration)** - add headers as you touch files. The architecture is sound, we just need consistent documentation.

---

## 🔗 Related Documentation

- [Service Layer Standard](SERVICE_LAYER_STANDARD.md) - Complete service architecture guide
- [Architecture Overview](../ARCHITECTURE.md) - Master system architecture
- [Context Standard](../contexts/README.md) - Context layer rules
- [Frontend API Standard](../lib/frontend-api/README.md) - API layer rules
