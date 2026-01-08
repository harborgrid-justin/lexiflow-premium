import {
  EventEmitter,
  TypedEventEmitter,
  createEventEmitter,
  createTypedEventEmitter,
} from "../EventEmitter";

describe("EventEmitter", () => {
  describe("subscribe and emit", () => {
    it("should emit events to subscribers", () => {
      const emitter = new EventEmitter<string>();
      const listener = jest.fn();

      emitter.subscribe(listener);
      emitter.emit("test data");

      expect(listener).toHaveBeenCalledWith("test data");
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should emit to multiple subscribers", () => {
      const emitter = new EventEmitter<string>();
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      emitter.subscribe(listener1);
      emitter.subscribe(listener2);
      emitter.subscribe(listener3);

      emitter.emit("test");

      expect(listener1).toHaveBeenCalledWith("test");
      expect(listener2).toHaveBeenCalledWith("test");
      expect(listener3).toHaveBeenCalledWith("test");
    });

    it("should handle no subscribers", () => {
      const emitter = new EventEmitter<string>();

      expect(() => emitter.emit("test")).not.toThrow();
    });

    it("should pass complex data to listeners", () => {
      interface User {
        id: string;
        name: string;
      }

      const emitter = new EventEmitter<User>();
      const listener = jest.fn();
      const user = { id: "1", name: "John" };

      emitter.subscribe(listener);
      emitter.emit(user);

      expect(listener).toHaveBeenCalledWith(user);
    });
  });

  describe("unsubscribe", () => {
    it("should unsubscribe using returned function", () => {
      const emitter = new EventEmitter<string>();
      const listener = jest.fn();

      const unsubscribe = emitter.subscribe(listener);
      emitter.emit("test1");

      unsubscribe();
      emitter.emit("test2");

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith("test1");
    });

    it("should handle multiple unsubscribes", () => {
      const emitter = new EventEmitter<string>();
      const listener = jest.fn();

      const unsubscribe = emitter.subscribe(listener);
      unsubscribe();
      unsubscribe(); // Should not throw

      emitter.emit("test");
      expect(listener).not.toHaveBeenCalled();
    });

    it("should not affect other subscribers", () => {
      const emitter = new EventEmitter<string>();
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const unsubscribe1 = emitter.subscribe(listener1);
      emitter.subscribe(listener2);

      unsubscribe1();
      emitter.emit("test");

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith("test");
    });
  });

  describe("clear", () => {
    it("should remove all listeners", () => {
      const emitter = new EventEmitter<string>();
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.subscribe(listener1);
      emitter.subscribe(listener2);

      emitter.clear();
      emitter.emit("test");

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it("should reset listener count", () => {
      const emitter = new EventEmitter<string>();

      emitter.subscribe(() => {});
      emitter.subscribe(() => {});

      expect(emitter.listenerCount).toBe(2);

      emitter.clear();
      expect(emitter.listenerCount).toBe(0);
    });
  });

  describe("listenerCount and hasListeners", () => {
    it("should return correct listener count", () => {
      const emitter = new EventEmitter<string>();

      expect(emitter.listenerCount).toBe(0);

      const unsub1 = emitter.subscribe(() => {});
      expect(emitter.listenerCount).toBe(1);

      const unsub2 = emitter.subscribe(() => {});
      expect(emitter.listenerCount).toBe(2);

      unsub1();
      expect(emitter.listenerCount).toBe(1);

      unsub2();
      expect(emitter.listenerCount).toBe(0);
    });

    it("should return correct hasListeners value", () => {
      const emitter = new EventEmitter<string>();

      expect(emitter.hasListeners).toBe(false);

      const unsubscribe = emitter.subscribe(() => {});
      expect(emitter.hasListeners).toBe(true);

      unsubscribe();
      expect(emitter.hasListeners).toBe(false);
    });
  });

  describe("Error handling", () => {
    it("should catch and log listener errors", () => {
      const emitter = new EventEmitter<string>();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const goodListener = jest.fn();
      const badListener = jest.fn(() => {
        throw new Error("listener error");
      });

      emitter.subscribe(badListener);
      emitter.subscribe(goodListener);

      emitter.emit("test");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error in event listener:",
        expect.any(Error)
      );
      expect(goodListener).toHaveBeenCalledWith("test");

      consoleErrorSpy.mockRestore();
    });

    it("should not stop other listeners on error", () => {
      const emitter = new EventEmitter<string>();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const listener1 = jest.fn(() => {
        throw new Error("error 1");
      });
      const listener2 = jest.fn();
      const listener3 = jest.fn(() => {
        throw new Error("error 2");
      });
      const listener4 = jest.fn();

      emitter.subscribe(listener1);
      emitter.subscribe(listener2);
      emitter.subscribe(listener3);
      emitter.subscribe(listener4);

      emitter.emit("test");

      expect(listener2).toHaveBeenCalled();
      expect(listener4).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

      consoleErrorSpy.mockRestore();
    });
  });
});

describe("TypedEventEmitter", () => {
  type TestEvents = {
    "user:created": { id: string; name: string };
    "user:updated": { id: string; changes: object };
    "user:deleted": string;
    "count:changed": number;
  };

  describe("on and emit", () => {
    it("should emit typed events to subscribers", () => {
      const emitter = new TypedEventEmitter<TestEvents>();
      const listener = jest.fn();

      emitter.on("user:created", listener);
      emitter.emit("user:created", { id: "1", name: "John" });

      expect(listener).toHaveBeenCalledWith({ id: "1", name: "John" });
    });

    it("should handle multiple event types", () => {
      const emitter = new TypedEventEmitter<TestEvents>();
      const createdListener = jest.fn();
      const deletedListener = jest.fn();

      emitter.on("user:created", createdListener);
      emitter.on("user:deleted", deletedListener);

      emitter.emit("user:created", { id: "1", name: "John" });
      emitter.emit("user:deleted", "1");

      expect(createdListener).toHaveBeenCalledWith({ id: "1", name: "John" });
      expect(deletedListener).toHaveBeenCalledWith("1");
    });

    it("should only emit to listeners of specific event", () => {
      const emitter = new TypedEventEmitter<TestEvents>();
      const createdListener = jest.fn();
      const updatedListener = jest.fn();

      emitter.on("user:created", createdListener);
      emitter.on("user:updated", updatedListener);

      emitter.emit("user:created", { id: "1", name: "John" });

      expect(createdListener).toHaveBeenCalled();
      expect(updatedListener).not.toHaveBeenCalled();
    });

    it("should handle no listeners for event", () => {
      const emitter = new TypedEventEmitter<TestEvents>();

      expect(() =>
        emitter.emit("user:created", { id: "1", name: "John" })
      ).not.toThrow();
    });
  });

  describe("once", () => {
    it("should call listener only once", () => {
      const emitter = new TypedEventEmitter<TestEvents>();
      const listener = jest.fn();

      emitter.once("user:created", listener);

      emitter.emit("user:created", { id: "1", name: "John" });
      emitter.emit("user:created", { id: "2", name: "Jane" });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ id: "1", name: "John" });
    });

    it("should auto-unsubscribe after first call", () => {
      const emitter = new TypedEventEmitter<TestEvents>();
      const listener = jest.fn();

      emitter.once("user:created", listener);

      expect(emitter.listenerCount("user:created")).toBe(1);

      emitter.emit("user:created", { id: "1", name: "John" });

      expect(emitter.listenerCount("user:created")).toBe(0);
    });

    it("should return unsubscribe function", () => {
      const emitter = new TypedEventEmitter<TestEvents>();
      const listener = jest.fn();

      const unsubscribe = emitter.once("user:created", listener);
      unsubscribe();

      emitter.emit("user:created", { id: "1", name: "John" });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("off", () => {
    it("should remove all listeners for specific event", () => {
      const emitter = new TypedEventEmitter<TestEvents>();
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on("user:created", listener1);
      emitter.on("user:created", listener2);

      emitter.off("user:created");
      emitter.emit("user:created", { id: "1", name: "John" });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it("should remove all listeners when no event specified", () => {
      const emitter = new TypedEventEmitter<TestEvents>();
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on("user:created", listener1);
      emitter.on("user:deleted", listener2);

      emitter.off();

      emitter.emit("user:created", { id: "1", name: "John" });
      emitter.emit("user:deleted", "1");

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it("should not affect other event types", () => {
      const emitter = new TypedEventEmitter<TestEvents>();
      const createdListener = jest.fn();
      const deletedListener = jest.fn();

      emitter.on("user:created", createdListener);
      emitter.on("user:deleted", deletedListener);

      emitter.off("user:created");
      emitter.emit("user:deleted", "1");

      expect(deletedListener).toHaveBeenCalled();
    });
  });

  describe("listenerCount", () => {
    it("should return correct count for event", () => {
      const emitter = new TypedEventEmitter<TestEvents>();

      expect(emitter.listenerCount("user:created")).toBe(0);

      emitter.on("user:created", () => {});
      expect(emitter.listenerCount("user:created")).toBe(1);

      emitter.on("user:created", () => {});
      expect(emitter.listenerCount("user:created")).toBe(2);
    });

    it("should return 0 for event with no listeners", () => {
      const emitter = new TypedEventEmitter<TestEvents>();

      expect(emitter.listenerCount("user:created")).toBe(0);
    });
  });

  describe("eventNames", () => {
    it("should return all events with listeners", () => {
      const emitter = new TypedEventEmitter<TestEvents>();

      emitter.on("user:created", () => {});
      emitter.on("user:deleted", () => {});

      const names = emitter.eventNames;

      expect(names).toContain("user:created");
      expect(names).toContain("user:deleted");
      expect(names).toHaveLength(2);
    });

    it("should return empty array when no listeners", () => {
      const emitter = new TypedEventEmitter<TestEvents>();

      expect(emitter.eventNames).toEqual([]);
    });

    it("should not include events after clearing", () => {
      const emitter = new TypedEventEmitter<TestEvents>();

      emitter.on("user:created", () => {});
      emitter.off("user:created");

      expect(emitter.eventNames).toEqual([]);
    });
  });

  describe("totalListenerCount", () => {
    it("should return total listeners across all events", () => {
      const emitter = new TypedEventEmitter<TestEvents>();

      emitter.on("user:created", () => {});
      emitter.on("user:created", () => {});
      emitter.on("user:deleted", () => {});

      expect(emitter.totalListenerCount).toBe(3);
    });

    it("should return 0 when no listeners", () => {
      const emitter = new TypedEventEmitter<TestEvents>();

      expect(emitter.totalListenerCount).toBe(0);
    });
  });

  describe("Error handling", () => {
    it("should catch and log listener errors", () => {
      const emitter = new TypedEventEmitter<TestEvents>();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      emitter.on("user:created", () => {
        throw new Error("listener error");
      });

      emitter.emit("user:created", { id: "1", name: "John" });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error in event listener"),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});

describe("Factory Functions", () => {
  describe("createEventEmitter", () => {
    it("should create EventEmitter instance", () => {
      const emitter = createEventEmitter<string>();

      expect(emitter).toBeInstanceOf(EventEmitter);
    });

    it("should work with created emitter", () => {
      const emitter = createEventEmitter<string>();
      const listener = jest.fn();

      emitter.subscribe(listener);
      emitter.emit("test");

      expect(listener).toHaveBeenCalledWith("test");
    });
  });

  describe("createTypedEventEmitter", () => {
    it("should create TypedEventEmitter instance", () => {
      type Events = { test: string };
      const emitter = createTypedEventEmitter<Events>();

      expect(emitter).toBeInstanceOf(TypedEventEmitter);
    });

    it("should work with created emitter", () => {
      type Events = { test: string };
      const emitter = createTypedEventEmitter<Events>();
      const listener = jest.fn();

      emitter.on("test", listener);
      emitter.emit("test", "data");

      expect(listener).toHaveBeenCalledWith("data");
    });
  });
});

describe("Edge Cases and Integration", () => {
  it("should handle rapid subscribe/unsubscribe", () => {
    const emitter = new EventEmitter<string>();

    for (let i = 0; i < 100; i++) {
      const unsubscribe = emitter.subscribe(() => {});
      unsubscribe();
    }

    expect(emitter.listenerCount).toBe(0);
  });

  it("should handle many listeners", () => {
    const emitter = new EventEmitter<string>();
    const listeners = Array.from({ length: 1000 }, () => jest.fn());

    listeners.forEach((l) => emitter.subscribe(l));
    emitter.emit("test");

    listeners.forEach((l) => expect(l).toHaveBeenCalledWith("test"));
  });

  it("should handle unsubscribe during emit", () => {
    const emitter = new EventEmitter<string>();
    const unsubscribeHolder: { fn?: () => void } = {};

    const listener1 = jest.fn(() => {
      if (unsubscribeHolder.fn) unsubscribeHolder.fn();
    });
    const listener2 = jest.fn();

    const unsubscribe = emitter.on("test", listener1);
    unsubscribeHolder.fn = unsubscribe;

    unsubscribe = emitter.subscribe(listener1);
    emitter.subscribe(listener2);

    emitter.emit("test");

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(emitter.listenerCount).toBe(1);
  });

  it("should work with TypedEventEmitter and many event types", () => {
    type ManyEvents = {
      event1: string;
      event2: number;
      event3: boolean;
      event4: object;
      event5: string[];
    };

    const emitter = new TypedEventEmitter<ManyEvents>();
    const listeners = {
      event1: jest.fn(),
      event2: jest.fn(),
      event3: jest.fn(),
      event4: jest.fn(),
      event5: jest.fn(),
    };

    emitter.on("event1", listeners.event1);
    emitter.on("event2", listeners.event2);
    emitter.on("event3", listeners.event3);
    emitter.on("event4", listeners.event4);
    emitter.on("event5", listeners.event5);

    emitter.emit("event1", "test");
    emitter.emit("event2", 42);
    emitter.emit("event3", true);
    emitter.emit("event4", { key: "value" });
    emitter.emit("event5", ["a", "b"]);

    expect(listeners.event1).toHaveBeenCalledWith("test");
    expect(listeners.event2).toHaveBeenCalledWith(42);
    expect(listeners.event3).toHaveBeenCalledWith(true);
    expect(listeners.event4).toHaveBeenCalledWith({ key: "value" });
    expect(listeners.event5).toHaveBeenCalledWith(["a", "b"]);
  });
});
