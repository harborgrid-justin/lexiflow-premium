/**
 * File Utility Functions
 * Reusable file operations and helpers
 */

import * as crypto from 'crypto';
import * as path from 'path';
import { stat, readFile } from 'fs/promises';

/**
 * Calculate file checksum using specified algorithm
 * @param buffer - File buffer
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns Hex string of the hash
 */
export function calculateChecksum(buffer: Buffer, algorithm: string = 'sha256'): string {
  return crypto.createHash(algorithm).update(buffer).digest('hex');
}

/**
 * Calculate file checksum from file path
 * @param filePath - Absolute path to file
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns Hex string of the hash
 */
export async function calculateFileChecksum(filePath: string, algorithm: string = 'sha256'): Promise<string> {
  const buffer = await readFile(filePath);
  return calculateChecksum(buffer, algorithm);
}

/**
 * Verify file checksum matches expected value
 * @param filePath - Absolute path to file
 * @param expectedChecksum - Expected hash value
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns True if checksums match
 */
export async function verifyChecksum(
  filePath: string,
  expectedChecksum: string,
  algorithm: string = 'sha256',
): Promise<boolean> {
  try {
    const actualChecksum = await calculateFileChecksum(filePath, algorithm);
    return actualChecksum === expectedChecksum;
  } catch {
    return false;
  }
}

/**
 * Check if a file exists
 * @param filePath - Path to check
 * @returns True if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size in bytes
 * @param filePath - Path to file
 * @returns File size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await stat(filePath);
  return stats.size;
}

/**
 * Get file metadata
 * @param filePath - Path to file
 * @returns File metadata object
 */
export async function getFileMetadata(filePath: string): Promise<{
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  accessedAt: Date;
}> {
  const stats = await stat(filePath);
  return {
    size: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
    accessedAt: stats.atime,
  };
}

/**
 * Generate a safe filename by removing special characters
 * @param originalName - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${safeBaseName}${ext}`;
}

/**
 * Generate a unique filename with timestamp
 * @param originalName - Original filename
 * @returns Unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${safeBaseName}_${timestamp}_${random}${ext}`;
}

/**
 * Get file extension from filename or path
 * @param filename - Filename or path
 * @returns Extension including the dot, or empty string
 */
export function getFileExtension(filename: string): string {
  return path.extname(filename);
}

/**
 * Get filename without extension
 * @param filename - Filename or path
 * @returns Filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  const ext = path.extname(filename);
  return path.basename(filename, ext);
}

/**
 * Check if file has allowed extension
 * @param filename - Filename to check
 * @param allowedExtensions - Array of allowed extensions (e.g., ['.pdf', '.doc'])
 * @returns True if extension is allowed
 */
export function hasAllowedExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.some((allowed) => allowed.toLowerCase() === ext);
}

/**
 * Check if MIME type is allowed
 * @param mimeType - MIME type to check
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if MIME type is allowed
 */
export function isAllowedMimeType(mimeType: string, allowedTypes: string[]): boolean {
  if (allowedTypes.length === 0) return true;
  return allowedTypes.includes(mimeType);
}
