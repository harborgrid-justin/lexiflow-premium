/**
 * useWebSocketEvent Hook
 * Subscribe to specific WebSocket events with automatic cleanup
 */

import { useEffect, useRef, useCallback } from 'react';
import { eventHandlerManager, EventHandler } from '../services/websocket/eventHandlers';

/**
 * Hook to subscribe to WebSocket events
 *
 * @param event - Event name to subscribe to
 * @param handler - Event handler function
 * @param dependencies - Dependencies array (like useEffect)
 *
 * @example
 * useWebSocketEvent('case:updated', (data) => {
 *   console.log('Case updated:', data);
 *   // Update local state
 * }, []);
 */
export function useWebSocketEvent<T = any>(
  event: string,
  handler: EventHandler<T>,
  dependencies: React.DependencyList = [],
): void {
  const handlerRef = useRef(handler);

  // Update handler ref when it changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    // Wrapper to use latest handler
    const wrappedHandler: EventHandler<T> = (data) => {
      handlerRef.current(data);
    };

    // Subscribe to event
    const unsubscribe = eventHandlerManager.on(event, wrappedHandler);

    // Cleanup on unmount or dependencies change
    return () => {
      unsubscribe();
    };
  }, [event, ...dependencies]);
}

/**
 * Hook to subscribe to multiple WebSocket events
 *
 * @param events - Object mapping event names to handlers
 * @param dependencies - Dependencies array
 *
 * @example
 * useWebSocketEvents({
 *   'case:updated': (data) => console.log('Case updated:', data),
 *   'case:deleted': (data) => console.log('Case deleted:', data),
 * }, []);
 */
export function useWebSocketEvents(
  events: Record<string, EventHandler>,
  dependencies: React.DependencyList = [],
): void {
  const handlersRef = useRef(events);

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = events;
  }, [events]);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    // Subscribe to all events
    Object.entries(events).forEach(([event, handler]) => {
      const wrappedHandler: EventHandler = (data) => {
        const currentHandler = handlersRef.current[event];
        if (currentHandler) {
          currentHandler(data);
        }
      };

      const unsubscribe = eventHandlerManager.on(event, wrappedHandler);
      unsubscribers.push(unsubscribe);
    });

    // Cleanup all subscriptions
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [Object.keys(events).join(','), ...dependencies]);
}

/**
 * Hook to emit WebSocket events
 *
 * @returns Object with emit and emitWithAck functions
 *
 * @example
 * const { emit, emitWithAck } = useWebSocketEmit();
 *
 * // Simple emit
 * emit('case:update', { caseId: '123', status: 'closed' });
 *
 * // Emit with acknowledgment
 * const result = await emitWithAck('case:create', caseData);
 */
export function useWebSocketEmit() {
  const emit = useCallback((event: string, data?: any) => {
    eventHandlerManager.emit(event, data);
  }, []);

  const emitWithAck = useCallback(
    async <T = any>(event: string, data?: any): Promise<T> => {
      return eventHandlerManager.emitWithAck<T>(event, data);
    },
    [],
  );

  return { emit, emitWithAck };
}

/**
 * Hook to handle event with loading and error states
 *
 * @param event - Event name
 * @param handler - Async event handler
 * @param dependencies - Dependencies array
 *
 * @example
 * const { loading, error } = useWebSocketEventWithState(
 *   'case:updated',
 *   async (data) => {
 *     await updateCase(data);
 *   },
 *   []
 * );
 */
export function useWebSocketEventWithState<T = any>(
  event: string,
  handler: (data: T) => Promise<void> | void,
  dependencies: React.DependencyList = [],
): {
  loading: boolean;
  error: Error | null;
} {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useWebSocketEvent(
    event,
    async (data: T) => {
      try {
        setLoading(true);
        setError(null);
        await handler(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    dependencies,
  );

  return { loading, error };
}

export default useWebSocketEvent;
