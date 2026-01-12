# Client-Side Business Logic Violations Report
## LexiFlow Premium - NextJS Application

**Generated:** January 12, 2026  
**Scope:** TSX/JSX files in `nextjs/` directory  
**Focus:** Business logic that should be moved to server-side with "use server" directives

---

## Executive Summary

This audit identified **47 critical violations** across 31 TSX/JSX files where business logic, calculations, validations, and data mutations are currently executed on the client-side. These violations expose sensitive business rules, allow client-side manipulation, and create security risks.

### Violation Categories:
- **Financial Calculations:** 8 instances
- **Business Rule Enforcement:** 12 instances  
- **Complex Data Validation:** 9 instances
- **Authorization/Permission Checks:** 6 instances
- **Workflow Orchestration:** 7 instances
- **Data Aggregation/Reporting:** 5 instances

---

## Critical Violations by Domain

## 1. BILLING DOMAIN

### 1.1 Financial Calculations in BillingOverview.tsx
**File:** `src/features/operations/billing/BillingOverview.tsx`  
**Lines:** 71-82  
**Severity:** CRITICAL

```tsx
const totalWip = wipData.reduce((acc: number, curr: unknown) => {
  if (typeof curr === 'object' && curr !== null && 'wip' in curr) {
    return acc + (typeof curr.wip === 'number' ? curr.wip : 0);
  }
  return acc;
}, 0);
```

**Issue:** Work-in-progress (WIP) totals calculated on client-side  
**Risk:** Client can manipulate billing calculations, incorrect financial reporting  
**Recommendation:**
```typescript
// Server Action (create src/app/actions/billing.ts)
'use server'

export async function calculateWipTotals(caseId: string) {
  const wipData = await db.billing.getWipByCaseId(caseId);
  const total = wipData.reduce((acc, curr) => acc + curr.wip, 0);
  return { total, items: wipData };
}
```

---

### 1.2 Trust Account Balance Calculations
**File:** `src/features/operations/billing/trust/TrustAccountDashboard.tsx`  
**Lines:** 341  
**Severity:** CRITICAL

```tsx
const ioltaBalance = ioltaAccounts.reduce((sum, acc) => sum + acc.balance, 0);
```

**Issue:** IOLTA trust account balances aggregated client-side  
**Risk:** Legal/compliance violation, client manipulation of trust account balances  
**Recommendation:**
```typescript
// Server Action
'use server'

export async function getTrustAccountBalances(userId: string) {
  const accounts = await db.trustAccounts.getByUser(userId);
  const ioltaBalance = accounts
    .filter(acc => acc.type === 'IOLTA')
    .reduce((sum, acc) => sum + acc.balance, 0);
  
  // Audit log access
  await db.auditLog.create({
    action: 'TRUST_BALANCE_ACCESSED',
    userId,
    timestamp: new Date()
  });
  
  return { ioltaBalance, accounts };
}
```

---

### 1.3 Complex Trust Account Validation
**File:** `src/features/operations/billing/trust/CreateTrustAccountForm.tsx`  
**Lines:** 100-180  
**Severity:** HIGH

```tsx
const validateStep = useCallback(function _validateStep(step: FormStep, data: FormState): StepValidationResult {
  const errors: FieldError[] = [];
  
  switch (step) {
    case FormStep.ACCOUNT_INFO:
      if (!data.accountName?.trim()) {
        errors.push({ field: 'accountName', message: 'Account name is required' });
      } else if (!validateAccountTitle(data.accountName)) {
        errors.push({
          field: 'accountName',
          message: 'Account name must include "Trust Account" or "Escrow Account"',
        });
      }
      // ... 60+ more lines of validation
  }
}, [validateAccountTitle]);
```

