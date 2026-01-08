/**
 * Tests for AuthProvider
 *
 * This file tests the authentication provider including:
 * - Initial state and session restoration
 * - Login/logout functionality
 * - Permission and role checking
 * - Storage persistence
 * - Error handling
 */

import {
  createMockUser,
  expectAuthStorageCleared,
  expectAuthStorageSet,
  setupMockAuthApi,
} from "@/test-utils/providers";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  AuthProvider,
  useAuth,
  useAuthActions,
  useAuthState,
} from "../AuthProvider";

// ============================================================================
// Test Wrapper
// ============================================================================

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  };
}

// ============================================================================
// Hook Usage Outside Provider
// ============================================================================

describe("Auth hooks outside provider", () => {
  // Suppress expected errors
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it("useAuthState throws when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuthState());
    }).toThrow("useAuthState must be used within an AuthProvider");
  });

  it("useAuthActions throws when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuthActions());
    }).toThrow("useAuthActions must be used within an AuthProvider");
  });

  it("useAuth throws when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuthState must be used within an AuthProvider");
  });
});

// ============================================================================
// Initial State
// ============================================================================

describe("AuthProvider initial state", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should start with unauthenticated state when no stored session", async () => {
    const { result } = renderHook(() => useAuthState(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for initialization
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should restore session from localStorage", async () => {
    const mockUser = createMockUser();
    localStorage.setItem("lexiflow_auth_token", "stored-token");
    localStorage.setItem("lexiflow_auth_user", JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuthState(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toMatchObject({
      id: mockUser.id,
      email: mockUser.email,
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should handle corrupted localStorage gracefully", async () => {
    localStorage.setItem("lexiflow_auth_token", "stored-token");
    localStorage.setItem("lexiflow_auth_user", "invalid-json{");

    const { result } = renderHook(() => useAuthState(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should fail gracefully and show error
    expect(result.current.error).not.toBeNull();
  });
});

// ============================================================================
// Login
// ============================================================================

describe("AuthProvider login", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should login successfully with valid credentials", async () => {
    const mockUser = createMockUser();
    setupMockAuthApi({ loginSuccess: true, user: mockUser });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Perform login
    let loginResult: boolean;
    await act(async () => {
      loginResult = await result.current.login("test@example.com", "password123");
    });

    expect(loginResult!).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe(mockUser.email);
    expect(result.current.error).toBeNull();

    // Verify storage
    expectAuthStorageSet(mockUser, "mock-jwt-token");
  });

  it("should fail login with invalid credentials", async () => {
    setupMockAuthApi({ loginSuccess: false });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let loginResult: boolean;
    await act(async () => {
      loginResult = await result.current.login("test@example.com", "wrongpassword");
    });

    expect(loginResult!).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).not.toBeNull();
  });

  it("should handle network errors during login", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let loginResult: boolean;
    await act(async () => {
      loginResult = await result.current.login("test@example.com", "password123");
    });

    expect(loginResult!).toBe(false);
    expect(result.current.error).toContain("Network error");
  });

  it("should set loading state during login", async () => {
    // Create a delayed response
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    accessToken: "token",
                    user: { id: "1", email: "test@example.com" },
                  }),
              }),
            100
          )
        )
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Start login (don't await)
    act(() => {
      result.current.login("test@example.com", "password123");
    });

    // Should be loading
    expect(result.current.isLoading).toBe(true);

    // Wait for completion
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});

// ============================================================================
// Logout
// ============================================================================

describe("AuthProvider logout", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should logout successfully", async () => {
    const mockUser = createMockUser();
    setupMockAuthApi({ loginSuccess: true, user: mockUser });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Login first
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login("test@example.com", "password123");
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expectAuthStorageCleared();
  });

  it("should clear local state even if API fails", async () => {
    // Setup authenticated state
    const mockUser = createMockUser();
    localStorage.setItem("lexiflow_auth_token", "stored-token");
    localStorage.setItem("lexiflow_auth_user", JSON.stringify(mockUser));

    // Mock logout to fail
    global.fetch = jest.fn().mockRejectedValue(new Error("API error"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Logout should still work locally
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expectAuthStorageCleared();
  });
});

