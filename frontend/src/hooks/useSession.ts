import { useCallback, useEffect, useState } from "react";
import type {
  SessionEvent,
  SessionService,
} from "../services/session/SessionService";
import { useService } from "./useService";

/**
 * HOOK ADAPTER for SessionService
 *
 * PATTERN: Hooks adapt services, never vice versa
 * ROLE: Provide React-friendly interface to session capability
 */

export function useSession() {
  const sessionService = useService<SessionService>("SessionService");

  const setItem = useCallback(
    (key: string, value: string) => {
      sessionService.setItem(key, value);
    },
    [sessionService]
  );

  const getItem = useCallback(
    (key: string) => sessionService.getItem(key),
    [sessionService]
  );

  const removeItem = useCallback(
    (key: string) => {
      sessionService.removeItem(key);
    },
    [sessionService]
  );

  const clear = useCallback(() => {
    sessionService.clear();
  }, [sessionService]);

  return { setItem, getItem, removeItem, clear };
}

export function useSessionVisibility() {
  const sessionService = useService<SessionService>("SessionService");
  const [isVisible, setIsVisible] = useState(() => sessionService.isVisible());

  useEffect(() => {
    const unsubscribe = sessionService.addListener((event: SessionEvent) => {
      if (event.type === "visible" || event.type === "hidden") {
        setIsVisible(event.type === "visible");
      }
    });

    return unsubscribe;
  }, [sessionService]);

  return isVisible;
}

export function useBeforeUnload(handler: () => void) {
  const sessionService = useService<SessionService>("SessionService");

  useEffect(() => {
    const unsubscribe = sessionService.addListener((event: SessionEvent) => {
      if (event.type === "beforeunload") {
        handler();
      }
    });

    return unsubscribe;
  }, [sessionService, handler]);
}
