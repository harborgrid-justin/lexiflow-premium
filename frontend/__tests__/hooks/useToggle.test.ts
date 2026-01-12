/**
 * @jest-environment jsdom
 * @module tests/hooks/useToggle
 * @description Tests for useToggle hook - boolean state management
 */

import { useToggle } from "@/hooks/useToggle";
import { act, renderHook } from "@testing-library/react";

describe("useToggle", () => {
  describe("Basic Functionality", () => {
    it("should initialize with false by default", () => {
      const { result } = renderHook(() => useToggle());

      expect(result.current[0]).toBe(false);
    });

    it("should initialize with provided value", () => {
      const { result: resultTrue } = renderHook(() => useToggle(true));
      const { result: resultFalse } = renderHook(() => useToggle(false));

      expect(resultTrue.current[0]).toBe(true);
      expect(resultFalse.current[0]).toBe(false);
    });

    it("should toggle value", () => {
      const { result } = renderHook(() => useToggle(false));

      expect(result.current[0]).toBe(false);

      act(() => {
        result.current[1]();
      });

      expect(result.current[0]).toBe(true);

      act(() => {
        result.current[1]();
      });

      expect(result.current[0]).toBe(false);
    });

    it("should set value to true", () => {
      const { result } = renderHook(() => useToggle(false));

      act(() => {
        result.current[2](true);
      });

      expect(result.current[0]).toBe(true);
    });

    it("should set value to false", () => {
      const { result } = renderHook(() => useToggle(true));

      act(() => {
        result.current[2](false);
      });

      expect(result.current[0]).toBe(false);
    });
  });

  describe("Named Functions", () => {
    it("should provide setTrue function", () => {
      const { result } = renderHook(() => useToggle(false));
      const [, , , setTrue] = result.current;

      act(() => {
        setTrue();
      });

      expect(result.current[0]).toBe(true);
    });

    it("should provide setFalse function", () => {
      const { result } = renderHook(() => useToggle(true));
      const [, , , , setFalse] = result.current;

      act(() => {
        setFalse();
      });

      expect(result.current[0]).toBe(false);
    });

    it("should toggle using named function", () => {
      const { result } = renderHook(() => useToggle(false));
      const [, toggle] = result.current;

      act(() => {
        toggle();
      });

      expect(result.current[0]).toBe(true);

      act(() => {
        toggle();
      });

      expect(result.current[0]).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid toggles", () => {
      const { result } = renderHook(() => useToggle(false));

      act(() => {
        result.current[1](); // true
        result.current[1](); // false
        result.current[1](); // true
        result.current[1](); // false
        result.current[1](); // true
      });

      expect(result.current[0]).toBe(true);
    });

    it("should handle idempotent setTrue calls", () => {
      const { result } = renderHook(() => useToggle(false));
      const [, , , setTrue] = result.current;

      act(() => {
        setTrue();
        setTrue();
        setTrue();
      });

      expect(result.current[0]).toBe(true);
    });

    it("should handle idempotent setFalse calls", () => {
      const { result } = renderHook(() => useToggle(true));
      const [, , , , setFalse] = result.current;

      act(() => {
        setFalse();
        setFalse();
        setFalse();
      });

      expect(result.current[0]).toBe(false);
    });

    it("should handle mixed operations", () => {
      const { result } = renderHook(() => useToggle(false));
      const [, toggle, setValue, setTrue, setFalse] = result.current;

      act(() => {
        setTrue(); // true
        setValue(false); // false
        toggle(); // true
        setFalse(); // false
        toggle(); // true
        toggle(); // false
      });

      expect(result.current[0]).toBe(false);
    });
  });

  describe("Stability", () => {
    it("should maintain function reference stability", () => {
      const { result, rerender } = renderHook(() => useToggle(false));

      const initialToggle = result.current[1];
      const initialSetValue = result.current[2];

      rerender();

      expect(result.current[1]).toBe(initialToggle);
      expect(result.current[2]).toBe(initialSetValue);
    });

    it("should not cause unnecessary re-renders", () => {
      let renderCount = 0;

      const { result, rerender } = renderHook(() => {
        renderCount++;
        return useToggle(false);
      });

      const initialRenderCount = renderCount;

      // Rerender without state change shouldn't increment
      rerender();
      expect(renderCount).toBe(initialRenderCount + 1);

      // Toggle should increment
      act(() => {
        result.current[1]();
      });
      expect(renderCount).toBeGreaterThan(initialRenderCount + 1);
    });
  });

  describe("Multiple Instances", () => {
    it("should support independent toggle instances", () => {
      const { result: result1 } = renderHook(() => useToggle(false));
      const { result: result2 } = renderHook(() => useToggle(true));

      expect(result1.current[0]).toBe(false);
      expect(result2.current[0]).toBe(true);

      act(() => {
        result1.current[1]();
      });

      expect(result1.current[0]).toBe(true);
      expect(result2.current[0]).toBe(true); // unchanged

      act(() => {
        result2.current[1]();
      });

      expect(result1.current[0]).toBe(true); // unchanged
      expect(result2.current[0]).toBe(false);
    });
  });

  describe("Cleanup", () => {
    it("should not cause memory leaks on unmount", () => {
      const { unmount } = renderHook(() => useToggle(false));

      unmount();

      // Should not throw or cause issues
    });

    it("should handle multiple mount/unmount cycles", () => {
      const { result, unmount, rerender } = renderHook(() => useToggle(false));

      act(() => {
        result.current[1]();
      });

      expect(result.current[0]).toBe(true);

      unmount();
      rerender();

      // After unmount/remount, should reset to initial value
      expect(result.current[0]).toBe(false);
    });
  });

  describe("TypeScript Type Safety", () => {
    it("should enforce boolean type", () => {
      const { result } = renderHook(() => useToggle(false));

      // Value should be boolean
      const value: boolean = result.current[0];
      expect(typeof value).toBe("boolean");

      // Setter should accept boolean
      act(() => {
        result.current[2](true);
        result.current[2](false);
      });

      expect(result.current[0]).toBe(false);
    });
  });

  describe("Use Cases", () => {
    it("should work for modal open/close", () => {
      const { result } = renderHook(() => useToggle(false));
      const [isOpen, toggle, , setOpen, setClosed] = result.current;

      expect(isOpen).toBe(false);

      // Open modal
      act(() => setOpen());
      expect(result.current[0]).toBe(true);

      // Close modal
      act(() => setClosed());
      expect(result.current[0]).toBe(false);

      // Toggle modal
      act(() => toggle());
      expect(result.current[0]).toBe(true);
    });

    it("should work for loading states", () => {
      const { result } = renderHook(() => useToggle(false));
      const [isLoading, , setLoading, startLoading, stopLoading] =
        result.current;

      expect(isLoading).toBe(false);

      // Start loading
      act(() => startLoading());
      expect(result.current[0]).toBe(true);

      // Stop loading
      act(() => stopLoading());
      expect(result.current[0]).toBe(false);

      // Manual loading control
      act(() => setLoading(true));
      expect(result.current[0]).toBe(true);
    });

    it("should work for visibility toggles", () => {
      const { result } = renderHook(() => useToggle(true));
      const [isVisible, toggleVisibility] = result.current;

      expect(isVisible).toBe(true);

      act(() => toggleVisibility());
      expect(result.current[0]).toBe(false);

      act(() => toggleVisibility());
      expect(result.current[0]).toBe(true);
    });

    it("should work for expanded/collapsed states", () => {
      const { result } = renderHook(() => useToggle(false));
      const [isExpanded, toggleExpanded, , expand, collapse] = result.current;

      expect(isExpanded).toBe(false);

      act(() => expand());
      expect(result.current[0]).toBe(true);

      act(() => collapse());
      expect(result.current[0]).toBe(false);

      act(() => toggleExpanded());
      expect(result.current[0]).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should handle thousands of toggles efficiently", () => {
      const { result } = renderHook(() => useToggle(false));

      const start = performance.now();

      act(() => {
        for (let i = 0; i < 10000; i++) {
          result.current[1]();
        }
      });

      const elapsed = performance.now() - start;

      expect(result.current[0]).toBe(false); // Even number of toggles
      expect(elapsed).toBeLessThan(1000); // Should complete quickly
    });
  });
});