// ============================================================================
// Permission and Role Checking
// ============================================================================

describe("AuthProvider permissions and roles", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should check permissions correctly", async () => {
    const mockUser = createMockUser({
      permissions: ["cases:read", "cases:write", "documents:read"],
    });
    localStorage.setItem("lexiflow_auth_token", "stored-token");
    localStorage.setItem("lexiflow_auth_user", JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.hasPermission("cases:read")).toBe(true);
    expect(result.current.hasPermission("cases:write")).toBe(true);
    expect(result.current.hasPermission("admin:all")).toBe(false);
  });

  it("should check roles correctly", async () => {
    const mockUser = createMockUser({ role: "attorney" });
    localStorage.setItem("lexiflow_auth_token", "stored-token");
    localStorage.setItem("lexiflow_auth_user", JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.hasRole("attorney")).toBe(true);
    expect(result.current.hasRole("admin")).toBe(false);
    expect(result.current.hasRole("attorney", "paralegal")).toBe(true);
  });

  it("should return false for permissions when not authenticated", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasPermission("cases:read")).toBe(false);
    expect(result.current.hasRole("attorney")).toBe(false);
  });
});

// ============================================================================
// Token Refresh
// ============================================================================

describe("AuthProvider token refresh", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should refresh token successfully", async () => {
    const mockUser = createMockUser();
    localStorage.setItem("lexiflow_auth_token", "old-token");
    localStorage.setItem("lexiflow_auth_user", JSON.stringify(mockUser));

    setupMockAuthApi({ user: mockUser });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    let refreshResult: boolean;
    await act(async () => {
      refreshResult = await result.current.refreshToken();
    });

    expect(refreshResult!).toBe(true);
    expect(localStorage.getItem("lexiflow_auth_token")).toBe("new-mock-token");
  });

  it("should logout on refresh failure", async () => {
    const mockUser = createMockUser();
    localStorage.setItem("lexiflow_auth_token", "old-token");
    localStorage.setItem("lexiflow_auth_user", JSON.stringify(mockUser));

    global.fetch = jest.fn().mockRejectedValue(new Error("Refresh failed"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    let refreshResult: boolean;
    await act(async () => {
      refreshResult = await result.current.refreshToken();
    });

    expect(refreshResult!).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expectAuthStorageCleared();
  });
});

// ============================================================================
// Context Splitting (Performance)
// ============================================================================

describe("AuthProvider context splitting", () => {
  it("should provide stable action references", async () => {
    const { result, rerender } = renderHook(() => useAuthActions(), {
      wrapper: createWrapper(),
    });

    const initialLogin = result.current.login;
    const initialLogout = result.current.logout;

    rerender();

    // Actions should be stable (memoized)
    expect(result.current.login).toBe(initialLogin);
    expect(result.current.logout).toBe(initialLogout);
  });

  it("should update state without changing action references", async () => {
    setupMockAuthApi({ loginSuccess: true });

    const stateResults: Array<{ isAuthenticated: boolean }> = [];

    const { result } = renderHook(
      () => {
        const state = useAuthState();
        const actions = useAuthActions();
        return { state, actions };
      },
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    // Capture initial references
    const initialLogin = result.current.actions.login;
    stateResults.push({ isAuthenticated: result.current.state.isAuthenticated });

    // Login (changes state)
    await act(async () => {
      await result.current.actions.login("test@example.com", "password");
    });

    stateResults.push({ isAuthenticated: result.current.state.isAuthenticated });

    // State should have changed
    expect(stateResults[0]!.isAuthenticated).toBe(false);
    expect(stateResults[1]!.isAuthenticated).toBe(true);

    // But actions should remain stable
    expect(result.current.actions.login).toBe(initialLogin);
  });
});
