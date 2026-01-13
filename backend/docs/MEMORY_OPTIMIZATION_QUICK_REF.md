# Memory Optimization Quick Reference

## 🎯 Quick Usage Guide

### 1. String Interning (Use in Entity Loaders)
```typescript
import { internEnumFields } from '@/common/utils/string-intern.util';

// After loading entities from database
const documents = await documentRepo.find();
documents.forEach(doc => internEnumFields(doc, ['status', 'type', 'category']));
```

### 2. TypeORM Streaming (Use for Large Queries)
```typescript
import { streamQueryResults, getLeanResults } from '@/common/utils/typeorm-stream.util';

// Stream large result sets
await streamQueryResults(
  repo.createQueryBuilder('entity'),
  async (row) => await process(row),
  { batchSize: 100 }
);

// Lean queries (no entity hydration)
const results = await getLeanResults(
  repo.createQueryBuilder('doc').select(['doc.id', 'doc.title'])
);
```

### 3. OCR Worker Threads (Use for Heavy Processing)
```typescript
import { OcrServiceEnhanced } from '@/ocr/ocr-enhanced.service';

// Single document (isolated worker)
const result = await ocrService.processDocument(path, request);

// Batch processing (worker pool)
const results = await ocrService.batchProcess(paths);
```

### 4. Manual GC (Use After Heavy Operations)
```typescript
import { ManualGCService } from '@/common/services/manual-gc.service';

// Inject service
constructor(private gcService: ManualGCService) {}

// After bulk operations
await processBulkData();
await this.gcService.triggerGC('post-bulk-operation');

// Auto-trigger if heap > 1GB
await this.gcService.autoTriggerIfNeeded('export', 1024);
```

### 5. Lean Logging (Use for Request Logs)
```typescript
import { serializeLeanRequest } from '@/common/logging/lean-serializer';

// In interceptors/middleware
this.logger.log({ 
  req: serializeLeanRequest(request),
  // Only essential fields - avoids circular refs
});
```

### 6. GraphQL Complexity (Add to GraphQL Module)
```typescript
import { GraphQLComplexityPlugin } from '@/common/graphql/complexity.plugin';

GraphQLModule.forRoot({
  plugins: [
    new GraphQLComplexityPlugin(schemaHost, { 
      maxComplexity: 1000,
      verbose: true 
    })
  ],
});
```

## 📈 Performance Monitoring

```bash
# Check worker stats
curl http://localhost:3001/api/ocr/stats

# Check GC stats  
curl http://localhost:3001/api/health

# Monitor memory
node --expose-gc --trace-gc dist/main.js
```

## 🔥 Critical: Use These for Large Operations

| Operation | Use | Memory Impact |
|-----------|-----|---------------|
| Load 10K+ entities | `streamQueryResults()` | 95% reduction |
| Process OCR | `OcrServiceEnhanced` | 100% isolation |
| After batch jobs | `triggerGC()` | Prevents fragmentation |
| Log requests | `serializeLeanRequest()` | 99% reduction |
| Complex GraphQL | `GraphQLComplexityPlugin` | Prevents exhaustion |

## ⚠️ Common Mistakes to Avoid

```typescript
// ❌ BAD: Loads everything into memory
const docs = await repo.find(); // 10K rows = 500MB spike

// ✅ GOOD: Streams row-by-row
await streamQueryResults(repo.createQueryBuilder('doc'), process);

// ❌ BAD: OCR in main thread
const result = await tesseract.recognize(file); // Blocks event loop

// ✅ GOOD: OCR in worker thread
const result = await ocrService.processDocument(file, request);

// ❌ BAD: Full request serialization
logger.log({ request }); // Circular refs, 10-50KB

// ✅ GOOD: Lean serialization
logger.log({ req: serializeLeanRequest(request) }); // 100 bytes
```