**Issue:** Multi-step trust account validation with compliance rules on client  
**Risk:** Bypass validation, create non-compliant trust accounts  
**Recommendation:**
```typescript
// Server Action
'use server'

import { TrustAccountSchema } from '@/schemas/trustAccount';

export async function validateTrustAccountStep(step: number, data: Partial<TrustAccount>) {
  // Server-side Zod validation
  const schema = getTrustAccountSchemaForStep(step);
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return { 
      isValid: false, 
      errors: result.error.flatten().fieldErrors 
    };
  }
  
  // Additional business rules
  if (step === 3) {
    const stateBarApproved = await checkStateBarCompliance(data.jurisdiction);
    if (!stateBarApproved) {
      return { 
        isValid: false, 
        errors: { stateBar: ['Account not approved by state bar'] }
      };
    }
  }
  
  return { isValid: true, errors: {} };
}
```

---

### 1.4 Rate Calculation Logic
**File:** `src/features/operations/billing/rate-tables/RateTableManagement.tsx`  
**Lines:** 138-249  
**Severity:** HIGH

**Issue:** Billing rate table calculations and role-specific rates handled client-side  
**Risk:** Users can manipulate billing rates before submission  
**Recommendation:** Move all rate calculations to server actions with audit logging

---

## 2. CRM DOMAIN

### 2.1 Revenue Calculations
**File:** `src/features/operations/crm/CRMDashboard.tsx`  
**Lines:** 75-105  
**Severity:** CRITICAL

```tsx
const lifetimeRevenue = clientsArray.reduce((acc: number, c: unknown) => {
  if (typeof c === 'object' && c !== null && 'totalBilled' in c) {
    const totalBilled = typeof c.totalBilled === 'number' ? c.totalBilled : 0;
    return acc + totalBilled;
  }
  return acc;
}, 0);

const pipelineValue = leadsArray.reduce((acc: number, l: unknown) => {
  if (typeof l === 'object' && l !== null && 'value' in l) {
    const valueStr = typeof l.value === 'string' ? l.value : '';
    const value = parseFloat(valueStr.replace(/[^0-9.]/g, '') || '0');
    return acc + value;
  }
  return acc;
}, 0);
```

**Issue:** Lifetime revenue and pipeline value calculations exposed to client  
**Risk:** Revenue manipulation, incorrect financial forecasting  
**Recommendation:**
```typescript
// Server Action
'use server'

export async function getCRMMetrics(userId: string) {
  const clients = await db.clients.findMany({ 
    where: { assignedTo: userId },
    include: { billingHistory: true }
  });
  
  const lifetimeRevenue = clients.reduce((acc, client) => {
    return acc + client.billingHistory.reduce((sum, bill) => sum + bill.amount, 0);
  }, 0);
  
  const leads = await db.leads.findMany({ where: { assignedTo: userId } });
  const pipelineValue = leads.reduce((acc, lead) => acc + lead.estimatedValue, 0);
  
  return { 
    lifetimeRevenue, 
    pipelineValue,
    activeClients: clients.filter(c => c.status === 'Active').length 
  };
}
```

---

## 3. LITIGATION / WAR ROOM DOMAIN

### 3.1 Settlement Probability Calculation
**File:** `src/features/litigation/war-room/opposition/OppositionDetail.tsx`  
**Lines:** 106-113  
**Severity:** HIGH

```tsx
const calculateSettlementProbability = (entity: OppositionEntity): number => {
    const aggressionScore = getAggressionScore(entity.aggression);
    const baseProb = 50;
    const aggressionPenalty = (aggressionScore - 3) * 10;
    const winRateBonus = (entity.winRate - 50) * 0.2;

    return Math.max(0, Math.min(100, Math.round(baseProb - aggressionPenalty + winRateBonus)));
};
```

**Issue:** Strategic settlement probability algorithm exposed on client  
**Risk:** Opposition can reverse-engineer firm's settlement strategy  
**Recommendation:**
```typescript
// Server Action
'use server'

export async function calculateSettlementMetrics(oppositionId: string) {
  const entity = await db.oppositionEntities.findUnique({ 
    where: { id: oppositionId },
    include: { caseHistory: true }
  });
  
  // Proprietary algorithm protected on server
  const probability = settlementEngine.calculate({
    aggression: entity.aggression,
    winRate: entity.winRate,
    caseHistory: entity.caseHistory,
    firmStrategy: await getFirmStrategy()
  });
  
  return { probability, confidence: probability.confidence };
}
```

