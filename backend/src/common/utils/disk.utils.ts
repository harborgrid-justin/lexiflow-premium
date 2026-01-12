/**
 * Disk Space Utility Functions
 * System-level disk space operations
 */

import { statfs } from "fs/promises";
import * as os from "os";

/**
 * Disk space statistics
 */
export interface DiskStats {
  available: number; // Available space in bytes
  free: number; // Free space in bytes
  total: number; // Total space in bytes
  used: number; // Used space in bytes
  usedPercentage: number; // Used percentage (0-100)
}

/**
 * Get disk space statistics for a given path
 * @param dirPath - Directory path to check
 * @returns Disk space statistics
 */
export async function getDiskSpace(dirPath: string): Promise<DiskStats> {
  try {
    const stats = await statfs(dirPath);
    const total = stats.blocks * stats.bsize;
    const free = stats.bfree * stats.bsize;
    const available = stats.bavail * stats.bsize;
    const used = total - free;
    const usedPercentage = total > 0 ? (used / total) * 100 : 0;

    return {
      available,
      free,
      total,
      used,
      usedPercentage,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    // Fallback: use os.freemem() for approximate values
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usedPercentage = (used / total) * 100;

    return {
      available: free,
      free,
      total,
      used,
      usedPercentage,
    };
  }
}

/**
 * Check if sufficient disk space is available
 * @param dirPath - Directory path to check
 * @param requiredBytes - Required bytes
 * @param minFreeBytes - Minimum free bytes that must remain (optional)
 * @returns True if sufficient space is available
 */
export async function hasSufficientDiskSpace(
  dirPath: string,
  requiredBytes: number,
  minFreeBytes?: number
): Promise<boolean> {
  const stats = await getDiskSpace(dirPath);
  const spaceAfterWrite = stats.available - requiredBytes;

  if (minFreeBytes !== undefined) {
    return spaceAfterWrite >= minFreeBytes;
  }

  return spaceAfterWrite >= 0;
}

/**
 * Get available disk space percentage
 * @param dirPath - Directory path to check
 * @returns Available space as percentage (0-100)
 */
export async function getAvailableSpacePercentage(
  dirPath: string
): Promise<number> {
  const stats = await getDiskSpace(dirPath);
  if (stats.total === 0) return 0;
  return (stats.available / stats.total) * 100;
}

/**
 * Check if disk is running low on space
 * @param dirPath - Directory path to check
 * @param thresholdPercentage - Threshold percentage (default: 10)
 * @returns True if available space is below threshold
 */
export async function isLowDiskSpace(
  dirPath: string,
  thresholdPercentage: number = 10
): Promise<boolean> {
  const availablePercentage = await getAvailableSpacePercentage(dirPath);
  return availablePercentage < thresholdPercentage;
}

/**
 * Validate disk space before operation
 * @param dirPath - Directory path to check
 * @param requiredBytes - Required bytes for operation
 * @param minFreeBytes - Minimum free bytes that must remain
 * @throws Error if insufficient space
 */
export async function validateDiskSpace(
  dirPath: string,
  requiredBytes: number,
  minFreeBytes: number
): Promise<void> {
  const stats = await getDiskSpace(dirPath);
  const spaceAfterWrite = stats.available - requiredBytes;

  if (spaceAfterWrite < minFreeBytes) {
    const { formatBytes } = await import("./format.utils");
    throw new Error(
      `Insufficient disk space. Available: ${formatBytes(stats.available)}, ` +
        `Required: ${formatBytes(requiredBytes + minFreeBytes)}`
    );
  }
}
