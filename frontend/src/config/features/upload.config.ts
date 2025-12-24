// =============================================================================
// FILE UPLOAD CONFIGURATION
// =============================================================================
// File upload limits, chunking, and validation rules

export const FILE_UPLOAD_MAX_SIZE = 52428800; // 50MB
export const FILE_UPLOAD_CHUNK_SIZE = 1048576; // 1MB chunks
export const FILE_UPLOAD_CONCURRENT_CHUNKS = 3;
export const FILE_UPLOAD_RETRY_ATTEMPTS = 3;
export const FILE_UPLOAD_TIMEOUT_MS = 300000; // 5 minutes

export const FILE_ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
];

export const FILE_PROHIBITED_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.scr',
  '.vbs',
  '.jar',
  '.dll',
  '.msi',
];

// Export as object
export const UPLOAD_CONFIG = {
  maxSize: FILE_UPLOAD_MAX_SIZE,
  chunkSize: FILE_UPLOAD_CHUNK_SIZE,
  concurrentChunks: FILE_UPLOAD_CONCURRENT_CHUNKS,
  retryAttempts: FILE_UPLOAD_RETRY_ATTEMPTS,
  timeoutMs: FILE_UPLOAD_TIMEOUT_MS,
  allowedTypes: FILE_ALLOWED_TYPES,
  prohibitedExtensions: FILE_PROHIBITED_EXTENSIONS,
} as const;
