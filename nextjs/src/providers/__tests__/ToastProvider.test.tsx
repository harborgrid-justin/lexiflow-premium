/**
 * Tests for ToastProvider
 *
 * This file tests the toast notification provider including:
 * - Adding and removing toasts
 * - Toast types (success, error, warning, info)
 * - Queue management and prioritization
 * - Auto-dismiss timing
 * - Deduplication
 * - Maximum visible limit
 * - Context splitting for performance
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ToastProvider } from "../ToastProvider";
import { useToast, useToastActions, useToastState } from "../ToastHooks";

// ============================================================================
// Test Setup
// ============================================================================

// Mock timers for auto-dismiss tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// ============================================================================
// Test Wrapper
// ============================================================================

function createWrapper(options: { maxVisible?: number; maxQueue?: number } = {}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ToastProvider maxVisible={options.maxVisible} maxQueue={options.maxQueue}>
        {children}
      </ToastProvider>
    );
  };
}

// ============================================================================
// Hook Usage Outside Provider
// ============================================================================

describe("Toast hooks outside provider", () => {
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it("useToastState throws when used outside ToastProvider", () => {
    expect(() => {
      renderHook(() => useToastState());
    }).toThrow("useToastState must be used within a ToastProvider");
  });

  it("useToastActions throws when used outside ToastProvider", () => {
    expect(() => {
      renderHook(() => useToastActions());
    }).toThrow("useToastActions must be used within a ToastProvider");
  });

  it("useToast throws when used outside ToastProvider", () => {
    expect(() => {
      renderHook(() => useToast());
    }).toThrow("useToastState must be used within a ToastProvider");
  });
});

// ============================================================================
// Initial State
// ============================================================================

describe("ToastProvider initial state", () => {
  it("should start with empty toast list", () => {
    const { result } = renderHook(() => useToastState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.toasts).toEqual([]);
  });

  it("should provide all action methods", () => {
    const { result } = renderHook(() => useToastActions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.addToast).toBeDefined();
    expect(result.current.removeToast).toBeDefined();
    expect(result.current.success).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.info).toBeDefined();
    expect(result.current.warning).toBeDefined();
    expect(result.current.notifySuccess).toBeDefined();
    expect(result.current.notifyError).toBeDefined();
  });
});

// ============================================================================
// Adding Toasts
// ============================================================================

describe("ToastProvider adding toasts", () => {
  it("should add a toast with addToast", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addToast("Test message", "info");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: "Test message",
      type: "info",
    });
  });

  it("should add success toast", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.success("Success message");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: "Success message",
      type: "success",
    });
  });

  it("should add error toast", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.error("Error message");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: "Error message",
      type: "error",
    });
  });

  it("should add warning toast", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.warning("Warning message");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: "Warning message",
      type: "warning",
    });
  });

  it("should add info toast", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Info message");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: "Info message",
      type: "info",
    });
  });

  it("should generate unique IDs for toasts", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Message 1");
      result.current.info("Message 2");
      result.current.info("Message 3");
    });

    const ids = result.current.toasts.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should assign correct priority based on type", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper({ maxVisible: 10 }),
    });

    act(() => {
      result.current.info("Info");
      result.current.success("Success");
      result.current.warning("Warning");
      result.current.error("Error");
    });

    const priorities = result.current.toasts.map((t) => ({
      type: t.type,
      priority: t.priority,
    }));

    const infoToast = priorities.find((p) => p.type === "info");
    const successToast = priorities.find((p) => p.type === "success");
    const warningToast = priorities.find((p) => p.type === "warning");
    const errorToast = priorities.find((p) => p.type === "error");

    expect(errorToast!.priority).toBeGreaterThan(warningToast!.priority);
    expect(warningToast!.priority).toBeGreaterThan(successToast!.priority);
    expect(successToast!.priority).toBeGreaterThan(infoToast!.priority);
  });
});

// ============================================================================
// Removing Toasts
// ============================================================================

describe("ToastProvider removing toasts", () => {
  it("should remove a toast by ID", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Test message");
    });

    const toastId = result.current.toasts[0]!.id;

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("should only remove the specified toast", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Message 1");
      result.current.info("Message 2");
      result.current.info("Message 3");
    });

    const toastToRemove = result.current.toasts[1]!;

    act(() => {
      result.current.removeToast(toastToRemove.id);
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts.find((t) => t.id === toastToRemove.id)).toBeUndefined();
  });

  it("should handle removing non-existent toast", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Test message");
    });

    act(() => {
      result.current.removeToast("non-existent-id");
    });

    // Should not throw, original toast still present
    expect(result.current.toasts).toHaveLength(1);
  });
});

// ============================================================================
// Auto-Dismiss
// ============================================================================

describe("ToastProvider auto-dismiss", () => {
  it("should auto-dismiss info toast after default timeout", async () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Auto-dismiss test");
    });

    expect(result.current.toasts).toHaveLength(1);

    // Fast-forward past auto-dismiss time (default is 5000ms)
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("should auto-dismiss error toast after longer timeout", async () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.error("Error toast test");
    });

    expect(result.current.toasts).toHaveLength(1);

    // Info timeout (5s) - error should still be present
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.toasts).toHaveLength(1);

    // Error timeout is longer (default 8000ms)
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("should cancel auto-dismiss when toast is manually removed", async () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Test message");
    });

    const toastId = result.current.toasts[0]!.id;

    // Manually remove before auto-dismiss
    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);

    // Advance timers - should not cause any issues
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});

// ============================================================================
// Maximum Visible Limit
// ============================================================================

describe("ToastProvider maxVisible limit", () => {
  it("should respect maxVisible limit", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper({ maxVisible: 2 }),
    });

    act(() => {
      result.current.info("Message 1");
      result.current.info("Message 2");
      result.current.info("Message 3");
    });

    // Only 2 should be visible
    expect(result.current.toasts).toHaveLength(2);
  });

  it("should show queued toasts when visible ones are dismissed", async () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper({ maxVisible: 2 }),
    });

    act(() => {
      result.current.info("Message 1");
      result.current.info("Message 2");
      result.current.info("Message 3"); // Queued
    });

    expect(result.current.toasts).toHaveLength(2);

    // Remove first toast
    act(() => {
      result.current.removeToast(result.current.toasts[0]!.id);
    });

    // Third message should now be visible
    await waitFor(() => {
      expect(result.current.toasts).toHaveLength(2);
    });
  });

  it("should use default maxVisible of 3", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Message 1");
      result.current.info("Message 2");
      result.current.info("Message 3");
      result.current.info("Message 4");
    });

    expect(result.current.toasts).toHaveLength(3);
  });
});

// ============================================================================
// Deduplication
// ============================================================================

describe("ToastProvider deduplication", () => {
  it("should not add duplicate toasts", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Duplicate message");
      result.current.info("Duplicate message");
      result.current.info("Duplicate message");
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  it("should allow same message with different types", () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Same message");
      result.current.error("Same message");
      result.current.success("Same message");
    });

    expect(result.current.toasts).toHaveLength(3);
  });

  it("should allow duplicate message after original is dismissed", async () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Duplicate test");
    });

    // Remove the toast
    act(() => {
      result.current.removeToast(result.current.toasts[0]!.id);
    });

    // Should be able to add same message again
    act(() => {
      result.current.info("Duplicate test");
    });

    expect(result.current.toasts).toHaveLength(1);
  });
});

// ============================================================================
// Priority Queue
// ============================================================================

describe("ToastProvider priority queue", () => {
  it("should prioritize error toasts over info toasts", async () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: createWrapper({ maxVisible: 1 }),
    });

    // Add info first, then error
    act(() => {
      result.current.info("Info message");
    });

    // Remove info to make room
    act(() => {
      result.current.removeToast(result.current.toasts[0]!.id);
    });

    // Now add both to queue
    act(() => {
      result.current.info("Queued info");
      result.current.error("Queued error");
    });

    // Error should be shown first (higher priority)
    await waitFor(() => {
      const firstToast = result.current.toasts[0];
      expect(firstToast?.type).toBe("error");
    });
  });
});

// ============================================================================
// Context Splitting (Performance)
// ============================================================================

describe("ToastProvider context splitting", () => {
  it("should provide stable action references", () => {
    const { result, rerender } = renderHook(() => useToastActions(), {
      wrapper: createWrapper(),
    });

    const initialAddToast = result.current.addToast;
    const initialRemoveToast = result.current.removeToast;
    const initialSuccess = result.current.success;

    rerender();

    expect(result.current.addToast).toBe(initialAddToast);
    expect(result.current.removeToast).toBe(initialRemoveToast);
    expect(result.current.success).toBe(initialSuccess);
  });

  it("should update state without changing action references", () => {
    const { result } = renderHook(
      () => ({
        state: useToastState(),
        actions: useToastActions(),
      }),
      { wrapper: createWrapper() }
    );

    const initialAddToast = result.current.actions.addToast;
    expect(result.current.state.toasts).toHaveLength(0);

    act(() => {
      result.current.actions.info("Test message");
    });

    // State changed
    expect(result.current.state.toasts).toHaveLength(1);

    // Actions remain stable
    expect(result.current.actions.addToast).toBe(initialAddToast);
  });
});

// ============================================================================
// Alias Methods
// ============================================================================

describe("ToastProvider alias methods", () => {
  it("notifySuccess should be alias for success", () => {
    const { result } = renderHook(() => useToastActions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.notifySuccess).toBe(result.current.success);
  });

  it("notifyError should be alias for error", () => {
    const { result } = renderHook(() => useToastActions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.notifyError).toBe(result.current.error);
  });
});

// ============================================================================
// Cleanup
// ============================================================================

describe("ToastProvider cleanup", () => {
  it("should cleanup timeouts on unmount", () => {
    const { result, unmount } = renderHook(() => useToast(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.info("Test 1");
      result.current.info("Test 2");
      result.current.info("Test 3");
    });

    // Unmount - should not cause any timeout errors
    unmount();

    // Advance timers - should not throw
    act(() => {
      jest.advanceTimersByTime(10000);
    });
  });
});
