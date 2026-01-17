import { useCallback } from "react";

import { ServiceRegistry } from "../../services/core/ServiceRegistry";

import type { ClipboardService } from "../../services/clipboard/ClipboardService";
import type { IService } from "../../services/core/ServiceLifecycle";

/**
 * HOOK ADAPTER for ClipboardService
 *
 * PATTERN: Hooks adapt services, never vice versa
 * ROLE: Provide React-friendly interface to clipboard capability
 */

export function useClipboard() {
  const clipboardService = ServiceRegistry.get<IService>(
    "ClipboardService"
  ) as unknown as ClipboardService;

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await clipboardService.copy(text);
        return true;
      } catch (error) {
        console.error("[useClipboard] Copy failed:", error);
        return false;
      }
    },
    [clipboardService]
  );

  const paste = useCallback(async (): Promise<string | null> => {
    try {
      return await clipboardService.paste();
    } catch (error) {
      console.error("[useClipboard] Paste failed:", error);
      return null;
    }
  }, [clipboardService]);

  const isSupported = useCallback(
    () => clipboardService.isSupported(),
    [clipboardService]
  );

  return { copy, paste, isSupported };
}
