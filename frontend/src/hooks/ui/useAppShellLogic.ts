import { useAuthState } from "@/contexts/auth/AuthProvider";
import { useAppContext } from "@/hooks/useAppContext";
import { useAutoTimeCapture } from "@/hooks/useAutoTimeCapture";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";
import { useGlobalQueryStatus } from "@/hooks/useGlobalQueryStatus";
import type { GlobalSearchResult } from "@/services/search/search.service";
import type { IntentResult } from "@/types/intelligence";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router";

/**
 * Controller hook for the main AppShell layout.
 * Encapsulates all navigation, search handling, neural commands, synchronization, and initialization logic.
 */
export function useAppShellLogic() {
  // React Router hooks
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { caseId } = useParams();

  // Auth state
  const { isLoading: authIsLoading } = useAuthState();

  // App context provides global state
  const {
    activeView,
    isSidebarOpen,
    toggleSidebar,
    isAppLoading,
    appStatusMessage,
    selectedCaseId,
    currentUser,
  } = useAppContext();

  // Global Query Status (Networking)
  const { isFetching: isQueryFetching } = useGlobalQueryStatus();

  // Breadcrumbs
  const breadcrumbs = useBreadcrumbs();

  // Auto Time Capture
  const { activeTime, isIdle } = useAutoTimeCapture(activeView, selectedCaseId || null);

  // Memoized handlers to prevent unnecessary re-renders
  const handleNavigate = useCallback(
    (view: string) => {
      navigate(`/${view}`);
    },
    [navigate]
  );

  const handleSearchResultClick = useCallback(
    (result: GlobalSearchResult) => {
      // Navigate to the case detail page
      navigate(`/cases/${result.id}`);
    },
    [navigate]
  );

  const handleNeuralCommand = useCallback(
    (intent: IntentResult) => {
      console.log("Neural command:", intent);

      if (intent.confidence < 0.7) {
        return;
      }

      switch (intent.action) {
        case "NAVIGATE":
          if (intent.targetModule) {
            navigate(`/${intent.targetModule.toLowerCase()}`);
          }
          break;
        case "CREATE":
          if (intent.targetModule === "Case") {
            navigate("/cases/new");
          } else if (intent.targetModule === "Document") {
            navigate("/documents/upload");
          }
          break;
        case "SEARCH":
          if (intent.context) {
            // Navigate to search with query parameter
            navigate(`/search?q=${encodeURIComponent(intent.context)}`);
          }
          break;
      }
    },
    [navigate]
  );

  const handleGlobalSearch = useCallback((query: string) => {
    // Placeholder for global search logic if not handled by Neural Command
    console.log("Search query:", query);
  }, []);

  return {
    state: {
      isAuthLoading: authIsLoading,
      activeView: activeView, // Managed by useAppContext
      isSidebarOpen,
      selectedCaseId: selectedCaseId || null,
      isAppLoading,
      appStatusMessage,
      currentUser,
      isQueryFetching,
      breadcrumbs,
      timeTracker: {
        activeTime,
        isIdle,
      },
    },
    handlers: {
      handleNavigate,
      handleNeuralCommand,
      handleSearchResultClick,
      handleGlobalSearch,
      handleToggleSidebar: toggleSidebar,
    },
    derived: {
      currentYear: new Date().getFullYear(),
      selectedCaseId: selectedCaseId || null,
    },
  };
}