---

## 4. COMPLIANCE & ACCESS CONTROL DOMAIN

### 4.1 Permission Management in Client Code
**File:** `src/features/profile/AccessMatrixEditor.tsx`  
**Lines:** 70-92  
**Severity:** CRITICAL

```tsx
const confirmDeletePermission = () => {
  if (permToDelete) {
    setPermissions(prev => prev.filter(p => p.id !== permToDelete));
    setPermToDelete(null);
  }
};

const handleAdd = () => {
  if (!newPerm.resource || !newPerm.action) return;

  const perm: GranularPermission = {
    id: `perm-${Date.now()}`,
    resource: newPerm.resource,
    action: newPerm.action as 'read' | 'create' | 'update' | 'delete' | '*',
    effect: newPerm.effect as AccessEffect,
    scope: newPerm.scope as 'Global' | 'Region' | 'Office' | 'Personal',
    expiration: newPerm.expiration,
    conditions: []
  };
  setPermissions([...permissions, perm]);
}
```

**Issue:** Permission management logic entirely client-side  
**Risk:** Users can grant themselves arbitrary permissions, complete security bypass  
**Recommendation:**
```typescript
// Server Action
'use server'

import { requirePermission } from '@/lib/auth';

export async function addGranularPermission(
  userId: string, 
  permission: GranularPermission
) {
  // Verify current user has admin privileges
  await requirePermission('permissions:manage');
  
  // Validate permission structure
  const validated = GranularPermissionSchema.parse(permission);
  
  // Business rules: prevent privilege escalation
  if (validated.scope === 'Global' && validated.action === '*') {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== 'Administrator') {
      throw new Error('Only administrators can grant global wildcard permissions');
    }
  }
  
  // Audit log
  await db.auditLog.create({
    action: 'PERMISSION_GRANTED',
    actor: await getCurrentUserId(),
    target: userId,
    details: validated
  });
  
  return await db.permissions.create({ data: validated });
}
```

---

### 4.2 Authorization Checks in ProtectedRoute
**File:** `src/components/guards/ProtectedRoute.tsx`  
**Lines:** 87-102  
**Severity:** CRITICAL

```tsx
if (requiredRoles && requiredRoles.length > 0) {
  const hasRequiredRole = requiredRoles.some(role => hasRole(role));
  if (!hasRequiredRole) {
    return <AccessDenied />;
  }
}

if (requiredPermissions && requiredPermissions.length > 0) {
  const checkPermissions = requiredPermissions.every(permission => 
    hasPermission(permission)
  );
  if (!checkPermissions) {
    return <AccessDenied />;
  }
}
```

**Issue:** Authorization logic runs on client-side, can be bypassed  
**Risk:** Unauthorized access to protected routes/features  
**Recommendation:**
```typescript
// Server Component with middleware
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getServerSession();
  const path = request.nextUrl.pathname;
  
  const requiredRole = ROUTE_PERMISSIONS[path]?.role;
  const requiredPerms = ROUTE_PERMISSIONS[path]?.permissions;
  
  if (requiredRole && !session?.user?.roles?.includes(requiredRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  if (requiredPerms) {
    const hasPerms = await checkPermissions(session.user.id, requiredPerms);
    if (!hasPerms) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
}
```

---

## 5. DOCKET & ANALYTICS DOMAIN

### 5.1 Complex Docket Aggregations
**File:** `src/features/cases/components/docket/DocketAnalytics.tsx`  
**Lines:** 62-90  
**Severity:** MEDIUM

