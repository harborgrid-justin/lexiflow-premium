/**
 * @jest-environment jsdom
 * @module tests/hooks/useKeyboardShortcuts
 * @description Tests for useKeyboardShortcuts hook - keyboard event handling
 */

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { act, renderHook } from "@testing-library/react";

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Single Key Shortcuts", () => {
    it("should trigger callback on key press", () => {
      const callback = jest.fn();
      const shortcuts = { Escape: callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent("keydown", { key: "Escape" });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple single-key shortcuts", () => {
      const escapeCallback = jest.fn();
      const enterCallback = jest.fn();
      const spaceCallback = jest.fn();

      const shortcuts = {
        Escape: escapeCallback,
        Enter: enterCallback,
        " ": spaceCallback,
      };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      });

      expect(escapeCallback).toHaveBeenCalledTimes(1);
      expect(enterCallback).toHaveBeenCalledTimes(1);
      expect(spaceCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("Modifier Keys", () => {
    it("should handle Ctrl+key shortcuts", () => {
      const callback = jest.fn();
      const shortcuts = { "Ctrl+s": callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "s",
          ctrlKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should handle Cmd+key shortcuts on Mac", () => {
      const callback = jest.fn();
      const shortcuts = { "Cmd+k": callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should handle Shift+key shortcuts", () => {
      const callback = jest.fn();
      const shortcuts = { "Shift+a": callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "A",
          shiftKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should handle Alt+key shortcuts", () => {
      const callback = jest.fn();
      const shortcuts = { "Alt+f": callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "f",
          altKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple modifier combinations", () => {
      const callback = jest.fn();
      const shortcuts = { "Ctrl+Shift+p": callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "P",
          ctrlKey: true,
          shiftKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("Callback Parameters", () => {
    it("should pass keyboard event to callback", () => {
      const callback = jest.fn();
      const shortcuts = { Enter: callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent("keydown", { key: "Enter" });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "Enter",
        })
      );
    });

    it("should allow preventDefault in callback", () => {
      const callback = jest.fn((e) => e.preventDefault());
      const shortcuts = { "Ctrl+s": callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "s",
          ctrlKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("Enabled/Disabled State", () => {
    it("should respect enabled flag", () => {
      const callback = jest.fn();
      const shortcuts = { Enter: callback };

      const { rerender } = renderHook(
        ({ enabled }) => useKeyboardShortcuts(shortcuts, { enabled }),
        { initialProps: { enabled: false } }
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });

      expect(callback).not.toHaveBeenCalled();

      // Enable shortcuts
      rerender({ enabled: true });

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should dynamically enable/disable shortcuts", () => {
      const callback = jest.fn();
      const shortcuts = { Enter: callback };

      const { rerender } = renderHook(
        ({ enabled }) => useKeyboardShortcuts(shortcuts, { enabled }),
        { initialProps: { enabled: true } }
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });

      expect(callback).toHaveBeenCalledTimes(1);

      // Disable
      rerender({ enabled: false });

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });

      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe("Target Element", () => {
    it("should work with specific target element", () => {
      const callback = jest.fn();
      const shortcuts = { Enter: callback };
      const targetElement = document.createElement("div");
      document.body.appendChild(targetElement);

      renderHook(() =>
        useKeyboardShortcuts(shortcuts, { target: targetElement })
      );

      act(() => {
        targetElement.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
          })
        );
      });

      expect(callback).toHaveBeenCalledTimes(1);

      document.body.removeChild(targetElement);
    });

    it("should not trigger on different elements", () => {
      const callback = jest.fn();
      const shortcuts = { Enter: callback };
      const targetElement = document.createElement("div");
      const otherElement = document.createElement("div");
      document.body.appendChild(targetElement);
      document.body.appendChild(otherElement);

      renderHook(() =>
        useKeyboardShortcuts(shortcuts, { target: targetElement })
      );

      act(() => {
        otherElement.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: false,
          })
        );
      });

      expect(callback).not.toHaveBeenCalled();

      document.body.removeChild(targetElement);
      document.body.removeChild(otherElement);
    });
  });

  describe("Input Element Exclusions", () => {
    it("should not trigger in input fields by default", () => {
      const callback = jest.fn();
      const shortcuts = { Enter: callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const input = document.createElement("input");
      document.body.appendChild(input);

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
        });
        Object.defineProperty(event, "target", {
          value: input,
          configurable: true,
        });
        window.dispatchEvent(event);
      });

      // Should not trigger on input fields
      expect(callback).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it("should optionally trigger in input fields", () => {
      const callback = jest.fn();
      const shortcuts = { Escape: callback };

      renderHook(() =>
        useKeyboardShortcuts(shortcuts, {
          enableInInputs: true,
        })
      );

      const input = document.createElement("input");
      document.body.appendChild(input);

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
        });
        Object.defineProperty(event, "target", {
          value: input,
          configurable: true,
        });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalledTimes(1);

      document.body.removeChild(input);
    });
  });

  describe("Cleanup", () => {
    it("should remove event listeners on unmount", () => {
      const callback = jest.fn();
      const shortcuts = { Enter: callback };

      const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

      unmount();

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle multiple mount/unmount cycles", () => {
      const callback = jest.fn();
      const shortcuts = { Enter: callback };

      const hook1 = renderHook(() => useKeyboardShortcuts(shortcuts));
      hook1.unmount();

      const hook2 = renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });

      expect(callback).toHaveBeenCalledTimes(1);

      hook2.unmount();
    });
  });

  describe("Dynamic Shortcuts", () => {
    it("should update shortcuts dynamically", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { rerender } = renderHook(
        ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
        { initialProps: { shortcuts: { Enter: callback1 } } }
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();

      // Update shortcuts
      rerender({ shortcuts: { Enter: callback2 } });

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should handle adding shortcuts", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { rerender } = renderHook(
        ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
        { initialProps: { shortcuts: { Enter: callback1 } } }
      );

      // Add new shortcut
      rerender({ shortcuts: { Enter: callback1, Escape: callback2 } });

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });

      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should handle removing shortcuts", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { rerender } = renderHook(
        ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
        { initialProps: { shortcuts: { Enter: callback1, Escape: callback2 } } }
      );

      // Remove Escape shortcut
      rerender({ shortcuts: { Enter: callback1 } });

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });

      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty shortcuts object", () => {
      expect(() => {
        renderHook(() => useKeyboardShortcuts({}));
      }).not.toThrow();
    });

    it("should handle case sensitivity", () => {
      const callback = jest.fn();
      const shortcuts = { a: callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      });

      expect(callback).toHaveBeenCalledTimes(1);

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
      });

      // Should handle both cases
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it("should handle special keys", () => {
      const callbacks = {
        ArrowUp: jest.fn(),
        ArrowDown: jest.fn(),
        ArrowLeft: jest.fn(),
        ArrowRight: jest.fn(),
        Tab: jest.fn(),
        Backspace: jest.fn(),
      };

      renderHook(() => useKeyboardShortcuts(callbacks));

      Object.keys(callbacks).forEach((key) => {
        act(() => {
          window.dispatchEvent(new KeyboardEvent("keydown", { key }));
        });
      });

      Object.values(callbacks).forEach((callback) => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    it("should not interfere with other keyboard handlers", () => {
      const ourCallback = jest.fn();
      const otherCallback = jest.fn();

      const shortcuts = { Enter: ourCallback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      window.addEventListener("keydown", otherCallback);

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      });

      expect(ourCallback).toHaveBeenCalledTimes(1);
      expect(otherCallback).toHaveBeenCalledTimes(1);

      window.removeEventListener("keydown", otherCallback);
    });
  });

  describe("Performance", () => {
    it("should handle many shortcuts efficiently", () => {
      const shortcuts: Record<string, () => void> = {};
      for (let i = 0; i < 100; i++) {
        shortcuts[`F${i}`] = jest.fn();
      }

      expect(() => {
        renderHook(() => useKeyboardShortcuts(shortcuts));
      }).not.toThrow();
    });

    it("should handle rapid key presses", () => {
      const callback = jest.fn();
      const shortcuts = { a: callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        for (let i = 0; i < 100; i++) {
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
        }
      });

      expect(callback).toHaveBeenCalledTimes(100);
    });
  });
});
