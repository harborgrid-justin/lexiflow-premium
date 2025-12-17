# Memory Optimization Report

## 🔍 Issues Identified from Heap Snapshot

### Summary
The heap snapshot shows **341 instances of compiled code** and **2 DedicatedWorkerGlobalScope instances** consuming **~25.3 kB (7%)** of retained memory, plus **186 string instances**. This indicates:

1. ✅ **Web Workers are properly terminated** (good cleanup in `useNexusGraph` and `useWorkerSearch`)
2. ❌ **Blob URLs are NOT being revoked** in some places (memory leak)
3. ❌ **CryptoWorker doesn't clean up its blob URL** (permanent leak)
4. ⚠️ **Multiple worker instances may be created unnecessarily**

---

## 🐛 Critical Issues Found

### 1. **CryptoWorker - Missing URL Revocation** ⚠️ HIGH PRIORITY
**File**: `frontend/services/cryptoWorker.ts`

**Problem**:
```typescript
const createCryptoWorker = () => {
    const blob = new Blob([code], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob)); // ❌ URL never revoked
};
```

**Impact**: Every time `CryptoWorker.create()` is called, a new blob URL is created but never cleaned up. This causes a permanent memory leak until page reload.

**Fix**: Revoke URL immediately after worker creation (like `searchWorker.ts` does).

---

### 2. **CaseListToolbar - Missing URL Revocation in CSV Export** ⚠️ MEDIUM PRIORITY
**File**: `frontend/components/case-list/CaseListToolbar.tsx` (line 119)

**Problem**:
```typescript
const url = URL.createObjectURL(blob);
link.setAttribute('href', url);
link.click();
document.body.removeChild(link);
// ❌ URL.revokeObjectURL(url) is missing
```

**Impact**: Each CSV export creates a blob URL that persists in memory. With frequent exports, this accumulates.

**Fix**: Add `URL.revokeObjectURL(url)` after download (Excel export already has this on line 195).

---

### 3. **String Retention - 186 Instances** ℹ️ INFO
**Source**: Likely from:
- Search worker cache (`itemsCache`, `fieldsCache`)
- Document service blob URLs
- Query cache string keys

**Impact**: Moderate - strings are small but 186 instances suggests possible over-retention.

**Recommendation**: 
- Review query key generation (use shorter keys)
- Consider limiting search worker cache size
- Implement LRU cache for document blob URLs

---

### 4. **Compiled Code - 341 Instances** ℹ️ INFO
**Source**: 
- Worker blobs (inlined physics, search, crypto code)
- Lazy-loaded React components
- Vite code-splitting chunks

**Impact**: Normal for SPAs with code-splitting, but indicates room for optimization.

**Recommendations**:
- Audit lazy-loaded component count
- Consider combining smaller chunks
- Use dynamic imports more strategically

---

## ✅ Good Practices Already Implemented

### 1. **Worker Cleanup in useNexusGraph** ✅
```typescript
return () => {
    workerRef.current?.terminate();
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
};
```

### 2. **URL Revocation in SearchWorker** ✅
```typescript
const url = URL.createObjectURL(blob);
const worker = new Worker(url);
URL.revokeObjectURL(url); // ✅ Immediate cleanup
```

### 3. **BlobRegistry Hook** ✅
Already exists at `frontend/hooks/useBlobRegistry.ts` for managed blob URL lifecycle.

### 4. **Excel Export URL Cleanup** ✅
```typescript
URL.revokeObjectURL(url); // ✅ Properly cleaned up
```

---

## 🔧 Fixes to Implement

### Priority 1: Fix CryptoWorker (High Impact)
```typescript
// frontend/services/cryptoWorker.ts
const createCryptoWorker = () => {
    const code = `...`;
    const blob = new Blob([code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url); // ✅ Add this line
    return worker;
};
```

### Priority 2: Fix CSV Export (Medium Impact)
```typescript
// frontend/components/case-list/CaseListToolbar.tsx (after line 124)
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(url); // ✅ Add this line
```

