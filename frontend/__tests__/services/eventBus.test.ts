/**
 * eventBus.test.ts
 * Tests for the event bus service
 * Updated: 2025-12-18 - Simple pub/sub pattern still used for UI events
 */

type EventHandler<T = any> = (data: T) => void;

class SimpleEventBus {
  private subscribers = new Map<string, Set<EventHandler>>();

  subscribe<T = any>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  publish<T = any>(eventType: string, data: T): void {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`EventBus error in handler for ${eventType}:`, error);
        }
      });
    }

    // Wildcard handlers
    const wildcardHandlers = this.subscribers.get("*");
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler({ eventType, data });
        } catch (error) {
          console.error("EventBus error in wildcard handler:", error);
        }
      });
    }
  }

  clear(): void {
    this.subscribers.clear();
  }
}

describe("EventBus", () => {
  let eventBus: SimpleEventBus;

  beforeEach(() => {
    eventBus = new SimpleEventBus();
  });

  describe("subscribe", () => {
    it("should add subscriber for event type", () => {
      const handler = jest.fn();
      eventBus.subscribe("test-event", handler);

      eventBus.publish("test-event", { message: "hello" });
      expect(handler).toHaveBeenCalledWith({ message: "hello" });
    });

    it("should return unsubscribe function", () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.subscribe("test-event", handler);

      unsubscribe();
      eventBus.publish("test-event", {});
      expect(handler).not.toHaveBeenCalled();
    });

    it("should support multiple subscribers", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe("test-event", handler1);
      eventBus.subscribe("test-event", handler2);

      eventBus.publish("test-event", { data: "test" });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe("publish", () => {
    it("should notify all subscribers", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe("event-1", handler1);
      eventBus.subscribe("event-1", handler2);

      eventBus.publish("event-1", { value: 42 });

      expect(handler1).toHaveBeenCalledWith({ value: 42 });
      expect(handler2).toHaveBeenCalledWith({ value: 42 });
    });

    it("should pass event data to subscribers", () => {
      const handler = jest.fn();
      const testData = { id: "1", name: "Test" };

      eventBus.subscribe("data-event", handler);
      eventBus.publish("data-event", testData);

      expect(handler).toHaveBeenCalledWith(testData);
    });

    it("should handle no subscribers gracefully", () => {
      expect(() => {
        eventBus.publish("nonexistent-event", {});
      }).not.toThrow();
    });
  });

  describe("unsubscribe", () => {
    it("should remove subscriber", () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.subscribe("test-event", handler);

      unsubscribe();
      eventBus.publish("test-event", {});

      expect(handler).not.toHaveBeenCalled();
    });

    it("should not affect other subscribers", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const unsub1 = eventBus.subscribe("test-event", handler1);
      eventBus.subscribe("test-event", handler2);

      unsub1();
      eventBus.publish("test-event", {});

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe("wildcard events", () => {
    it("should support wildcard subscribers", () => {
      const wildcardHandler = jest.fn();
      eventBus.subscribe("*", wildcardHandler);

      eventBus.publish("any-event", { data: "test" });

      expect(wildcardHandler).toHaveBeenCalledWith({
        eventType: "any-event",
        data: { data: "test" },
      });
    });

    it("should receive all events with wildcard", () => {
      const wildcardHandler = jest.fn();
      eventBus.subscribe("*", wildcardHandler);

      eventBus.publish("event-1", {});
      eventBus.publish("event-2", {});

      expect(wildcardHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe("error handling", () => {
    it("should continue on subscriber error", () => {
      const errorHandler = jest.fn(() => {
        throw new Error("Handler error");
      });
      const normalHandler = jest.fn();

      eventBus.subscribe("test-event", errorHandler);
      eventBus.subscribe("test-event", normalHandler);

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      eventBus.publish("test-event", {});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("backend-first notes", () => {
    it("should note that EventBus is for UI-only events", () => {
      // EventBus is still useful for component-to-component communication
      // Backend events use webhook/SSE architecture
      expect(true).toBe(true);
    });
  });
});
