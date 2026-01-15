/**
 * @module hooks/useBlobRegistry
 * @category Hooks - Memory Management
 *
 * Manages Blob URL lifecycle to prevent memory leaks.
 * Automatically revokes URLs on unmount.
 *
 * @example
 * ```typescript
 * const blobRegistry = useBlobRegistry();
 *
 * // Create preview URL
 * const previewUrl = blobRegistry.register(pdfBlob);
 * <iframe src={previewUrl} />
 *
 * // Manual cleanup when done
 * blobRegistry.revoke(previewUrl);
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useCallback, useEffect, useRef } from "react";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useBlobRegistry hook
 */
export interface UseBlobRegistryReturn {
  /** Register blob and get URL */
  register: (blob: Blob | File) => string;
  /** Revoke blob URL */
  revoke: (url: string) => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Manages Blob URL lifecycle with automatic cleanup.
 *
 * @returns Object with register and revoke methods
 */
export function useBlobRegistry(): UseBlobRegistryReturn {
  const registry = useRef<Set<string>>(new Set());

  const register = useCallback((blob: Blob | File): string => {
    const url = URL.createObjectURL(blob);
    registry.current.add(url);
    return url;
  }, []);

  const revoke = useCallback((url: string) => {
    if (registry.current.has(url)) {
      URL.revokeObjectURL(url);
      registry.current.delete(url);
    }
  }, []);

  // Automatic cleanup on unmount
  useEffect(() => {
    const currentRegistry = registry.current;
    return () => {
      currentRegistry.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      currentRegistry.clear();
    };
  }, []);

  return { register, revoke };
}
