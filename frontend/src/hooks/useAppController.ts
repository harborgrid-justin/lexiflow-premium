/**
 * @module hooks/useAppController
 * @category Hooks - Application
 * @description Main application controller hook managing navigation, case selection, user context, global search,
 * sidebar state, and app initialization. 
 * * NO THEME USAGE: Application-level state management hook
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useCallback, useEffect, useTransition, useRef } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../services/data/dataService';
import { ModuleRegistry } from '../services/infrastructure/moduleRegistry';
import { HolographicRouting } from '../services/infrastructure/holographicRouting';
import { queryKeys } from '../utils/queryKeys';
import { Seeder } from '../services/data/dbSeeder';
import { queryClient } from '../services/infrastructure/queryClient';
import { GlobalSearchResult } from '../services/search/searchService';
import { IntentResult } from '../services/features/research/geminiService';
import { apiClient } from '../services/infrastructure/apiClient';
import { isBackendApiEnabled } from '../services/api';

// Hooks & Context
import { useSessionStorage } from './useSessionStorage';
import { useToast } from '../context/ToastContext';
import { useUsers } from './useDomainData';

// Utils & Constants
import { PATHS } from '../config/paths.config';

// Types
import { Case, AppView } from '../types';

// ============================================================================
// HOOK
// ============================================================================
export const useAppController = () => {
  const [activeView, setActiveView] = useSessionStorage<AppView>(`lexiflow_active_view`, PATHS.DASHBOARD);
  const [selectedCaseId, setSelectedCaseId] = useSessionStorage<string | null>(`lexiflow_selected_case_id`, null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const { addToast } = useToast();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [globalSearch, setGlobalSearch] = useState('');
  const [, startTransition] = useTransition();

  const [initialTab, setInitialTab] = useState<string | undefined>(undefined);
  
  // App Initialization State
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appStatusMessage, setAppStatusMessage] = useState('Initializing Secure Data Layer...');

  // CRITICAL: Prevent double-initialization in React 18 Strict Mode
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
  useEffect(() => {
    // If we've already started or finished init, skip the second execution
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
        try {
            console.log('[useAppController] Starting initialization...');
            const backendApiEnabled = isBackendApiEnabled();
            
            if (backendApiEnabled) {
                setAppStatusMessage('Connecting to backend API...');
                try {
                    await apiClient.healthCheck();
                    
                    const existingToken = apiClient.getAuthToken();
                    if (!existingToken) {
                        setAppStatusMessage('Authenticating...');
                        // Auto-login logic (Dev Mode)
                        const loginResponse = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/login', {
                            email: 'admin@lexiflow.com',
                            password: 'Password123!'
                        });
                        apiClient.setAuthTokens(loginResponse.accessToken, loginResponse.refreshToken);
                        setIsAuthenticated(true);
                        console.log('✅ Auto-login successful');
                    } else {
                        setIsAuthenticated(true);
                    }
                    setIsAppLoading(false);
                } catch (apiError) {
                    console.error("Backend API error:", apiError);
                    setAppStatusMessage('Backend not available. Switching to local mode.');
                    localStorage.setItem('VITE_USE_BACKEND_API', 'false');
                    window.location.reload();
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
  
  const handleSelectCase = useCallback((c: Case) => {
    if (!c) return;
    startTransition(() => {
      setSelectedCase(c);
      setSelectedCaseId(c.id);
      setActiveView(PATHS.CASES);
      setInitialTab(undefined);
    });
  }, [setSelectedCaseId, setActiveView]);

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

  const handleSearchResultClick = useCallback((result: GlobalSearchResult) => {
    startTransition(() => {
      if (result.type === 'case') {
        handleSelectCase(result.data as Case);
      } else {
        const targetModule = ModuleRegistry.getAllModules().find(m => m.id.includes(result.type))?.id || PATHS.DASHBOARD;
        handleNavigation(targetModule);
      }
      setIsSidebarOpen(false);
    });
  }, [handleSelectCase, handleNavigation]);

  const handleNeuralCommand = useCallback((intent: IntentResult) => {
    startTransition(() => {
      if (intent.action === 'NAVIGATE' && intent.targetModule) {
        const moduleId = ModuleRegistry.resolveIntent(intent.targetModule.toLowerCase());
        if (moduleId) {
            const deepLinkTab = HolographicRouting.resolveTab(moduleId, intent.context);
            setInitialTab(deepLinkTab);
            handleNavigation(moduleId);
        }
      }
      if ((intent.action === 'NAVIGATE' || intent.action === 'SEARCH') && intent.entityId) {
          handleSelectCaseById(intent.entityId);
      }
    });
  }, [handleSelectCaseById, handleNavigation]);

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

  const focusSearch = useCallback(() => {
      const input = document.querySelector('input[placeholder*="Search or type a command"]');
      if (input) (input as HTMLElement).focus();
  }, []);

  return {
    activeView,
    selectedCase,
    isSidebarOpen,
    setIsSidebarOpen,
    currentUser,
    globalSearch,
    setGlobalSearch,
    handleNavigation,
    handleSelectCase,
    handleSelectCaseById,
    navigateToCaseTab,
    handleBackToMain,
    handleSearchResultClick,
    handleNeuralCommand,
    handleSwitchUser,
    focusSearch,
    initialTab,
    isAppLoading,
    appStatusMessage,
    isAuthenticated
  };
};
