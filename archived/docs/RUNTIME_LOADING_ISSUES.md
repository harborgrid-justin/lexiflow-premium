# Runtime Loading Issues - Console Analysis

**Generated:** 2026-01-03  
**Based on:** Actual browser console output

---

## 🔴 CRITICAL RUNTIME ISSUES

### 1. App Loading Timeout Triggered
**Status:** ACTIVE - BLOCKING LAYOUT  
**Evidence:**
```
[Layout] App loading timeout - redirecting to login
```

**Root Cause:** The layout's 15-second timeout is triggering even though:
- Backend is healthy (219ms response)
- Login is successful
- Auth tokens stored
- User authenticated

**Problem:** `useAppController` is being called TWICE, causing re-initialization:
```
useAppContext.ts:181 [useAppController] Starting initialization...
// ... auth completes ...
useAppContext.ts:181 [useAppController] Starting initialization... // ⚠️ CALLED AGAIN
```

**Why This Causes Timeout:**
- Double initialization resets loading state
- Second call may not see auth as complete
- 15 seconds expires while waiting
- User gets redirected back to login despite being authenticated

---

### 2. WebSocket Connection Failures
**Status:** ACTIVE - NON-BLOCKING  
**Evidence:**
```
WebSocket connection to 'wss://127.0.0.1/?token=0udlPMLo_-xf' failed: 
Error in connection establishment: net::ERR_CONNECTION_REFUSED

[vite] failed to connect to websocket (Error: WebSocket closed without opened.)
```

**Impact:** 
- HMR (Hot Module Reload) not working
- Real-time features may fail
- Non-blocking but degrades developer experience

**Root Cause:** 
- Vite dev server WebSocket on wrong port/protocol
- Should be `ws://localhost:3400` not `wss://127.0.0.1`

---

### 3. React Strict Mode Double Mounting
**Status:** BY DESIGN - BUT CAUSING ISSUES  
**Evidence:**
```
useBackendHealth.ts:195 [useBackendHealth] Setting up status subscription
useAppContext.ts:181 [useAppController] Starting initialization...
useBackendHealth.ts:224 [useBackendHealth] Cleaning up status subscription
useBackendHealth.ts:195 [useBackendHealth] Setting up status subscription
```

**Analysis:**
- React 18 Strict Mode mounts components twice in development
- `useAppController` has `isInitialized.current` guard BUT
- The guard is not preventing double execution properly
- Each mount resets `isAppLoading` state

---

## 🎯 ROOT CAUSE: Double Initialization Bug

### The Bug in `useAppContext.ts`

```typescript
// Current code (BROKEN):
const isInitialized = useRef(false);

useEffect(() => {
  // Guard against double-invocation in React 18 Strict Mode
  if (isInitialized.current) return;
  isInitialized.current = true;

  const init = async () => {
    // ... initialization code ...
    setIsAppLoading(false); // ⚠️ This gets called twice!
  };

  init();
}, [addToast, authUser, authIsAuthenticated]); // ⚠️ DEPENDENCIES CAUSE RE-RUN
```

**The Problem:**
1. Effect runs first time → `isInitialized.current = true`
2. Component re-renders (Strict Mode or dependency change)
3. Effect dependencies change (`authUser` becomes defined)
4. Effect runs AGAIN because dependencies changed
5. Guard `isInitialized.current` is still `true` BUT...
6. The ref persists across renders but the effect SHOULD run again when auth changes!

**The Conflict:**
- We want to prevent Strict Mode double-execution ✅
- But we NEED to re-run when auth state changes ✅
- Current guard blocks BOTH scenarios ❌

---

## 🔧 REQUIRED FIXES

### Fix 1: Proper Initialization Guard

```typescript
// In useAppContext.ts

// Replace current useEffect with:
useEffect(() => {
  // Only skip if already initialized AND auth hasn't changed
  if (isInitialized.current && authUser && authIsAuthenticated) {
    console.log('[useAppController] Already initialized, skipping');
    return;
  }

  // Only initialize once auth is ready
  if (!authIsAuthenticated || !authUser) {
    console.log('[useAppController] Waiting for auth...');
    return;
  }

  // Mark as initialized BEFORE async work
  if (!isInitialized.current) {
    isInitialized.current = true;
  }

  const init = async () => {
    console.log('[useAppController] Initializing...');
    
    try {
      // ... existing init code ...
      
      // Only set loading to false if we're still mounted
      setIsAppLoading(false);
    } catch (e) {
      console.error('[useAppController] Init failed:', e);
      setIsAppLoading(false);
    }
  };

  init();
}, [authUser, authIsAuthenticated]); // Simplified dependencies
```

