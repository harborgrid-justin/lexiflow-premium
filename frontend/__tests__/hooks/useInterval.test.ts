/**
 * @jest-environment jsdom
 * @module tests/hooks/useInterval
 * @description Tests for useInterval hook - setInterval with cleanup
 */

import { useInterval } from "@/hooks/useInterval";
import { act, renderHook } from "@testing-library/react";

describe("useInterval", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Basic Functionality", () => {
    it("should call callback at specified interval", () => {
      const callback = jest.fn();
      const delay = 1000;

      renderHook(() => useInterval(callback, delay));

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback).toHaveBeenCalledTimes(1);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback).toHaveBeenCalledTimes(2);
    });

    it("should call callback multiple times", () => {
      const callback = jest.fn();

      renderHook(() => useInterval(callback, 500));

      act(() => {
        jest.advanceTimersByTime(2500);
      });

      expect(callback).toHaveBeenCalledTimes(5);
    });

    it("should not call callback when delay is null", () => {
      const callback = jest.fn();

      renderHook(() => useInterval(callback, null));

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("Dynamic Delay", () => {
    it("should update interval when delay changes", () => {
      const callback = jest.fn();

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, delay),
        { initialProps: { delay: 1000 } }
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback).toHaveBeenCalledTimes(1);

      // Change delay to 500ms
      rerender({ delay: 500 });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(2);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("should pause when delay becomes null", () => {
      const callback = jest.fn();

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, delay),
        { initialProps: { delay: 1000 } }
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback).toHaveBeenCalledTimes(1);

      // Pause interval
      rerender({ delay: null });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should not call callback while paused
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should resume when delay becomes non-null", () => {
      const callback = jest.fn();

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, delay),
        { initialProps: { delay: null } }
      );

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(callback).not.toHaveBeenCalled();

      // Resume interval
      rerender({ delay: 1000 });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("Callback Updates", () => {
    it("should use latest callback", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { rerender } = renderHook(({ cb }) => useInterval(cb, 1000), {
        initialProps: { cb: callback1 },
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();

      // Update callback
      rerender({ cb: callback2 });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should not restart interval when callback changes", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { rerender } = renderHook(({ cb }) => useInterval(cb, 1000), {
        initialProps: { cb: callback1 },
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      rerender({ cb: callback2 });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should call at the original timing
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe("Cleanup", () => {
    it("should cleanup interval on unmount", () => {
      const callback = jest.fn();

      const { unmount } = renderHook(() => useInterval(callback, 1000));

      unmount();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it("should cleanup when delay changes", () => {
      const callback = jest.fn();
      const clearIntervalSpy = jest.spyOn(global, "clearInterval");

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, delay),
        { initialProps: { delay: 1000 } }
      );

      const initialCallCount = clearIntervalSpy.mock.calls.length;

      rerender({ delay: 500 });

      expect(clearIntervalSpy).toHaveBeenCalledTimes(initialCallCount + 1);

      clearIntervalSpy.mockRestore();
    });

    it("should cleanup when paused", () => {
      const callback = jest.fn();
      const clearIntervalSpy = jest.spyOn(global, "clearInterval");

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, delay),
        { initialProps: { delay: 1000 } }
      );

      const initialCallCount = clearIntervalSpy.mock.calls.length;

      rerender({ delay: null });

      expect(clearIntervalSpy).toHaveBeenCalledTimes(initialCallCount + 1);

      clearIntervalSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero delay", () => {
      const callback = jest.fn();

      renderHook(() => useInterval(callback, 0));

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(callback).toHaveBeenCalled();
    });

    it("should handle very short delays", () => {
      const callback = jest.fn();

      renderHook(() => useInterval(callback, 1));

      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(callback).toHaveBeenCalledTimes(10);
    });

    it("should handle very long delays", () => {
      const callback = jest.fn();

      renderHook(() => useInterval(callback, 1000000));

      act(() => {
        jest.advanceTimersByTime(999999);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should handle negative delay as null", () => {
      const callback = jest.fn();

      renderHook(() => useInterval(callback, -1000));

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Negative delay should be treated as paused
      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle callback that throws", () => {
      const callback = jest.fn(() => {
        throw new Error("Callback error");
      });
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      renderHook(() => useInterval(callback, 1000));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Interval should continue even after error
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });
  });

  describe("Use Cases", () => {
    it("should work for polling data", () => {
      const pollData = jest.fn();

      renderHook(() => useInterval(pollData, 5000));

      act(() => {
        jest.advanceTimersByTime(15000);
      });

      expect(pollData).toHaveBeenCalledTimes(3);
    });

    it("should work for auto-save", () => {
      const autoSave = jest.fn();

      renderHook(() => useInterval(autoSave, 30000));

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(autoSave).toHaveBeenCalledTimes(2);
    });

    it("should work for countdown timer", () => {
      let count = 10;
      const countdown = jest.fn(() => {
        count--;
      });

      const { rerender } = renderHook(
        ({ delay }) => useInterval(countdown, delay),
        { initialProps: { delay: 1000 } }
      );

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(countdown).toHaveBeenCalledTimes(5);
      expect(count).toBe(5);

      // Stop when count reaches 0
      rerender({ delay: count > 0 ? 1000 : null });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(countdown).toHaveBeenCalledTimes(10);
      expect(count).toBe(0);
    });

    it("should work for animation frames", () => {
      const frame = jest.fn();

      renderHook(() => useInterval(frame, 16)); // ~60fps

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should call ~62 times in 1 second
      expect(frame).toHaveBeenCalledTimes(62);
    });
  });

  describe("Multiple Instances", () => {
    it("should support multiple independent intervals", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      renderHook(() => useInterval(callback1, 1000));
      renderHook(() => useInterval(callback2, 500));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(2);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback2).toHaveBeenCalledTimes(4);
    });

    it("should not interfere with each other", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { unmount: unmount1 } = renderHook(() =>
        useInterval(callback1, 1000)
      );
      renderHook(() => useInterval(callback2, 1000));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);

      unmount1();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(2);
    });
  });

  describe("Performance", () => {
    it("should not leak memory with many intervals", () => {
      const callbacks = Array.from({ length: 100 }, () => jest.fn());

      const hooks = callbacks.map((cb) =>
        renderHook(() => useInterval(cb, 1000))
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      callbacks.forEach((cb) => {
        expect(cb).toHaveBeenCalledTimes(1);
      });

      hooks.forEach((hook) => hook.unmount());

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Callbacks should not be called after unmount
      callbacks.forEach((cb) => {
        expect(cb).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle frequent updates efficiently", () => {
      const callback = jest.fn();

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, delay),
        { initialProps: { delay: 1000 } }
      );

      // Frequently change delay
      for (let i = 100; i <= 1000; i += 100) {
        rerender({ delay: i });
      }

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should still work correctly
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("Ref Stability", () => {
    it("should maintain callback ref stability", () => {
      let renderCount = 0;
      const callback = jest.fn(() => {
        renderCount++;
      });

      const { rerender } = renderHook(() => {
        useInterval(callback, 1000);
        return renderCount;
      });

      const initialRenderCount = renderCount;

      rerender();

      // Rerender shouldn't cause unnecessary interval resets
      expect(renderCount).toBe(initialRenderCount);
    });
  });
});
