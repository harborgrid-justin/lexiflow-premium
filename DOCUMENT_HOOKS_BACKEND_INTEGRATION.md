# Document Hooks Backend API Integration - Complete

## Summary
All document-related hooks in LexiFlow Premium now use real PostgreSQL-backed backend APIs instead of local IndexedDB storage.

## Updated Hooks

### 1. useDocumentData.ts
**Location**: `frontend/src/hooks/useDocumentManager/useDocumentData.ts`

**Changes**:
- ✅ Replaced `DataService.documents.getAll()` with `DocumentsApiService.getAll()`
- ✅ Added direct import of `DocumentsApiService` from `@/api/admin/documents-api`
- ✅ All document fetching now goes through backend PostgreSQL database

### 2. useDocumentMutations.ts
**Location**: `frontend/src/hooks/useDocumentManager/useDocumentMutations.ts`

**Changes**:
- ✅ Replaced `DataService.documents.update()` with `DocumentsApiService.update()`
- ✅ Direct backend API integration for all document mutations
- ✅ Proper query invalidation after updates

### 3. useCaseDocuments.ts
**Location**: `frontend/src/features/cases/hooks/useCaseDocuments.ts`

**Changes**:
- ✅ Replaced `DocumentService.uploadDocument()` with `DocumentsApiService.upload()`
- ✅ File uploads now use backend multipart/form-data API
- ✅ Removed dependency on local IndexedDB `DocumentService`
- ✅ Upload metadata properly formatted for backend API

### 4. useDocumentAnnotations.ts
**Location**: `frontend/src/features/documents/hooks/useDocumentAnnotations.ts`

**Changes**:
- ✅ Added backend API integration for fetching annotations via `DocumentsApiService.getAnnotations()`
- ✅ Implemented `addAnnotation`, `updateAnnotation`, `deleteAnnotation` mutations using backend API
- ✅ Falls back to prop-based annotations if backend unavailable (graceful degradation)
- ✅ Proper query invalidation after mutations
- ✅ Added query key: `queryKeys.documents.annotations(documentId)`

### 5. useDocumentTemplates.ts
**Location**: `frontend/src/features/document-assembly/hooks/useDocumentTemplates.ts`

**Changes**:
- ✅ Replaced mock template loading with backend API call
- ✅ Fetches templates via `DocumentsApiService.getAll({ type: 'Template' })`
- ✅ Maps backend `LegalDocument` to `DocumentTemplate` format
- ✅ Falls back to local `DOCUMENT_TEMPLATES` config if backend unavailable
- ✅ Proper icon mapping using Lucide React icons

## Supporting Changes

### queryKeys.ts
**Location**: `frontend/src/utils/queryKeys.ts`

**Added**:
```typescript
annotations: (documentId: string) => ["documents", "annotations", documentId] as const,
```

## Backend API Structure Used

All hooks now use `DocumentsApiService` class from `api/admin/documents-api.ts`:

### CRUD Operations
- `getAll(filters?)` - Fetch all documents with optional filters
- `getById(id)` - Fetch single document
- `add(document)` - Create new document
- `update(id, updates)` - Update document
- `delete(id)` - Delete document

### File Operations
- `upload(file, metadata)` - Upload file with metadata (FormData)
- `bulkUpload(files, metadata)` - Upload multiple files
- `download(id)` - Download file as Blob
- `preview(id)` - Get preview/thumbnail

### Version Operations
- `getVersions(id)` - Get document version history
- `restoreVersion(id, versionId)` - Restore previous version
- `compareVersions(id, v1, v2)` - Compare two versions
- `redact(id, redactions)` - Apply redactions

### Annotation Operations
- `getAnnotations(documentId)` - Fetch all annotations
- `addAnnotation(documentId, annotation)` - Add new annotation
- `updateAnnotation(documentId, id, updates)` - Update annotation
- `deleteAnnotation(documentId, id)` - Delete annotation

## Response Format Handling

The backend API properly handles multiple response formats:

1. **Paginated Response**: `{ data: T[], total: number, page: number }`
2. **Wrapped Paginated**: `{ data: { data: T[], total: number } }`
3. **Direct Array**: `T[]`

All hooks use the CRUD operations which automatically unwrap these formats.

## Benefits

1. **Real Database Persistence**: All document operations persist to PostgreSQL
2. **Multi-User Support**: Backend handles concurrent access and data consistency
3. **Scalability**: Database-backed storage scales better than IndexedDB
4. **Search & Filtering**: Server-side filtering for better performance
5. **Proper Error Handling**: Backend validation and error responses
6. **Type Safety**: Full TypeScript types from backend to frontend
7. **Graceful Degradation**: Some hooks fall back to local data if backend unavailable

## Testing Recommendations

1. **Test document uploads**: Verify FormData uploads work correctly
2. **Test annotations**: Verify CRUD operations persist to backend
3. **Test templates**: Verify backend template fetching works
4. **Test error handling**: Verify graceful fallbacks when backend unavailable
5. **Test pagination**: Verify server-side pagination in document lists
6. **Test concurrent updates**: Verify optimistic updates with query invalidation

## Hooks NOT Changed (By Design)

These hooks remain UI-focused and don't need backend integration:

- **useDocumentList.ts**: Client-side pagination/sorting for passed documents
- **useDocumentUpload.ts**: UI state management, delegates to parent callback
- **useDocumentViewer.ts**: Client-side viewer state (zoom, page navigation)

These hooks receive data from parent components that use the updated hooks above.

## Next Steps

1. ✅ All document hooks now use real APIs
2. ✅ Query keys properly configured
3. ✅ Error handling and fallbacks in place
4. ⚠️ Consider adding loading states to UI components
5. ⚠️ Consider adding retry logic for failed API calls
6. ⚠️ Add E2E tests for document workflows

## Files Modified

```
frontend/src/hooks/useDocumentManager/useDocumentData.ts
frontend/src/hooks/useDocumentManager/useDocumentMutations.ts
frontend/src/features/cases/hooks/useCaseDocuments.ts
frontend/src/features/documents/hooks/useDocumentAnnotations.ts
frontend/src/features/document-assembly/hooks/useDocumentTemplates.ts
frontend/src/utils/queryKeys.ts
```

---

**Status**: ✅ COMPLETE - All document hooks now use real backend APIs
**Date**: 2025-12-18
**Backend API**: PostgreSQL + NestJS via DocumentsApiService
