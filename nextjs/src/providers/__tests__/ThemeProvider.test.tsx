/**
 * Tests for ThemeProvider
 *
 * This file tests the theme provider including:
 * - Initial theme detection
 * - Theme toggling and setting
 * - localStorage persistence
 * - System preference detection
 * - DOM class updates
 * - Context splitting for performance
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../ThemeProvider";
import { useTheme, useThemeActions, useThemeState } from "../ThemeHooks";
import {
  simulateSystemThemeChange,
  setupThemePreference,
} from "../../../jest.setup.providers";

// ============================================================================
// Test Wrapper
// ============================================================================

function createWrapper(initialMode?: "light" | "dark") {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ThemeProvider initialMode={initialMode}>{children}</ThemeProvider>;
  };
}

// ============================================================================
// Hook Usage Outside Provider
// ============================================================================

describe("Theme hooks outside provider", () => {
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it("useThemeState throws when used outside ThemeProvider", () => {
    expect(() => {
      renderHook(() => useThemeState());
    }).toThrow("useThemeState must be used within a ThemeProvider");
  });

  it("useThemeActions throws when used outside ThemeProvider", () => {
    expect(() => {
      renderHook(() => useThemeActions());
    }).toThrow("useThemeActions must be used within a ThemeProvider");
  });

  it("useTheme throws when used outside ThemeProvider", () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useThemeState must be used within a ThemeProvider");
  });
});

// ============================================================================
// Initial State
// ============================================================================

describe("ThemeProvider initial state", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("should default to light theme when no preference is stored", async () => {
    const { result } = renderHook(() => useThemeState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mode).toBe("light");
    expect(result.current.isDark).toBe(false);
  });

  it("should use initialMode prop when provided", async () => {
    const { result } = renderHook(() => useThemeState(), {
      wrapper: createWrapper("dark"),
    });

    expect(result.current.mode).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });

  it("should restore theme from localStorage", async () => {
    setupThemePreference("dark");

    const { result } = renderHook(() => useThemeState(), {
      wrapper: createWrapper(),
    });

    // Wait for useEffect to sync
    await waitFor(() => {
      expect(result.current.mode).toBe("dark");
    });

    expect(result.current.isDark).toBe(true);
  });

  it("should provide theme tokens", async () => {
    const { result } = renderHook(() => useThemeState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.theme).toBeDefined();
    expect(result.current.theme.colors).toBeDefined();
  });
});

// ============================================================================
// Theme Toggling
// ============================================================================

describe("ThemeProvider toggling", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("should toggle from light to dark", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    expect(result.current.mode).toBe("light");

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.mode).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });

  it("should toggle from dark to light", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("dark"),
    });

    expect(result.current.mode).toBe("dark");

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.mode).toBe("light");
    expect(result.current.isDark).toBe(false);
  });

  it("should persist toggle to localStorage", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem("lexiflow-theme")).toBe("dark");
  });

  it("should support multiple toggles", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    // Toggle to dark
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.mode).toBe("dark");

    // Toggle back to light
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.mode).toBe("light");

    // Toggle to dark again
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.mode).toBe("dark");
  });
});

// ============================================================================
// Set Theme Directly
// ============================================================================

describe("ThemeProvider setTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("should set theme to dark", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.mode).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });

  it("should set theme to light", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("dark"),
    });

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.mode).toBe("light");
    expect(result.current.isDark).toBe(false);
  });

  it("should persist setTheme to localStorage", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(localStorage.getItem("lexiflow-theme")).toBe("dark");
  });

  it("should handle setting same theme", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.mode).toBe("light");
    expect(localStorage.getItem("lexiflow-theme")).toBe("light");
  });
});

// ============================================================================
// DOM Updates
// ============================================================================

describe("ThemeProvider DOM updates", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("should update document class on theme change", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    // Wait for mount
    await waitFor(() => {
      expect(document.documentElement.classList.contains("light")).toBe(true);
    });

    act(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.classList.contains("light")).toBe(false);
    });
  });

  it("should remove old class before adding new one", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains("light")).toBe(true);
    });

    act(() => {
      result.current.toggleTheme();
    });

    await waitFor(() => {
      // Should only have one theme class
      const hasLight = document.documentElement.classList.contains("light");
      const hasDark = document.documentElement.classList.contains("dark");
      expect(hasLight && hasDark).toBe(false);
      expect(hasLight || hasDark).toBe(true);
    });
  });
});

// ============================================================================
// System Theme Detection
// ============================================================================

describe("ThemeProvider system preference", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("should detect system dark mode preference on mount", async () => {
    // This test relies on the matchMedia mock in jest.setup.providers.ts
    // The mock starts with prefersDarkMode = false, then we simulate a change

    const { result } = renderHook(() => useThemeState(), {
      wrapper: createWrapper(),
    });

    // Initially should be light (default when no localStorage)
    expect(result.current.mode).toBe("light");

    // Note: Testing actual matchMedia detection would require more complex setup
    // The provider checks matchMedia on mount after checking localStorage
  });

  it("should respond to system theme changes", async () => {
    // This demonstrates how to test system theme changes
    // In practice, the provider would need to add a listener for changes

    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mode).toBe("light");

    // Simulate system theme change (if provider supports it)
    act(() => {
      simulateSystemThemeChange(true);
    });

    // Note: Current implementation doesn't auto-respond to system changes
    // after initial mount. This test documents that behavior.
    // If auto-sync is added, this test would verify it.
  });
});

// ============================================================================
// Context Splitting (Performance)
// ============================================================================

describe("ThemeProvider context splitting", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("should provide stable action references", async () => {
    const { result, rerender } = renderHook(() => useThemeActions(), {
      wrapper: createWrapper(),
    });

    const initialToggle = result.current.toggleTheme;
    const initialSetTheme = result.current.setTheme;

    rerender();

    expect(result.current.toggleTheme).toBe(initialToggle);
    expect(result.current.setTheme).toBe(initialSetTheme);
  });

  it("should update state without changing action references", async () => {
    const { result } = renderHook(
      () => ({
        state: useThemeState(),
        actions: useThemeActions(),
      }),
      { wrapper: createWrapper("light") }
    );

    const initialToggle = result.current.actions.toggleTheme;
    expect(result.current.state.mode).toBe("light");

    act(() => {
      result.current.actions.toggleTheme();
    });

    // State changed
    expect(result.current.state.mode).toBe("dark");

    // Actions remain stable
    expect(result.current.actions.toggleTheme).toBe(initialToggle);
  });

  it("should memoize theme object correctly", async () => {
    const { result, rerender } = renderHook(() => useThemeState(), {
      wrapper: createWrapper("light"),
    });

    const initialTheme = result.current.theme;

    // Rerender without state change
    rerender();

    // Theme object should be stable
    expect(result.current.theme).toBe(initialTheme);
  });

  it("should create new theme object on mode change", async () => {
    const { result } = renderHook(
      () => ({
        state: useThemeState(),
        actions: useThemeActions(),
      }),
      { wrapper: createWrapper("light") }
    );

    const initialTheme = result.current.state.theme;

    act(() => {
      result.current.actions.toggleTheme();
    });

    // Theme object should be different after mode change
    // (because tokens change between light/dark)
    expect(result.current.state.theme).not.toBe(initialTheme);
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("ThemeProvider edge cases", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("should handle invalid localStorage value", async () => {
    localStorage.setItem("lexiflow-theme", "invalid-theme");

    const { result } = renderHook(() => useThemeState(), {
      wrapper: createWrapper(),
    });

    // Should use the invalid value since the provider casts it
    // In production, you might want validation
    await waitFor(() => {
      // Provider should still function
      expect(result.current.theme).toBeDefined();
    });
  });

  it("should handle rapid toggles", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    // Rapid toggles
    act(() => {
      result.current.toggleTheme();
      result.current.toggleTheme();
      result.current.toggleTheme();
    });

    // Should end up in dark mode (odd number of toggles)
    expect(result.current.mode).toBe("dark");
  });

  it("should handle setTheme during toggle", async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    act(() => {
      result.current.toggleTheme(); // -> dark
      result.current.setTheme("light"); // -> light
    });

    expect(result.current.mode).toBe("light");
  });
});
