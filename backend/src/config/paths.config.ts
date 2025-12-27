/**
 * Global Paths Configuration
 * =============================================================================
 * Centralized path definitions for all file operations across the application.
 * All paths should be imported from this file to ensure consistency.
 * 
 * Usage:
 *   import * as PathsConfig from '@config/paths.config';
 *   const uploadPath = PathsConfig.UPLOAD_DIR;
 */

import * as path from 'path';

// =============================================================================
// BASE DIRECTORIES
// =============================================================================

/**
 * Root directory of the application
 */
export const ROOT_DIR = process.cwd();

/**
 * Source code directory
 */
export const SRC_DIR = path.join(ROOT_DIR, 'src');

/**
 * Distribution/Build output directory
 */
export const DIST_DIR = path.join(ROOT_DIR, 'dist');

// =============================================================================
// STORAGE DIRECTORIES
// =============================================================================

/**
 * Main uploads directory for all user-uploaded files
 */
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(ROOT_DIR, 'uploads');

/**
 * Temporary files directory
 */
export const TEMP_DIR = process.env.TEMP_DIR || path.join(ROOT_DIR, 'temp');

/**
 * Static public files directory
 */
export const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(ROOT_DIR, 'public');

/**
 * Logs directory
 */
export const LOGS_DIR = process.env.LOGS_DIR || path.join(ROOT_DIR, 'logs');

/**
 * Data/Storage directory
 */
export const STORAGE_DIR = process.env.STORAGE_DIR || path.join(ROOT_DIR, 'storage');

/**
 * Backup directory
 */
export const BACKUP_DIR = process.env.BACKUP_DIR || path.join(ROOT_DIR, 'backups');

/**
 * Cache directory
 */
export const CACHE_DIR = process.env.CACHE_DIR || path.join(ROOT_DIR, 'cache');

// =============================================================================
// UPLOAD SUBDIRECTORIES
// =============================================================================

/**
 * Documents upload directory
 */
export const DOCUMENTS_DIR = path.join(UPLOAD_DIR, 'documents');

/**
 * Chunked upload temporary directory
 */
export const CHUNKS_DIR = path.join(UPLOAD_DIR, 'chunks');

/**
 * Thumbnails directory
 */
export const THUMBNAILS_DIR = path.join(UPLOAD_DIR, 'thumbnails');

/**
 * Avatars/Profile images directory
 */
export const AVATARS_DIR = path.join(UPLOAD_DIR, 'avatars');

/**
 * Attachments directory
 */
export const ATTACHMENTS_DIR = path.join(UPLOAD_DIR, 'attachments');

/**
 * Evidence files directory
 */
export const EVIDENCE_DIR = path.join(UPLOAD_DIR, 'evidence');

/**
 * Exhibits directory
 */
export const EXHIBITS_DIR = path.join(UPLOAD_DIR, 'exhibits');

/**
 * Templates directory
 */
export const TEMPLATES_DIR = path.join(UPLOAD_DIR, 'templates');

// =============================================================================
// PROCESSING DIRECTORIES
// =============================================================================

/**
 * OCR processing directory
 */
export const OCR_DIR = path.join(TEMP_DIR, 'ocr');

/**
 * PDF processing directory
 */
export const PDF_PROCESSING_DIR = path.join(TEMP_DIR, 'pdf');

/**
 * Image processing directory
 */
export const IMAGE_PROCESSING_DIR = path.join(TEMP_DIR, 'images');

/**
 * Document conversion directory
 */
export const CONVERSION_DIR = path.join(TEMP_DIR, 'conversion');

/**
 * ZIP extraction directory
 */
export const EXTRACTION_DIR = path.join(TEMP_DIR, 'extraction');

// =============================================================================
// DATA DIRECTORIES
// =============================================================================

/**
 * Database migrations directory
 */
export const MIGRATIONS_DIR = path.join(SRC_DIR, 'config', 'migrations');

/**
 * Database seeds directory
 */
export const SEEDS_DIR = path.join(SRC_DIR, 'config', 'seeds');

/**
 * Test data directory
 */
export const TEST_DATA_DIR = path.join(SEEDS_DIR, 'test-data');

/**
 * GraphQL schema file
 */
export const GRAPHQL_SCHEMA_FILE = path.join(SRC_DIR, 'graphql', 'schema.gql');

// =============================================================================
// LOG FILE PATHS
// =============================================================================

/**
 * Application log file
 */