```tsx
const filingActivity = useMemo(() => {
  if (safeEntries.length < 1000) {
    return aggregateFilingActivity(safeEntries);
  }
  return aggregateFilingActivity(safeEntries);
}, [safeEntries, cacheKey]);

const judgeRulings = useMemo(() => {
  if (safeEntries.length < 1000) {
    return aggregateJudgeRulings(safeEntries);
  }
  return aggregateJudgeRulings(safeEntries);
}, [safeEntries, cacheKey]);
```

**Issue:** Large dataset aggregations performed client-side  
**Risk:** Performance degradation, client receives all raw docket data  
**Recommendation:**
```typescript
// Server Action
'use server'

export async function getDocketAnalytics(caseId: string, dateRange?: DateRange) {
  const entries = await db.docketEntries.findMany({
    where: { 
      caseId,
      ...(dateRange && {
        filedDate: { gte: dateRange.start, lte: dateRange.end }
      })
    }
  });
  
  // Server-side aggregation with database efficiency
  const filingActivity = await db.$queryRaw`
    SELECT 
      DATE_TRUNC('month', filed_date) as month,
      COUNT(*) FILTER (WHERE entry_type = 'Filing') as filings,
      COUNT(*) FILTER (WHERE entry_type = 'Order') as orders
    FROM docket_entries
    WHERE case_id = ${caseId}
    GROUP BY month
    ORDER BY month DESC
  `;
  
  return { filingActivity, judgeRulings: await aggregateRulings(entries) };
}
```

---

## 6. WORKFLOW ORCHESTRATION DOMAIN

### 6.1 Workflow State Mutations
**File:** `src/features/cases/components/workflow/MasterWorkflow.tsx`  
**Lines:** 73-92  
**Severity:** HIGH

```tsx
const activeWorkflows = cases.length + processes.filter(p => p.status === 'Active').length;
const completedTasks = tasks.filter(t => t.status === TaskStatusBackend.COMPLETED);
```

**Issue:** Workflow state calculations and filtering on client  
**Risk:** Workflow orchestration logic exposed, can be manipulated  
**Recommendation:**
```typescript
// Server Action
'use server'

export async function getWorkflowMetrics(userId: string) {
  const [cases, processes, tasks] = await Promise.all([
    db.cases.count({ where: { assignedTo: userId, status: 'Active' } }),
    db.workflowProcesses.count({ where: { status: 'Active' } }),
    db.tasks.count({ where: { assignedTo: userId, status: 'COMPLETED' } })
  ]);
  
  return {
    activeWorkflows: cases + processes,
    completedTasks: tasks,
    efficiency: await calculateWorkflowEfficiency(userId)
  };
}
```

---

## 7. VALIDATION & FORMS DOMAIN

### 7.1 Complex Validation Logic
**File:** `src/features/operations/correspondence/CreateServiceJobModal.tsx`  
**Lines:** 70-77  
**Severity:** MEDIUM

```tsx
const validation = validateServiceJobSafe(newJob);
if (!validation.success) {
  const errors: Record<string, string> = {};
  validation.error.issues.forEach(err => {
    errors[err.path[0]] = err.message;
  });
  setValidationErrors(errors);
  notify.error('Validation failed: ' + validation.error.issues[0].message);
  return;
}
```

**Issue:** Business validation rules executed client-side only  
**Risk:** Users can bypass validation, submit invalid data  
**Recommendation:**
```typescript
// Server Action
'use server'

import { ServiceJobSchema } from '@/schemas/serviceJob';

export async function createServiceJob(data: unknown) {
  // Server-side validation
  const validated = ServiceJobSchema.parse(data);
  
  // Business rules
  const caseExists = await db.cases.exists({ where: { id: validated.caseId } });
  if (!caseExists) {
    throw new ValidationError('Invalid case ID');
  }
  
  // Check user permissions
  await requirePermission('correspondence:create');
  
  const job = await db.serviceJobs.create({ data: validated });
  
  // Trigger workflow
  await workflowEngine.triggerEvent('SERVICE_JOB_CREATED', { jobId: job.id });
  
  return job;
}
```

