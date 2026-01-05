/**
 * @module hooks/useAppController
 * @category Hooks - Application
 *
 * Main application controller managing navigation, user context, and global state.
 * Handles app initialization, authentication, and routing.
 *
 * @example
 * ```typescript
 * const app = useAppContext();
 *
 * // Navigation
 * app.navigateToView(PATHS.CASES);
 *
 * // User switching
 * app.switchUser(1);
 *
 * // Global search
 * app.updateSearch('contract');
 *
 * // Case selection
 * app.selectCase(caseId, 'Documents');
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { isBackendApiEnabled } from "@/api";
import { DataService } from "@/services/data/dataService";
import { apiClient } from "@/services/infrastructure/apiClient";
import type { UserId, UserRole } from "@/types";

// Hooks & Context
import { useAuthState } from "@/contexts/auth/AuthProvider";
import { useToast } from "@/providers";
import { useUsers } from "./useDomainData";
import { useSessionStorage } from "./useSessionStorage";

// Utils & Constants
import { PATHS } from "@/config/paths.config";

// Types
import { AppView, Case, User } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useAppController hook
 */
export interface UseAppControllerReturn {
  /** Active view path */
  activeView: AppView;
  /** Navigate to view */
  navigateToView: (view: AppView, tab?: string) => void;
  /** Selected case ID */
  selectedCaseId: string | null;
  /** Selected case object */
  selectedCase: Case | null;
  /** Select case */
  selectCase: (caseId: string | null, tab?: string) => void;
  /** Current user */
  currentUser: User;
  /** Switch user */
  switchUser: (index: number) => void;
  /** Sidebar open state */
  isSidebarOpen: boolean;
  /** Toggle sidebar */
  toggleSidebar: () => void;
  /** Global search query */
  globalSearch: string;
  /** Update search */
  updateSearch: (query: string) => void;
  /** Is app loading */
  isAppLoading: boolean;
  /** Is authenticated */
  isAuthenticated: boolean;
  /** App status message */
  appStatusMessage: string;
  /** Initial tab for case detail */
  initialTab?: string;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Main application controller.
 *
 * @returns Object with app state and navigation methods
 */
export function useAppContext(): UseAppControllerReturn {
  // Re-export as useAppController for backward compatibility
  const [activeView, setActiveView] = useSessionStorage<AppView>(
    `lexiflow_active_view`,
    PATHS.DASHBOARD
  );
  const [selectedCaseId, setSelectedCaseId] = useSessionStorage<string | null>(
    `lexiflow_selected_case_id`,
    null
  );
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const { addToast } = useToast();

  // Sidebar should be open by default on desktop (>=768px), closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true; // Default to open for SSR
  });
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [globalSearch] = useState("");
  const [, startTransition] = useTransition();

  const [initialTab, setInitialTab] = useState<string | undefined>(undefined);

  // App Initialization State
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthenticated] = useState(false);
  const [appStatusMessage, setAppStatusMessage] = useState(
    "Initializing Secure Data Layer..."
  );

  // Strict Mode readiness: Prevent double-initialization (Principle #7)
  // Critical for preventing duplicate API calls and race conditions
  const isInitialized = useRef(false);

  // Get authenticated user from AuthProvider
  const { user: authUser, isAuthenticated: authIsAuthenticated } =
    useAuthState();

  // Domain Data - only fetch if we have an authenticated user
  const { data: users = [] } = useUsers();

  // Use authenticated user if available, otherwise fallback to fetched users or default guest
  const currentUser: User = authUser
    ? ({
        id: authUser.id as UserId,
        email: authUser.email,
        name: authUser.name || authUser.email.split("@")[0],
        firstName: authUser.name?.split(" ")[0] || authUser.email.split("@")[0],
        lastName: authUser.name?.split(" ").slice(1).join(" ") || "",
        role: authUser.role as UserRole,
        avatarUrl: authUser.avatarUrl,
        permissions: (authUser.permissions || []) as string[],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as User)
    : users[currentUserIndex] ||
      ({
        id: "temp-user" as UserId,
        email: "Guest",
        name: "Guest User",
        firstName: "Guest",
        lastName: "User",
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as User);

  // ==========================================================================
  // INITIALIZATION LOGIC
  // ==========================================================================
  // Effect discipline: App initialization is synchronization with external systems (Principle #6)
  // Cleanup pattern prevents double-execution in Strict Mode (Principle #7)
  useEffect(() => {
    // Guard against double-invocation in React 18 Strict Mode
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
      try {
        console.log("[useAppController] Starting initialization...");

        // Authentication is handled by AuthProvider
        // Just verify backend connectivity
        const backendApiEnabled = isBackendApiEnabled();

        if (backendApiEnabled) {
          setAppStatusMessage("Connecting to backend API...");

          // Check Health
          try {
            await apiClient.healthCheck();
            setAppStatusMessage("Connected to backend");
          } catch (healthError) {
            console.error("Backend health check failed:", healthError);
            setAppStatusMessage(
              "Backend not reachable. Switching to local mode."
            );
            localStorage.setItem("VITE_USE_INDEXEDDB", "true");
            window.location.reload();
            return;
          }
        } else {
          console.warn("IndexedDB mode is deprecated. Please use backend API.");
        }

        // Wait for auth to complete
        if (!authIsAuthenticated && !authUser) {
          console.log("[useAppController] Waiting for authentication...");
          return;
        }

        setIsAppLoading(false);
      } catch (e) {
        console.error("Initialization failed:", e);
        setAppStatusMessage("Error initializing application.");
        setIsAppLoading(false);
      }
    };

    init();
  }, [addToast, authUser, authIsAuthenticated]);

  // Restore Case Context when ID changes
  useEffect(() => {
    if (selectedCaseId) {
      const loadCase = async () => {
        try {
          const found = await DataService.cases.getById(selectedCaseId);
          if (found) setSelectedCase(found);
          else {
            setSelectedCaseId(null);
            addToast("Case not found or access denied.", "warning");
          }
        } catch (e) {
          console.error("Failed to restore case context", e);
        }
      };
      loadCase();
    } else {
      setSelectedCase(null);
    }
  }, [selectedCaseId, setSelectedCaseId, addToast]);

  // ==========================================================================
  // CALLBACK HANDLERS
  // ==========================================================================

  const handleSelectCaseById = useCallback(
    (caseId: string) => {
      startTransition(async () => {
        const found = await DataService.cases.getById(caseId);
        if (found) {
          setSelectedCase(found);
          setSelectedCaseId(caseId);
          setInitialTab(undefined);
          setActiveView(PATHS.CASES);
          addToast(`Context switched to ${found.title}`, "info");
        }
      });
    },
    [setSelectedCaseId, addToast, setActiveView]
  );

  // Removed unused handleSelectCase - can be re-added if needed

  const handleNavigation = useCallback(
    (view: AppView) => {
      startTransition(() => {
        // Always clear case selection when navigating, including to Cases view
        // This allows users to return to the case list by clicking Cases in sidebar
        setSelectedCase(null);
        setSelectedCaseId(null);
        setActiveView(view);
        setInitialTab(undefined);
        setIsSidebarOpen(false);
      });
    },
    [setActiveView, setSelectedCaseId]
  );

  const navigateToCaseTab = useCallback(
    (caseId: string, tab: string) => {
      startTransition(async () => {
        const found = await DataService.cases.getById(caseId);
        if (found) {
          setInitialTab(tab);
          setSelectedCase(found);
          setSelectedCaseId(caseId);
          setActiveView(PATHS.CASES);
        }
      });
    },
    [setSelectedCaseId, setActiveView]
  );

  // Removed unused handlers - can be re-added to interface if needed
  // const handleSearchResultClick = useCallback((result: GlobalSearchResult) => { ... });
  // const handleNeuralCommand = useCallback((intent: IntentResult) => { ... });

  const handleSwitchUser = useCallback(() => {
    startTransition(() => {
      if (users.length > 0) {
        setCurrentUserIndex((prev) => (prev + 1) % users.length);
        addToast(`Switched user profile`, "info");
      }
    });
  }, [addToast, users]);

  const handleBackToMain = useCallback(() => {
    startTransition(() => {
      setSelectedCase(null);
      setSelectedCaseId(null);
      setInitialTab(undefined);
      // Return to Cases list instead of Dashboard for better UX
      setActiveView(PATHS.CASES);
    });
  }, [setSelectedCaseId, setActiveView]);

  // Removed unused focusSearch - can be re-added to interface if needed

  return {
    activeView,
    navigateToView: handleNavigation,
    selectedCaseId,
    selectedCase,
    selectCase: (caseId: string | null, tab?: string) => {
      if (caseId) {
        if (tab) {
          navigateToCaseTab(caseId, tab);
        } else {
          handleSelectCaseById(caseId);
        }
      } else {
        handleBackToMain();
      }
    },
    currentUser,
    switchUser: handleSwitchUser,
    isSidebarOpen,
    toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
    globalSearch,
    updateSearch: () => {}, // Not implemented in current version
    isAppLoading,
    isAuthenticated,
    appStatusMessage,
    initialTab,
  };
}