export const APP_LOG_FILE = path.join(LOGS_DIR, 'app.log');

/**
 * Error log file
 */
export const ERROR_LOG_FILE = path.join(LOGS_DIR, 'error.log');

/**
 * Access log file
 */
export const ACCESS_LOG_FILE = path.join(LOGS_DIR, 'access.log');

/**
 * Audit log file
 */
export const AUDIT_LOG_FILE = path.join(LOGS_DIR, 'audit.log');

/**
 * Performance log file
 */
export const PERFORMANCE_LOG_FILE = path.join(LOGS_DIR, 'performance.log');

/**
 * Security log file
 */
export const SECURITY_LOG_FILE = path.join(LOGS_DIR, 'security.log');

// =============================================================================
// OCR DATA FILES
// =============================================================================

/**
 * Tesseract trained data file for English
 */
export const TESSERACT_ENG_DATA = path.join(ROOT_DIR, 'eng.traineddata');

/**
 * Tesseract data directory
 */
export const TESSERACT_DATA_DIR = process.env.TESSDATA_PREFIX || path.join(ROOT_DIR, 'tessdata');

// =============================================================================
// EXPORT FILES
// =============================================================================

/**
 * CSV export directory
 */
export const CSV_EXPORT_DIR = path.join(TEMP_DIR, 'exports', 'csv');

/**
 * Excel export directory
 */
export const EXCEL_EXPORT_DIR = path.join(TEMP_DIR, 'exports', 'excel');

/**
 * PDF export directory
 */
export const PDF_EXPORT_DIR = path.join(TEMP_DIR, 'exports', 'pdf');

/**
 * Report files directory
 */
export const REPORTS_DIR = path.join(STORAGE_DIR, 'reports');

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get case-specific upload directory
 * @param caseId - Case ID
 * @returns Path to case directory
 */
export function getCaseDir(caseId: string): string {
  return path.join(DOCUMENTS_DIR, caseId);
}

/**
 * Get document-specific upload directory
 * @param caseId - Case ID
 * @param documentId - Document ID
 * @returns Path to document directory
 */
export function getDocumentDir(caseId: string, documentId: string): string {
  return path.join(DOCUMENTS_DIR, caseId, documentId);
}

/**
 * Get version-specific upload directory
 * @param caseId - Case ID
 * @param documentId - Document ID
 * @param version - Version number
 * @returns Path to version directory
 */
export function getVersionDir(caseId: string, documentId: string, version: number): string {
  return path.join(DOCUMENTS_DIR, caseId, documentId, version.toString());
}

/**
 * Get chunk upload directory for a specific upload session
 * @param uploadId - Upload session ID
 * @returns Path to chunk directory
 */
export function getChunkDir(uploadId: string): string {
  return path.join(CHUNKS_DIR, uploadId);
}

/**
 * Get thumbnail path for a file
 * @param fileId - File ID
 * @returns Path to thumbnail file
 */
export function getThumbnailPath(fileId: string): string {
  return path.join(THUMBNAILS_DIR, `${fileId}_thumb.jpg`);
}

/**
 * Get user avatar path
 * @param userId - User ID
 * @returns Path to avatar file
 */
export function getAvatarPath(userId: string): string {
  return path.join(AVATARS_DIR, `${userId}.jpg`);
}

/**
 * Get backup file path with timestamp
 * @param filename - Base filename
 * @returns Path to backup file with timestamp
 */
export function getBackupPath(filename: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(BACKUP_DIR, `${filename}_${timestamp}`);
}

/**
 * Ensure directory exists (create if not)
 * This is a utility that should be called during initialization
 * @param dirPath - Directory path to ensure
 */
export async function ensureDir(dirPath: string): Promise<void> {
  const fs = await import('fs/promises');
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Get all critical directories that should exist
 * @returns Array of directory paths
 */
export function getCriticalDirectories(): string[] {
  return [
    UPLOAD_DIR,
    TEMP_DIR,
    LOGS_DIR,
    STORAGE_DIR,
    BACKUP_DIR,
    CACHE_DIR,
    DOCUMENTS_DIR,
    CHUNKS_DIR,
    THUMBNAILS_DIR,
    AVATARS_DIR,
    OCR_DIR,
    PDF_PROCESSING_DIR,
    CSV_EXPORT_DIR,
    EXCEL_EXPORT_DIR,
    PDF_EXPORT_DIR,
    REPORTS_DIR,
  ];
}
