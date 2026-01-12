# Environment Variable & Server-Side Security Audit Report
**LexiFlow Next.js Application**  
**Date:** January 12, 2026  
**Scope:** TSX/JSX files in `C:\temp\lexiflow-premium\nextjs`

---

## Executive Summary

This audit identified **7 major violation categories** across **30+ TSX/JSX files** that contain improper environment variable usage, client-side exposure of server-only operations, and security concerns. The codebase is using **Vite-style environment variables** (`import.meta.env`) instead of Next.js conventions (`process.env.NEXT_PUBLIC_*`), indicating a hybrid or migrated architecture.

**Critical Findings:**
- ❌ API keys exposed in client-side code (AI provider keys)
- ❌ Vite environment variables used instead of Next.js conventions
- ⚠️ `process.env.NODE_ENV` used in client components (acceptable but could be optimized)
- ⚠️ Configuration imports in client code without server boundaries
- ⚠️ Browser API usage in files without proper SSR guards

---

## Violation Categories

### 1. ⚠️ **Vite Environment Variables in Client Components**
**Severity:** HIGH - Architectural inconsistency with Next.js  
**Impact:** These won't work properly in Next.js production builds

#### Files Affected:
1. **[src/features/cases/components/import/CaseImporter.tsx](src/features/cases/components/import/CaseImporter.tsx#L92-L93)**
   ```tsx
   // Lines 92-93
   const apiKey = aiProvider === 'gemini'
     ? (localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY)
     : (localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY);
   ```
   **Violation:** Vite-style env vars (`VITE_*`) used in Next.js application  
   **Exposed:** `VITE_GEMINI_API_KEY`, `VITE_OPENAI_API_KEY`  
   **Security Risk:** ⚠️ API keys in client bundle if defined  
   **Recommendation:**
   - Move API key storage to server-side only (database/secrets manager)
   - Create server actions to proxy AI API calls
   - If client-side access required, use `NEXT_PUBLIC_` prefix with caution
   - Example:
     ```tsx
     'use server';
     export async function parseWithAI(text: string, provider: string) {
       const apiKey = process.env.GEMINI_API_KEY; // Server-only
       // Make AI call here
     }
     ```

2. **[src/features/operations/billing/BillingErrorBoundary.tsx](src/features/operations/billing/BillingErrorBoundary.tsx#L43)**
   ```tsx
   // Line 43
   if (import.meta.env.PROD) {
     console.error('Billing Error:', error, errorInfo);
   }
   ```
   **Violation:** Vite-style env check instead of Next.js convention  
   **Recommendation:**
   ```tsx
   if (process.env.NODE_ENV === 'production') {
     // Or use Next.js build-time constant
   }
   ```

3. **[src/components/ui/layouts/PerformanceMonitor/PerformanceMonitor.tsx](src/components/ui/layouts/PerformanceMonitor/PerformanceMonitor.tsx#L202-L266)**
   ```tsx
   // Lines 202, 266
   if (import.meta.env.DEV) {
     console.warn('Performance warning...');
   }
   ```
   **Violation:** Vite-style development check  
   **Recommendation:**
   ```tsx
   if (process.env.NODE_ENV === 'development') {
     console.warn('Performance warning...');
   }
   ```

4. **[src/components/ui/layouts/withErrorBoundary/withErrorBoundary.tsx](src/components/ui/layouts/withErrorBoundary/withErrorBoundary.tsx#L44-L90)**
   ```tsx
   // Lines 44, 56, 90
   if (import.meta.env.DEV && actualDuration > 16) { ... }
   if (import.meta.env.PROD) { ... }
   enableProfiling = import.meta.env.DEV
   ```
   **Violation:** Multiple Vite-style env checks  
   **Recommendation:** Replace with `process.env.NODE_ENV` checks

---

### 2. ✅ **Acceptable `process.env.NODE_ENV` Usage**
**Severity:** LOW - Standard practice but could be optimized  
**Impact:** Acceptable in client components for dev/prod conditional logic

These files use `process.env.NODE_ENV` correctly for development vs production checks:

| File | Lines | Usage |
|------|-------|-------|
| [CorrespondenceErrorBoundary.tsx](src/features/operations/correspondence/CorrespondenceErrorBoundary.tsx) | 54, 99 | Error tracking conditional |
| [BillingErrorBoundary.tsx](src/features/operations/billing/BillingErrorBoundary.tsx) | 168 | Development error details |
| [DocumentGenerator.tsx](src/features/drafting/components/DocumentGenerator.tsx) | 69, 107 | Debug logging |
| [EvidenceErrorBoundary.tsx](src/features/litigation/evidence/EvidenceErrorBoundary.tsx) | 45, 65 | Error logging |
| [DiscoveryErrorBoundary.tsx](src/features/litigation/discovery/DiscoveryErrorBoundary.tsx) | 65 | Development mode check |
| [error.tsx (main)](src/app/(main)/error.tsx) | 50 | Development error details |
| [error.tsx (workflows)](src/app/(main)/workflows/error.tsx) | 37 | Development mode check |
| [error.tsx (real-estate)](src/app/(main)/real-estate/error.tsx) | 52 | Development error details |
| [error.tsx (research)](src/app/(main)/research/error.tsx) | 44 | Development mode check |
| [PerformanceMonitor.tsx](src/components/ui/layouts/PerformanceMonitor/PerformanceMonitor.tsx) | 165, 315 | Conditional monitoring |
| [ErrorBoundary.tsx](src/components/ErrorBoundary.tsx) | 30 | Development logging |

**Recommendation:** These are acceptable but could be optimized:
- Use build-time dead code elimination
- Consider extracting to constants: `const IS_DEV = process.env.NODE_ENV === 'development'`

---

### 3. 🔴 **Server-Only Environment Variables in Server Component**
**Severity:** MEDIUM - Proper usage but needs verification  
**Impact:** Correct pattern if truly server component

#### File:
**[src/app/(main)/admin/settings/page.tsx](src/app/(main)/admin/settings/page.tsx#L64)**
```tsx
// Line 64 - in getDefaultSettings() function
backendUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
```

**Status:** ✅ Correct usage - `NEXT_PUBLIC_` prefix allows client access  
**Note:** This is a server component (no 'use client' directive), accessing properly prefixed env var

**Verification Needed:**
- Confirm this file is a server component (appears to be based on metadata export)
- If this data reaches client, `NEXT_PUBLIC_` prefix is correct
- **Action:** Verify no sensitive data is exposed through this endpoint

---

### 4. ⚠️ **Configuration Provider with Environment Access**
**Severity:** MEDIUM - Potential data leak if not careful  
**Impact:** Configuration data could expose internal architecture

#### File:
**[src/providers/DataSourceProvider.tsx](src/providers/DataSourceProvider.tsx#L70-L198)**
```tsx
// Lines 70-72, 152, 170, 179, 196-199
config.observability.logger?.info('Creating repository instances', {
  environment: config.environment.environment,
  apiVersion: config.environment.apiVersion,
});

// Line 179: Comment mentions Vite environment variable
// Use VITE_USE_INDEXEDDB for consistency with apiConfig.ts
```

**Violations:**
1. Configuration object passed to client contains environment details
2. References Vite environment variables in comments
3. Logger calls may expose internal architecture

**Recommendation:**
```tsx
'use client'; // Mark as client component explicitly

// Create server action for configuration
// actions/getDataSourceConfig.ts
'use server';
export async function getDataSourceConfig() {
  return {
    environment: process.env.NODE_ENV, // Safe to expose
    apiVersion: process.env.NEXT_PUBLIC_API_VERSION,
    // Do NOT expose: DB URLs, secrets, internal endpoints
  };
}

// In DataSourceProvider.tsx
const config = await getDataSourceConfig(); // Use server action
```

---

### 5. ⚠️ **Browser API Usage Without SSR Guards**
**Severity:** MEDIUM - Runtime errors in server-side rendering  
**Impact:** Hydration mismatches, SSR failures

#### Files:
1. **[src/features/operations/billing/BillingErrorBoundary.tsx](src/features/operations/billing/BillingErrorBoundary.tsx#L70)**
   ```tsx
   // Line 70
   handleGoHome = () => {
     window.location.href = '/';
   };
   ```
   **Issue:** Direct `window` access in class method  
   **Recommendation:** Add SSR guard or use Next.js router
   ```tsx
   'use client'; // Ensure this is marked
   import { useRouter } from 'next/navigation';
   
   const router = useRouter();
   const handleGoHome = () => router.push('/');
   ```

2. **[src/app/(main)/error.tsx](src/app/(main)/error.tsx#L38-L42)**
   ```tsx
   // Lines 38-42
   url: typeof window !== 'undefined' ? window.location.href : 'unknown',
   userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
   ```
   **Status:** ✅ Proper SSR guard with `typeof window !== 'undefined'`  
   **Note:** This is correct usage

3. **[src/components/enterprise/auth/SSOLogin.tsx](src/components/enterprise/auth/SSOLogin.tsx#L173-L273)**
   ```tsx
   // Line 173
   if (typeof window !== 'undefined') {
     window.location.href = ssoUrl;
   }
   
   // Line 260
   const params = new URLSearchParams(window.location.search);
   ```
   **Status:** ✅ Proper SSR guard for redirect, ⚠️ No guard for URLSearchParams  
   **Recommendation:**
   ```tsx
   'use client'; // Add directive
   
   React.useEffect(() => {
     // Ensure client-side only execution
     const params = new URLSearchParams(window.location.search);
   }, []);
   ```

4. **[src/providers/WindowProvider.tsx](src/providers/WindowProvider.tsx#L74-L103)**
   ```tsx
   // Line 74, 103
   return localStorage.getItem('lexiflow_orbital_mode') !== 'false';
   let root = document.getElementById('window-layer');
   ```
   **Status:** Needs 'use client' directive (appears to be client component)  
   **Recommendation:** Verify 'use client' is at top of file

5. **[src/providers/SyncContext.refactored.tsx](src/providers/SyncContext.refactored.tsx#L164-L260)**
   ```tsx
   // Lines 164, 254
   if (!navigator.onLine || isProcessingRef.current) return;
   window.addEventListener('online', handleOnline);
   ```
   **Status:** Needs SSR guards  
   **Recommendation:**
   ```tsx
   'use client';
   
   useEffect(() => {
     if (typeof window === 'undefined') return;
     
     const handleOnline = () => { /* ... */ };
     window.addEventListener('online', handleOnline);
     return () => window.removeEventListener('online', handleOnline);
   }, []);
   ```

---

### 6. ⚠️ **LocalStorage Usage in Client Components**
**Severity:** LOW - Acceptable but needs SSR guards  
**Impact:** SSR hydration mismatches if not guarded

#### Files with localStorage (30+ matches):
- [AuthProvider.tsx](src/providers/AuthProvider.tsx) - Lines 47, 48, 71, 75, 76, 113, 114, 135, 136, 143, 144, 153
- [WindowProvider.tsx](src/providers/WindowProvider.tsx) - Lines 74, 83
- [CaseImporter.tsx](src/features/cases/components/import/CaseImporter.tsx) - Lines 92-93

**Patterns Found:**
```tsx
// Authentication tokens
localStorage.getItem('lexiflow_auth_token')
localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser))

// UI preferences
localStorage.getItem('lexiflow_orbital_mode')

// API keys (SECURITY CONCERN)
localStorage.getItem('gemini_api_key')
localStorage.getItem('openai_api_key')
```

**Recommendations:**
1. **For Auth Tokens:** ✅ Acceptable in client components
   ```tsx
   'use client';
   
   useEffect(() => {
     const token = localStorage.getItem('token');
     if (token) setAuth(token);
   }, []);
   ```

2. **For API Keys:** 🔴 Move to server-side
   ```tsx
   // ❌ BAD: Client-side API key storage
   const apiKey = localStorage.getItem('gemini_api_key');
   
   // ✅ GOOD: Server action
   'use server';
   async function callAI(prompt: string) {
     const apiKey = process.env.GEMINI_API_KEY; // Server-only
     // Make API call
   }
   ```

3. **For UI Preferences:** ✅ Acceptable but add SSR guard
   ```tsx
   const [mode, setMode] = useState(false);
   
   useEffect(() => {
     if (typeof window !== 'undefined') {
       setMode(localStorage.getItem('mode') === 'true');
     }
   }, []);
   ```

---

### 7. ⚠️ **Webhook Secret Handling in Client Component**
**Severity:** MEDIUM - Secrets should be server-side only  
**Impact:** Webhook secrets exposed if not handled carefully

#### File:
**[src/features/admin/components/webhooks/WebhookManagement.tsx](src/features/admin/components/webhooks/WebhookManagement.tsx#L53-L212)**
```tsx
// Line 53
secret: formData.secret,

// Line 212
<Input label="Secret (optional)" 
       value={formData.secret || ''} 
       onChange={(e) => setFormData({ ...formData, secret: e.target.value })} 
       placeholder="Shared secret for signature verification" />
```

**Violation:** Webhook secrets collected in client component form  
**Current Pattern:** Client collects secret, sends to backend

**Status:** ⚠️ Acceptable IF:
1. Component has 'use client' directive ✅ (confirmed)
2. Secret is transmitted over HTTPS only
3. Backend validates and stores securely
4. Secret is never logged or exposed in responses

**Recommendation:**
```tsx
'use client';

// Option 1: Keep current pattern but add security headers
const handleCreate = async () => {
  await webhooksApi.create({
    url: formData.url,
    events: formData.events,
    secret: formData.secret, // OK if HTTPS + backend validates
  });
  // Clear form immediately
  setFormData({ events: [], secret: '' }); 
};

// Option 2: Generate secret on server
'use server';
export async function createWebhookWithSecret(url: string, events: string[]) {
  const secret = generateSecureSecret(); // Server-side only
  await db.webhooks.create({ url, events, secret });
  return { id, secret }; // Return once for user to copy
}
```

---

## Environment Variable Classification

### ✅ Should Use `NEXT_PUBLIC_` Prefix (Client-Safe)
These can be exposed to the client bundle:

| Variable | Current Name | Recommended Name | Usage |
|----------|--------------|------------------|-------|
| API URL | `NEXT_PUBLIC_API_URL` | ✅ Correct | Base URL for API calls |
| API Version | - | `NEXT_PUBLIC_API_VERSION` | API version string |
| Environment | - | `NEXT_PUBLIC_APP_ENV` | 'development', 'staging', 'production' |
| Feature Flags | - | `NEXT_PUBLIC_FEATURE_*` | Feature toggles |

### 🔴 Must Stay Server-Side Only (NO `NEXT_PUBLIC_` prefix)
These should NEVER be in client bundle:

| Variable | Current Name | Security Risk | Where Used |
|----------|--------------|---------------|------------|
| AI API Keys | `VITE_GEMINI_API_KEY` | 🔴 HIGH | CaseImporter.tsx |
| AI API Keys | `VITE_OPENAI_API_KEY` | 🔴 HIGH | CaseImporter.tsx |
| Database URLs | `DATABASE_URL` | 🔴 CRITICAL | Not found (good!) |
| JWT Secrets | `JWT_SECRET` | 🔴 CRITICAL | Not found (good!) |
| Session Secrets | `SESSION_SECRET` | 🔴 CRITICAL | Not found (good!) |
| Private Keys | Any `*_PRIVATE_KEY` | 🔴 CRITICAL | Not found (good!) |

### ⚠️ Vite Variables to Migrate
Replace these Vite-style variables with Next.js conventions:

| Current (Vite) | Replace With | Migration Action |
|----------------|--------------|------------------|
| `import.meta.env.VITE_GEMINI_API_KEY` | Server action | Move to server-side API proxy |
| `import.meta.env.VITE_OPENAI_API_KEY` | Server action | Move to server-side API proxy |
| `import.meta.env.VITE_USE_INDEXEDDB` | `process.env.NEXT_PUBLIC_USE_INDEXEDDB` | Rename or remove |
| `import.meta.env.DEV` | `process.env.NODE_ENV === 'development'` | Replace throughout |
| `import.meta.env.PROD` | `process.env.NODE_ENV === 'production'` | Replace throughout |

---

## Security Recommendations

### Priority 1: Critical (Fix Immediately)
1. **Remove AI API Keys from Client Bundle**
   - File: `CaseImporter.tsx`
   - Action: Create server action for AI parsing
   ```tsx
   // app/actions/ai-parser.ts
   'use server';
   
   export async function parseWithAI(text: string, provider: 'gemini' | 'openai') {
     const apiKey = provider === 'gemini' 
       ? process.env.GEMINI_API_KEY // Server-only
       : process.env.OPENAI_API_KEY;
     
     // Make API call server-side
     const result = await callAIService(text, apiKey, provider);
     return result;
   }
   ```

2. **Audit Environment Variable File**
   - Check `.env.local` for any `VITE_*` variables
   - Ensure no secrets have `NEXT_PUBLIC_` prefix
   - Create `.env.example` with safe defaults

### Priority 2: High (Fix This Sprint)
3. **Replace Vite Environment Variables**
   - Find/Replace: `import.meta.env.DEV` → `process.env.NODE_ENV === 'development'`
   - Find/Replace: `import.meta.env.PROD` → `process.env.NODE_ENV === 'production'`
   - Files affected: 4 files (PerformanceMonitor, withErrorBoundary, BillingErrorBoundary)

4. **Add SSR Guards to Browser APIs**
   - File: `SyncContext.refactored.tsx`
   - Wrap `navigator.onLine`, `window.addEventListener` in `useEffect` with guards

### Priority 3: Medium (Address in Next Sprint)
5. **Implement Server Actions for Configuration**
   - File: `DataSourceProvider.tsx`
   - Create server action to fetch config safely
   - Filter out sensitive internal details

6. **Review LocalStorage Usage**
   - Acceptable for: auth tokens, UI preferences
   - Not acceptable for: API keys, secrets
   - Add SSR guards to prevent hydration issues

### Priority 4: Low (Technical Debt)
7. **Optimize Environment Checks**
   - Extract to constants: `const IS_DEV = process.env.NODE_ENV === 'development'`
   - Use build-time dead code elimination

8. **Document Environment Variables**
   - Create `ENVIRONMENT.md` with all variables
   - Specify which are client-safe vs server-only
   - Include .env.example with safe defaults

---

## Implementation Plan

### Phase 1: Security Fixes (Week 1)
- [ ] Move AI API keys to server-side (CaseImporter.tsx)
- [ ] Audit all environment variables for sensitive data
- [ ] Remove any `NEXT_PUBLIC_` prefix from secrets
- [ ] Create server actions for AI API calls

### Phase 2: Vite Migration (Week 2)
- [ ] Replace `import.meta.env.DEV/PROD` with `process.env.NODE_ENV`
- [ ] Update `BillingErrorBoundary.tsx` (line 43)
- [ ] Update `PerformanceMonitor.tsx` (lines 202, 266)
- [ ] Update `withErrorBoundary.tsx` (lines 44, 56, 90)
- [ ] Remove or migrate `VITE_USE_INDEXEDDB` references

### Phase 3: SSR Safety (Week 3)
- [ ] Add SSR guards to `SyncContext.refactored.tsx`
- [ ] Verify 'use client' directives on all browser API usage
- [ ] Add SSR guards to localStorage access where missing
- [ ] Test server-side rendering for all affected pages

### Phase 4: Documentation & Best Practices (Week 4)
- [ ] Create `.env.example` with safe defaults
- [ ] Document environment variable usage in README
- [ ] Add ESLint rules to catch `import.meta.env` usage
- [ ] Create developer guide for client vs server boundaries

---

## Testing Checklist

### Verify Security
- [ ] Run build: `npm run build`
- [ ] Inspect bundle: Search for API keys in `.next/static/chunks/`
- [ ] Check network tab: Ensure no secrets in client requests
- [ ] Test without env vars: App should degrade gracefully

### Verify Functionality
- [ ] SSR works: `npm run build && npm run start`
- [ ] Client hydration: No console errors about mismatches
- [ ] AI features work: Case import, document parsing
- [ ] Auth persists: LocalStorage auth tokens work across refreshes
- [ ] Webhooks secure: Secrets transmitted over HTTPS only

### Verify Next.js Compliance
- [ ] No `import.meta.env` in production bundle
- [ ] Only `NEXT_PUBLIC_*` vars in client bundle
- [ ] Server actions work for sensitive operations
- [ ] Error boundaries catch SSR issues

---

## Additional Resources

### Next.js Documentation
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Client vs Server Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)

### Security Best Practices
- Never expose API keys in client bundle
- Use server actions for sensitive operations
- Implement proper CORS and CSP headers
- Rotate secrets regularly
- Use environment-specific .env files

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total files scanned | 165+ TSX/JSX files |
| Files with violations | 30+ |
| Critical security issues | 2 (API keys) |
| High priority issues | 4 (Vite env vars) |
| Medium priority issues | 6 (SSR guards, config) |
| Low priority issues | 11 (optimization) |
| Environment variables found | 8 |
| `process.env.NODE_ENV` usage | 21 instances (acceptable) |
| `import.meta.env` usage | 8 instances (needs migration) |
| LocalStorage access | 30+ instances (mostly acceptable) |

---

## Conclusion

The application has a **mixed Vite/Next.js architecture** that needs migration. The most critical issue is **AI API keys being accessed client-side** in `CaseImporter.tsx`. This must be resolved by creating server actions to proxy AI API calls.

Secondary concerns include replacing Vite environment variables with Next.js conventions and adding proper SSR guards for browser APIs.

Overall code quality is good, with proper use of error boundaries and 'use client' directives. The main work is architectural migration from Vite to Next.js patterns.

**Risk Level:** MEDIUM  
**Estimated Effort:** 2-3 weeks  
**Recommended Start:** Immediately (security issues)