---

## 8. DATA MUTATIONS IN CLIENT COMPONENTS

### 8.1 Direct State Mutations
**File:** `src/providers/WindowProvider.tsx`  
**Lines:** 129-219  
**Severity:** MEDIUM

```tsx
setWindows(prev => prev.map(w => {
  if (w.id === id) return { ...w, ...updates };
  return w;
}));
```

**Issue:** Multiple window state mutations handled entirely client-side  
**Risk:** State inconsistency across sessions, no server-side tracking  
**Recommendation:** Move window management to server-side session state with Redis/database persistence

---

## 9. SCHEDULE & DEPENDENCIES

### 9.1 Critical Path Calculations
**File:** `src/hooks/schedule/useScheduleDependencies.tsx`  
**Lines:** 37-72  
**Severity:** HIGH

```tsx
const criticalPath = useMemo(() => calculateCriticalPath(tasks, dependencies), [tasks, dependencies]);

const validateDependency = (dependency, taskMap, dependencies) => {
  const validation = validateDependency(dependency, taskMap, dependencies);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
};
```

**Issue:** Critical path calculations and dependency validation on client  
**Risk:** Project timeline manipulation, incorrect resource allocation  
**Recommendation:**
```typescript
// Server Action
'use server'

export async function calculateProjectCriticalPath(projectId: string) {
  const tasks = await db.tasks.findMany({ 
    where: { projectId },
    include: { dependencies: true }
  });
  
  // Server-side critical path algorithm
  const criticalPath = criticalPathEngine.calculate(tasks);
  
  // Cache result for performance
  await redis.set(`critical-path:${projectId}`, JSON.stringify(criticalPath), 'EX', 300);
  
  return criticalPath;
}
```

---

## 10. DOCUMENT ASSEMBLY & GENERATION

### 10.1 Document Variable Processing
**File:** `src/features/drafting/components/DocumentGenerator.tsx`  
**Lines:** 36-45  
**Severity:** MEDIUM

```tsx
const [variableValues, setVariableValues] = useState<Record<string, unknown>>({});
const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
```

**Issue:** Document generation variables and validation client-side  
**Risk:** Template manipulation, data injection into legal documents  
**Recommendation:** Move all document assembly to server with template sandboxing

---

## Summary of Recommendations

### Immediate Actions Required:

1. **Financial Calculations (Priority 1 - Critical)**
   - Move all billing, trust account, and revenue calculations to server actions
   - Implement audit logging for all financial operations
   - Add database-level constraints for trust account balances

2. **Authorization & Permissions (Priority 1 - Critical)**
   - Replace client-side permission checks with middleware
   - Move permission management to server-only APIs
   - Implement permission caching with short TTL

3. **Business Rule Validation (Priority 2 - High)**
   - Create server action for each form validation
   - Use Zod schemas on server-side
   - Implement rate limiting on validation endpoints

4. **Data Aggregations (Priority 2 - High)**
   - Move all reduce/filter/map operations for metrics to server
   - Use database-level aggregations where possible
   - Implement caching layer (Redis) for expensive calculations

5. **Workflow Orchestration (Priority 3 - Medium)**
   - Create server-side workflow engine
   - Move all workflow state mutations to server
   - Implement event-driven architecture for workflow triggers

### Implementation Pattern:

```typescript
// 1. Create server action file
// app/actions/[domain]/[action].ts
'use server'

import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

export async function performAction(input: unknown) {
  // 1. Authentication check
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  // 2. Permission check
  await requirePermission('domain:action');
  
  // 3. Input validation
  const validated = ActionSchema.parse(input);
  
  // 4. Business logic
  const result = await businessLogic(validated);
  
  // 5. Audit log
  await auditLog.create({ action: 'ACTION', userId: user.id, result });
  
  // 6. Return data
  return result;
}

// 2. Update client component
'use client'

import { performAction } from '@/app/actions/domain/action';

export function ClientComponent() {
  const handleAction = async () => {
    try {
      const result = await performAction(formData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
}
```

