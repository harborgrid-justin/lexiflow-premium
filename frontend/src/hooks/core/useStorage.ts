import { useCallback } from "react";
import type { IService } from "../../services/core/ServiceLifecycle";
import { ServiceRegistry } from "../../services/core/ServiceRegistry";
import type { StorageService } from "../../services/storage/storage.service";

/**
 * HOOK ADAPTER for StorageService
 *
 * PATTERN: Hooks adapt services, never vice versa
 * ROLE: Provide React-friendly interface to storage capability
 */

export function useStorage() {
  const storageService = ServiceRegistry.get<IService>(
    "storage"
  ) as unknown as StorageService;

  const setItem = useCallback(
    (key: string, value: string) => {
      storageService.setItem(key, value);
    },
    [storageService]
  );

  const getItem = useCallback(
    (key: string) => storageService.getItem(key),
    [storageService]
  );

  const removeItem = useCallback(
    (key: string) => {
      storageService.removeItem(key);
    },
    [storageService]
  );

  const clear = useCallback(() => {
    storageService.clear();
  }, [storageService]);

  const hasItem = useCallback(
    (key: string) => storageService.hasItem(key),
    [storageService]
  );

  return { setItem, getItem, removeItem, clear, hasItem };
}