### Priority 3: Worker Pool Pattern (Low Impact, High Value)
Create a worker pool to reuse workers instead of creating new ones:

```typescript
// frontend/services/workerPool.ts
class WorkerPool {
    private workers: Worker[] = [];
    private available: Worker[] = [];
    
    constructor(private factory: () => Worker, private size: number = 2) {
        for (let i = 0; i < size; i++) {
            const worker = factory();
            this.workers.push(worker);
            this.available.push(worker);
        }
    }
    
    acquire(): Promise<Worker> {
        if (this.available.length > 0) {
            return Promise.resolve(this.available.pop()!);
        }
        // Wait for worker to become available
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (this.available.length > 0) {
                    clearInterval(interval);
                    resolve(this.available.pop()!);
                }
            }, 50);
        });
    }
    
    release(worker: Worker) {
        this.available.push(worker);
    }
    
    terminate() {
        this.workers.forEach(w => w.terminate());
        this.workers = [];
        this.available = [];
    }
}
```

---

## 📊 Expected Memory Improvements

| Fix | Current | After Fix | Savings |
|-----|---------|-----------|---------|
| CryptoWorker URL leak | ~1-5 KB per call | 0 KB | 100% |
| CSV Export URL leak | ~50-500 KB per export | 0 KB | 100% |
| Worker pooling | ~25 KB (2+ instances) | ~13 KB (1 instance) | ~50% |
| String optimization | 9.4 KB | ~6-7 KB | ~25% |

**Total Expected Savings**: 5-15 KB (20-30% of current worker-related memory)

---

## 🎯 Performance Monitoring

### Before Optimization
- Compiled code: 341 instances, 21.0 kB
- Worker globals: 2 instances, 11.0 kB
- Strings: 186 instances, 9.4 kB
- **Total**: ~41.4 kB

### Target After Optimization
- Compiled code: <300 instances, <18 kB
- Worker globals: 1-2 instances, <8 kB
- Strings: <150 instances, <7 kB
- **Target Total**: <33 kB (20% reduction)

---

## 🔍 How to Verify Fixes

1. **Take Heap Snapshot Before**: Chrome DevTools → Memory → Take snapshot
2. **Perform Actions**:
   - Export CSV 10 times
   - Create crypto worker 5 times
   - Navigate between views
3. **Take Heap Snapshot After**
4. **Compare**:
   - Look for `blob:http://localhost:3000/` URLs (should be revoked)
   - Check DedicatedWorkerGlobalScope count (should stay constant)
   - Monitor string retention (should not grow indefinitely)

---

## 📋 Implementation Checklist

- [ ] Fix CryptoWorker blob URL leak
- [ ] Fix CaseListToolbar CSV export URL leak
- [ ] Audit other blob URL usages (search for `createObjectURL` without `revokeObjectURL`)
- [ ] Consider implementing worker pool for crypto operations
- [ ] Add memory monitoring to CI/CD (heap snapshot tests)
- [ ] Document blob URL lifecycle in coding standards

---

## 🚀 Additional Optimizations (Future)

### 1. Lazy Load Heavy Components
Defer loading of admin panel until accessed:
```typescript
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));
```

### 2. Memoize Query Keys
```typescript
// Instead of: ['cases', filter, page, sort]
// Use: useMemo(() => ['cases', stableFilterHash], [filter])
```

### 3. Limit Search Worker Cache
```typescript
// In searchWorker.ts
const MAX_CACHE_SIZE = 1000;
if (itemsCache.length > MAX_CACHE_SIZE) {
    itemsCache = itemsCache.slice(0, MAX_CACHE_SIZE);
}
```

### 4. Use WeakMap for Temporary References
```typescript
const blobCache = new WeakMap<File, string>();
```

---

## 📚 Resources

- [MDN: URL.revokeObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL)
- [Web Worker Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [Chrome DevTools Memory Profiling](https://developer.chrome.com/docs/devtools/memory-problems/)

---

**Priority**: Implement fixes 1 & 2 immediately (< 5 minutes). Consider worker pooling for Phase 2.
