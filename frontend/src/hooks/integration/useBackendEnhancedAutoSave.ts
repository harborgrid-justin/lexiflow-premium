/**
 * @module hooks/integration/useBackendEnhancedAutoSave
 * @category Hooks - Backend Integration
 * 
 * Enhanced auto-save with backend conflict resolution and versioning.
 * Integrates useEnhancedAutoSave with backend ETags and optimistic locking.
 * 
 * FEATURES:
 * - Version tracking via ETags
 * - Conflict detection and resolution
 * - Retry logic with exponential backoff
 * - Optimistic updates with rollback
 * 
 * @example
 * ```typescript
 * const { status, forceSave, resolveConflict } = useBackendEnhancedAutoSave({
 *   domain: 'documents',
 *   data: documentData,
 *   conflictStrategy: 'manual',
 *   onSuccess: (result) => notify.success('Saved'),
 *   onError: (error) => notify.error(error.message)
 * });
 * 
 * // Handle conflict
 * if (status === 'conflict') {
 *   await resolveConflict('local'); // or 'server' or custom data
 * }
 * ```
 */

import { useCallback } from 'react';

import { apiClient } from '@/services/infrastructure/api-client.service';
import type { BaseEntity } from '@/types';

import { 
  useEnhancedAutoSave, 
  type UseEnhancedAutoSaveOptions,
  type UseEnhancedAutoSaveReturn,
  type SaveResult,
  type VersionMetadata
} from '../core/useEnhancedAutoSave';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Backend response with ETag support
 */
interface BackendResponse<T> {
  data: T;
  version?: string;
  etag?: string;
}

/**
 * Options for useBackendEnhancedAutoSave
 */
export interface UseBackendEnhancedAutoSaveOptions<T extends BaseEntity>
  extends Omit<UseEnhancedAutoSaveOptions<T>, 'onSave'> {
  /** API endpoint (e.g., '/api/documents') */
  endpoint: string;
  /** Optional custom save logic */
  customSave?: (data: T, version?: string) => Promise<SaveResult<T>>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Enhanced auto-save with backend integration.
 * 
 * Provides conflict resolution, versioning, and retry logic
 * integrated with backend ETag/version support.
 * 
 * @param options - Configuration options
 * @returns Enhanced auto-save state and controls
 */
export function useBackendEnhancedAutoSave<T extends BaseEntity>({
  endpoint,
  data,
  customSave,
  ...options
}: UseBackendEnhancedAutoSaveOptions<T>): UseEnhancedAutoSaveReturn<T> {

  const handleSave = useCallback(async (
    dataToSave: T,
    version?: string
  ): Promise<SaveResult<T>> => {
    if (customSave) {
      return customSave(dataToSave, version);
    }

    try {
      // Build headers with version for optimistic locking
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (version) {
        headers['If-Match'] = version;
      }

      // Make PUT request with version header
      const response = await apiClient.put<BackendResponse<T>>(
        `${endpoint}/${dataToSave.id}`,
        dataToSave,
        { headers }
      );

      // Extract version from response
      const responseVersion = response.version || response.etag;
      const versionMetadata: VersionMetadata | undefined = responseVersion ? {
        version: responseVersion,
        timestamp: Date.now(),
        userId: dataToSave.userId
      } : undefined;

      return {
        success: true,
        data: response.data,
        version: versionMetadata
      };

    } catch (error: unknown) {
      // Handle 409 Conflict
      if ((error as { status?: number }).status === 409) {
        // Fetch current server version
        try {
          const serverData = await apiClient.get<T>(`${endpoint}/${dataToSave.id}`);
          
          return {
            success: false,
            conflict: true,
            serverData,
            error: new Error('Version conflict detected')
          };
        } catch (fetchError) {
          return {
            success: false,
            error: fetchError as Error
          };
        }
      }

      // Handle 412 Precondition Failed (version mismatch)
      if ((error as { status?: number }).status === 412) {
        try {
          const serverData = await apiClient.get<T>(`${endpoint}/${dataToSave.id}`);
          
          return {
            success: false,
            conflict: true,
            serverData,
            error: new Error('Version mismatch - data was modified')
          };
        } catch (fetchError) {
          return {
            success: false,
            error: fetchError as Error
          };
        }
      }

      // Other errors
      return {
        success: false,
        error: error as Error
      };
    }
  }, [endpoint, customSave]);

  return useEnhancedAutoSave({
    ...options,
    data,
    onSave: handleSave
  });
}
