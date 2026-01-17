import { useCallback, useEffect, useState } from "react";

import { ServiceRegistry } from "../../services/core/ServiceRegistry";

import type { IService } from "../../services/core/ServiceLifecycle";
import type {
  SessionEvent,
  SessionService,
} from "../../services/session/session.service";

/**
 * HOOK ADAPTER for SessionService
 *
 * PATTERN: Hooks adapt services, never vice versa
 * ROLE: Provide React-friendly interface to session capability
 */

export function useSession() {
  const sessionService = ServiceRegistry.get<IService>(
    "SessionService"
  ) as unknown as SessionService;

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
  const sessionService = ServiceRegistry.get<IService>(
    "SessionService"
  ) as unknown as SessionService;
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
  const sessionService = ServiceRegistry.get<IService>(
    "SessionService"
  ) as unknown as SessionService;

  useEffect(() => {
    const unsubscribe = sessionService.addListener((event: SessionEvent) => {
      if (event.type === "beforeunload") {
        handler();
      }
    });

    return unsubscribe;
  }, [sessionService, handler]);
}
