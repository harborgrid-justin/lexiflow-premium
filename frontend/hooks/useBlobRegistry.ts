/**
 * @module hooks/useBlobRegistry
 * @category Hooks - Memory Management
 * @description Blob URL lifecycle management hook preventing memory leaks from Blob/File object URLs.
 * Maintains Set-based registry of active URLs, provides register/revoke methods, and ensures automatic
 * cleanup on unmount. Critical for managing binary data previews (PDFs, images, videos) without permanent
 * heap leaks until document unload.
 * 
 * SYSTEMS ENGINEERING NOTE:
 * This registry manages the lifecycle of Blob URLs (pointers to binary data in memory).
 * Failure to revoke these URLs causes permanent memory leaks in the browser's heap
 * until the document is unloaded. This hook ensures strict cleanup on component unmount or url replacement.
 * 
 * NO THEME USAGE: Memory management utility hook
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useEffect, useRef, useCallback } from 'react';

// ============================================================================
// HOOK
// ============================================================================
export const useBlobRegistry = () => {
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
    return () => {
      registry.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      registry.current.clear();
    };
  }, []);

  return { register, revoke };
};