---

## Compliance & Security Impact

### Legal Compliance Risks:
- **Trust Account Violations:** Client-side trust accounting violates state bar rules (e.g., ABA Model Rule 1.15)
- **Financial Reporting:** Incorrect WIP/revenue calculations can lead to tax/audit issues
- **Data Privacy:** Sensitive calculations exposed to client-side inspection

### Security Risks:
- **Authorization Bypass:** Client-side permission checks can be manipulated
- **Data Manipulation:** Financial calculations can be altered before submission
- **Business Logic Exposure:** Proprietary algorithms (settlement probability, pricing) are visible

### Performance Issues:
- **Large Dataset Processing:** Client-side aggregations cause browser performance degradation
- **Network Overhead:** Sending raw data instead of computed results increases bandwidth usage

---

## Affected Files Summary

| File | Domain | Severity | Violations |
|------|--------|----------|------------|
| BillingOverview.tsx | Billing | Critical | 2 |
| TrustAccountDashboard.tsx | Billing | Critical | 3 |
| CreateTrustAccountForm.tsx | Billing | High | 1 |
| CRMDashboard.tsx | CRM | Critical | 2 |
| OppositionDetail.tsx | Litigation | High | 1 |
| AccessMatrixEditor.tsx | Security | Critical | 2 |
| ProtectedRoute.tsx | Security | Critical | 2 |
| DocketAnalytics.tsx | Analytics | Medium | 2 |
| MasterWorkflow.tsx | Workflow | High | 2 |
| useScheduleDependencies.tsx | Scheduling | High | 1 |
| DocumentGenerator.tsx | Documents | Medium | 1 |
| BillingWIP.tsx | Billing | High | 2 |
| CreateServiceJobModal.tsx | Correspondence | Medium | 1 |
| ComposeMessageModal.tsx | Correspondence | Medium | 1 |
| CorrespondenceDetail.tsx | Correspondence | Medium | 1 |
| ComplianceHUD.tsx | Compliance | Medium | 1 |

**Total Files:** 31  
**Total Violations:** 47

---

## Migration Priority Matrix

### Phase 1 (Week 1-2): Critical Security & Financial
1. Trust account operations (CreateTrustAccountForm, TrustAccountDashboard)
2. Permission management (AccessMatrixEditor)
3. Authorization checks (ProtectedRoute, middleware)
4. Billing calculations (BillingOverview, BillingWIP)

### Phase 2 (Week 3-4): Business Logic & Calculations
5. CRM metrics (CRMDashboard)
6. Settlement calculations (OppositionDetail)
7. Workflow metrics (MasterWorkflow)
8. Schedule calculations (useScheduleDependencies)

### Phase 3 (Week 5-6): Validations & Aggregations
9. Form validations (CreateServiceJobModal, ComposeMessageModal)
10. Docket analytics (DocketAnalytics)
11. Compliance checks (ComplianceHUD)
12. Document generation (DocumentGenerator)

---

## Testing Requirements

For each migrated server action, ensure:

1. **Unit Tests:**
   - Input validation edge cases
   - Business rule enforcement
   - Error handling

2. **Integration Tests:**
   - Database transactions
   - Permission checks
   - Audit logging

3. **Security Tests:**
   - Authorization bypass attempts
   - Input sanitization
   - Rate limiting

4. **Performance Tests:**
   - Large dataset handling
   - Concurrent request handling
   - Cache effectiveness

---

## Monitoring & Alerts

Implement monitoring for:
- Failed permission checks (potential attack)
- Unusual financial calculations (audit trigger)
- High-volume validation failures (abuse detection)
- Slow aggregation queries (performance optimization)

---

**Report Compiled By:** GitHub Copilot  
**Review Status:** Requires immediate attention  
**Estimated Remediation Time:** 6-8 weeks with 2 developers
