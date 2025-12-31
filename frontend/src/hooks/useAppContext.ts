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
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { isBackendApiEnabled } from '@/api';
import { DataService } from '@/services/data/dataService';
import { apiClient } from '@/services/infrastructure/apiClient';

// Hooks & Context
import { useToast } from '@/providers';
import { useUsers } from './useDomainData';
import { useSessionStorage } from './useSessionStorage';

// Utils & Constants
import { PATHS } from '@/config/paths.config';

// Types
import { AppView, Case, User } from '@/types';

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
  const [activeView, setActiveView] = useSessionStorage<AppView>(`lexiflow_active_view`, PATHS.DASHBOARD);
  const [selectedCaseId, setSelectedCaseId] = useSessionStorage<string | null>(`lexiflow_selected_case_id`, null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const { addToast } = useToast();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [globalSearch] = useState('');
  const [, startTransition] = useTransition();

  const [initialTab, setInitialTab] = useState<string | undefined>(undefined);

  // App Initialization State
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appStatusMessage, setAppStatusMessage] = useState('Initializing Secure Data Layer...');

  // Strict Mode readiness: Prevent double-initialization (Principle #7)
  // Critical for preventing duplicate API calls and race conditions
  const isInitialized = useRef(false);

  // Domain Data
  const { data: users = [] } = useUsers();

  const currentUser = users[currentUserIndex] || {
    id: 'temp-user',
    email: 'loading@lexiflow.com',
    firstName: 'Loading',
    lastName: 'User',
    role: 'user' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

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
            console.log('[useAppController] Starting initialization...');
            const backendApiEnabled = isBackendApiEnabled();

            if (backendApiEnabled) {
                setAppStatusMessage('Connecting to backend API...');

                // 1. Check Health First
                try {
                    await apiClient.healthCheck();
                } catch (healthError) {
                    console.error("Backend health check failed:", healthError);
                    setAppStatusMessage('Backend not reachable. Switching to local mode.');
                    // Use VITE_USE_INDEXEDDB to signal local mode (respected by apiConfig.ts)
                    localStorage.setItem('VITE_USE_INDEXEDDB', 'true');
                    window.location.reload();
                    return;
                }

                // 2. Authenticate
                try {
                    const existingToken = apiClient.getAuthToken();
                    if (!existingToken) {
                        setAppStatusMessage('Authenticating...');
                        // Auto-login logic (Dev Mode)
                        const loginResponse = await apiClient.post<{ accessToken?: string; refreshToken?: string; data?: { accessToken?: string; refreshToken?: string } }>('/auth/login', {
                            email: 'admin@lexiflow.com',
                            password: 'Password123!'
                        });

                        // Handle wrapped response format (common in NestJS with interceptors)
                        const accessToken = loginResponse?.accessToken || loginResponse?.data?.accessToken;
                        const refreshToken = loginResponse?.refreshToken || loginResponse?.data?.refreshToken;

                        // Validate response before setting tokens
                        if (accessToken) {
                            apiClient.setAuthTokens(accessToken, refreshToken);
                            setIsAuthenticated(true);
                            console.log('✅ Auto-login successful');
                        } else {
                            console.error('❌ Auto-login failed: Invalid response format', loginResponse);
                            throw new Error('Invalid login response');
                        }
                    } else {
                        setIsAuthenticated(true);
                    }
                    setIsAppLoading(false);
                } catch (authError) {
                    console.error("Authentication failed:", authError);
                    setAppStatusMessage('Authentication failed. Please check backend logs.');
                    // Do NOT reload here - let the user see the error
                    setIsAppLoading(false);
                }
            } else {
                // IndexedDB mode (DEPRECATED - for development only)
                console.warn('IndexedDB mode is deprecated. Please use backend API.');
                // IndexedDB fallback for offline support
                setIsAppLoading(false);

                // Check if data exists via backend API
                try {
                    const casesCount = await DataService.cases.getAll().then((cases: Case[]) => cases.length);
                    if (casesCount === 0) {
                        addToast('No data found. Backend seeding may be required.', 'info');
                    }
                } catch (e) {
                    console.error("Failed to check for existing data", e);
                    addToast('Unable to connect to backend API', 'error');
                }
            }
        } catch (e) {
            console.error("Initialization failed:", e);
            setAppStatusMessage('Error initializing application.');
            setIsAppLoading(false);
        }
    };

    init();
  }, [addToast]);

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

  const handleSelectCaseById = useCallback((caseId: string) => {
    startTransition(async () => {
        const found = await DataService.cases.getById(caseId);
        if (found) {
            setSelectedCase(found);
            setSelectedCaseId(caseId);
            setInitialTab(undefined);
            setActiveView(PATHS.CASES);
            addToast(`Context switched to ${found.title}`, 'info');
        }
    });
  }, [setSelectedCaseId, addToast, setActiveView]);

  // Removed unused handleSelectCase - can be re-added if needed

  const handleNavigation = useCallback((view: AppView) => {
      startTransition(() => {
          // Always clear case selection when navigating, including to Cases view
          // This allows users to return to the case list by clicking Cases in sidebar
          setSelectedCase(null);
          setSelectedCaseId(null);
          setActiveView(view);
          setInitialTab(undefined);
          setIsSidebarOpen(false);
      });
  }, [setActiveView, setSelectedCaseId]);

  const navigateToCaseTab = useCallback((caseId: string, tab: string) => {
    startTransition(async () => {
        const found = await DataService.cases.getById(caseId);
        if (found) {
            setInitialTab(tab);
            setSelectedCase(found);
            setSelectedCaseId(caseId);
            setActiveView(PATHS.CASES);
        }
    });
  }, [setSelectedCaseId, setActiveView]);

  // Removed unused handlers - can be re-added to interface if needed
  // const handleSearchResultClick = useCallback((result: GlobalSearchResult) => { ... });
  // const handleNeuralCommand = useCallback((intent: IntentResult) => { ... });

  const handleSwitchUser = useCallback(() => {
    startTransition(() => {
        if (users.length > 0) {
            setCurrentUserIndex((prev) => (prev + 1) % users.length);
            addToast(`Switched user profile`, 'info');
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
    initialTab
  };
};
