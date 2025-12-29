/**
 * @module services/blobManager
 * @category Services - Memory Management
 * @description Centralized blob URL lifecycle management service to prevent memory leaks.
 * Tracks all created blob URLs and provides automatic cleanup.
 * 
 * CRITICAL MEMORY MANAGEMENT:
 * Blob URLs created with URL.createObjectURL() MUST be revoked with URL.revokeObjectURL()
 * or they will cause permanent memory leaks until page reload. This service ensures
 * proper cleanup across the entire application.
 * 
 * USAGE:
 * ```typescript
 * // Create managed blob URL
 * const url = BlobManager.create(blob, 'document-preview-123');
 * 
 * // Use the URL
 * <img src={url} />
 * 
 * // Clean up when done
 * BlobManager.revoke(url);
 * 
 * // Or clean up all URLs for a specific context
 * BlobManager.revokeByContext('document-preview-123');
 * ```
 */

import { defaultWindowAdapter } from './adapters/WindowAdapter';

// ============================================================================
// TYPES
// ============================================================================
interface BlobRegistryEntry {
  url: string;
  context?: string;
  createdAt: number;
  blob?: Blob; // Keep reference for debugging
}

// ============================================================================
// BLOB MANAGER SERVICE
// ============================================================================
class BlobManagerService {
  private registry = new Map<string, BlobRegistryEntry>();
  private contextIndex = new Map<string, Set<string>>();

  /**
   * Create a blob URL with optional context tracking
   * @param blob - The Blob or File to create URL for
   * @param context - Optional context identifier for batch cleanup
   * @returns Blob URL string
   */
  create(blob: Blob | File, context?: string): string {
    const url = URL.createObjectURL(blob);
    
    const entry: BlobRegistryEntry = {
      url,
      context,
      createdAt: Date.now(),
      blob: import.meta.env.DEV ? blob : undefined // Keep reference in dev for debugging
    };
    
    this.registry.set(url, entry);
    
    // Index by context for batch cleanup
    if (context) {
      if (!this.contextIndex.has(context)) {
        this.contextIndex.set(context, new Set());
      }
      this.contextIndex.get(context)!.add(url);
    }
    
    return url;
  }

  /**
   * Revoke a single blob URL
   * @param url - The blob URL to revoke
   */
  revoke(url: string): void {
    const entry = this.registry.get(url);
    if (entry) {
      URL.revokeObjectURL(url);
      this.registry.delete(url);
      
      // Remove from context index
      if (entry.context && this.contextIndex.has(entry.context)) {
        this.contextIndex.get(entry.context)!.delete(url);
        
        // Clean up empty context
        if (this.contextIndex.get(entry.context)!.size === 0) {
          this.contextIndex.delete(entry.context);
        }
      }
    }
  }

  /**
   * Revoke all blob URLs for a specific context
   * @param context - Context identifier
   */
  revokeByContext(context: string): void {
    const urls = this.contextIndex.get(context);
    if (urls) {
      urls.forEach(url => this.revoke(url));
    }
  }

  /**
   * Revoke all blob URLs older than specified age
   * @param maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
   */
  revokeOld(maxAgeMs: number = 5 * 60 * 1000): number {
    const now = Date.now();
    const threshold = now - maxAgeMs;
    let revokedCount = 0;
    
    this.registry.forEach((entry, url) => {
      if (entry.createdAt < threshold) {
        this.revoke(url);
        revokedCount++;
      }
    });
    
    return revokedCount;
  }

  /**
   * Revoke all blob URLs (nuclear option)
   */
  revokeAll(): void {
    this.registry.forEach((_, url) => {
      URL.revokeObjectURL(url);
    });
    this.registry.clear();
    this.contextIndex.clear();
  }

  /**
   * Get statistics about tracked blob URLs
   */
  getStats(): {
    total: number;
    byContext: Record<string, number>;
    oldestAge: number;
  } {
    const byContext: Record<string, number> = {};
    let oldestAge = 0;
    const now = Date.now();
    
    this.contextIndex.forEach((urls, context) => {
      byContext[context] = urls.size;
    });
    
    this.registry.forEach(entry => {
      const age = now - entry.createdAt;
      if (age > oldestAge) oldestAge = age;
    });
    
    return {
      total: this.registry.size,
      byContext,
      oldestAge
    };
  }

  /**
   * Check if a URL is managed by this service
   */
  has(url: string): boolean {
    return this.registry.has(url);
  }

  /**
   * Create a temporary blob URL that auto-revokes after specified time
   * Useful for immediate downloads
   */
  createTemporary(blob: Blob | File, ttlMs: number = 5000): string {
    const url = this.create(blob, 'temporary');
    
    setTimeout(() => {
      this.revoke(url);
    }, ttlMs);
    
    return url;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
export const BlobManager = new BlobManagerService();

// ============================================================================
// AUTO-CLEANUP ON PAGE UNLOAD
// ============================================================================
if (typeof window !== 'undefined') {
  defaultWindowAdapter.addEventListener('beforeunload', (() => {
    BlobManager.revokeAll();
  }) as EventListener);
  
  // Periodic cleanup of old URLs (every 2 minutes)
  setInterval(() => {
    const revoked = BlobManager.revokeOld(5 * 60 * 1000); // 5 minutes
    if (revoked > 0) {
      console.debug(`[BlobManager] Auto-cleaned ${revoked} old blob URLs`);
    }
  }, 2 * 60 * 1000);
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================
if (import.meta.env.DEV) {
  // Expose to window for debugging
  (window as any).__blobManager = BlobManager;
  
  // Log warnings for URLs not cleaned up after 10 minutes
  setInterval(() => {
    const stats = BlobManager.getStats();
    if (stats.oldestAge > 10 * 60 * 1000) {
      console.warn(
        `[BlobManager] Memory leak warning: ${stats.total} blob URLs tracked, ` +
        `oldest is ${Math.round(stats.oldestAge / 1000 / 60)} minutes old`
      );
    }
  }, 60 * 1000);
}