### Fix 2: Remove Timeout Redirect (Too Aggressive)

```typescript
// In layout.tsx - REMOVE OR MODIFY THIS:

React.useEffect(() => {
  if (isAppLoading && !authIsLoading) {
    const timeout = setTimeout(() => {
      console.error('[Layout] App loading timeout - redirecting to login');
      navigate('/login'); // ⚠️ TOO AGGRESSIVE - user is authenticated!
    }, 15000);
    return () => clearTimeout(timeout);
  }
}, [isAppLoading, authIsLoading, navigate]);

// REPLACE WITH:
React.useEffect(() => {
  if (isAppLoading && !authIsLoading) {
    const timeout = setTimeout(() => {
      console.error('[Layout] App loading timeout');
      // Instead of redirecting, show error state
      setAppError(true);
    }, 15000);
    return () => clearTimeout(timeout);
  }
}, [isAppLoading, authIsLoading]);
```

### Fix 3: Fix Vite WebSocket Configuration

```typescript
// In vite.config.ts
server: {
  port: 3400,
  host: true,
  strictPort: true,
  hmr: process.env.CODESPACES
    ? {
        clientPort: 443,
        protocol: "wss",
      }
    : {
        port: 3400, // Use same port as server
        protocol: "ws", // NOT wss in development
      },
  // ...
}
```

---

## 🧪 VERIFICATION STEPS

After fixes, verify:

1. **Single Initialization:**
   ```
   ✅ [useAppController] Starting initialization...
   ✅ [useAppController] Connected to backend
   ❌ [useAppController] Starting initialization... (should NOT appear twice)
   ```

2. **No Timeout:**
   ```
   ❌ [Layout] App loading timeout
   ```

3. **Auth Flow:**
   ```
   ✅ [AuthProvider] Login successful
   ✅ [useAppController] Initializing...
   ✅ Layout renders with user
   ```

4. **WebSocket:**
   ```
   ✅ [vite] connected.
   ❌ WebSocket connection failed
   ```

---

## 📊 TIMING ANALYSIS

From console logs:

```
00:00.000 - Backend health check: 219ms ✅
00:00.219 - Login attempt starts
00:00.450 - Auth tokens stored ✅
00:00.460 - Login successful ✅
00:00.500 - useAppController init (1st call)
00:00.550 - useBackendHealth setup
00:00.560 - useAppController init (2nd call) ⚠️
00:15.000 - TIMEOUT TRIGGERED ❌
00:15.001 - Redirect to login (user is already logged in!) ❌
```

**The Timeline Shows:**
- Auth completes in ~500ms ✅
- Double initialization at 500ms and 560ms ⚠️
- Everything is working EXCEPT...
- Timeout still triggers at 15 seconds ❌
- Redirect happens despite successful auth ❌

**Why Timeout Triggers:**
- `isAppLoading` never gets set to `false`
- Because second initialization may be blocked by guard
- Or async init never completes due to race condition

---

## 🎯 IMMEDIATE ACTION REQUIRED

**Priority 1: Fix Double Initialization**
- Update `useAppContext.ts` initialization guard
- Ensure single execution per auth state

**Priority 2: Remove Aggressive Timeout**
- Layout timeout should show error, not redirect
- User is authenticated - redirect breaks UX

**Priority 3: Fix WebSocket**
- Update Vite HMR configuration
- Use correct protocol/port for dev environment

---

## 📝 TESTING CHECKLIST

After applying fixes:

- [ ] Login completes successfully
- [ ] No double initialization logs
- [ ] Layout renders without timeout
- [ ] No redirect back to login
- [ ] HMR works (save file → instant update)
- [ ] No WebSocket errors in console
- [ ] Backend health checks continue
- [ ] User can navigate to protected routes

---

**Status:** Ready for implementation  
**Estimated Fix Time:** 30 minutes  
**Risk Level:** Low (targeted fixes to known issues)