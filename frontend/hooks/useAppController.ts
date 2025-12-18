/**
 * @module hooks/useAppController
 * @category Hooks - Application
 * @description Main application controller hook managing navigation, case selection, user context, global search,
 * sidebar state, and app initialization. Handles DB initialization with background seeding, case context
 * restoration from session storage, neural command execution, global search with AI intent parsing,
 * holographic window management, and view navigation with deep linking support.
 * 
 * NO THEME USAGE: Application-level state management hook
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useCallback, useEffect, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../services/data/dataService';
import { ModuleRegistry } from '../services/infrastructure/moduleRegistry';
import { HolographicRouting } from '../services/infrastructure/holographicRouting';
import { db, STORES } from '../services/data/db';
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
  const [appStatusMessage, setAppStatusMessage] = useState('Initializing Secure Data Layer...');

  const { data: users = [] } = useUsers();
  const currentUser = users[currentUserIndex];

  useEffect(() => {
    const init = async () => {
        try {
            const backendApiEnabled = isBackendApiEnabled();
            
            if (backendApiEnabled) {
                // Backend API mode - check if backend is available
                setAppStatusMessage('Connecting to backend API...');
                try {
                    await apiClient.healthCheck();
                    setAppStatusMessage('Backend API connected successfully');
                    setIsAppLoading(false);
                } catch (apiError) {
                    console.error("Backend API not available:", apiError);
                    setAppStatusMessage('Backend API not available. Please start the backend server.');
                    setIsAppLoading(false);
                    addToast('Backend API not available. Switching to offline mode.', 'warning');
                    // Optionally switch back to IndexedDB mode
                    localStorage.setItem('VITE_USE_BACKEND_API', 'false');
                }
            } else {
                // IndexedDB mode - initialize local database
                await db.init();
                
                // The app is interactive once the DB connection is established.
                // Hide the main loading screen immediately.
                setIsAppLoading(false);
                
                // Check if we need to seed data in the background.
                const count = await db.count(STORES.CASES);
                if (count === 0) {
                    addToast('Setting up for first-time use. Data will appear shortly.', 'info');
                    // Run the seeder, but don't await it.
                    Seeder.seed(db).then(() => {
                        addToast('Initial data loaded successfully!', 'success');
                        // Invalidate all queries to trigger a UI refresh with the new data.
                        queryClient.invalidate(''); 
                    }).catch((e) => {
                        console.error("Background seeding failed", e);
                        addToast('Failed to load initial data. Please refresh.', 'error');
                    });
                }
            }
        } catch (e) {
            console.error("Failed to initialize application:", e);
            setAppStatusMessage('Error initializing application.');
            // Ensure the loading screen is hidden even on error.
            setIsAppLoading(false); 
        }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              addToast("Error restoring case context.", "error");
            }
        };
        loadCase();
    } else {
      setSelectedCase(null);
    }
  }, [selectedCaseId, addToast, setSelectedCaseId]);

  const handleSelectCaseById = useCallback((caseId: string) => {
    startTransition(async () => {
        const found = await DataService.cases.getById(caseId);
        if (found) {
            setSelectedCase(found);
            setSelectedCaseId(caseId);
            setInitialTab(undefined); 
            setActiveView(PATHS.CASES);
            addToast(`Context switched to ${found.title}`, 'info');
        } else {
            addToast(`Case ${caseId} not found`, 'error');
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
          if (view !== PATHS.CASES) {
             setSelectedCase(null);
             setSelectedCaseId(null);
          }
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
            addToast(`Opening ${found.title} > ${tab}`, 'info');
        } else {
            addToast(`Case ${caseId} not found`, 'error');
        }
    });
  }, [setSelectedCaseId, addToast, setActiveView]);

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
            const destName = deepLinkTab ? `${intent.targetModule} / ${deepLinkTab}` : intent.targetModule;
            addToast(`Navigating to ${destName}...`, 'info');
        }
      }
      
      if ((intent.action === 'NAVIGATE' || intent.action === 'SEARCH') && intent.entityId) {
          handleSelectCaseById(intent.entityId);
      }
      
      if (intent.action === 'CREATE' && intent.context) {
          if (selectedCase) {
             setInitialTab('Drafting');
             addToast('Opening Drafting Tools...', 'success');
          } else {
             handleNavigation(PATHS.CASES);
             addToast('Please select a case first to start drafting.', 'warning');
          }
      }
    });
  }, [addToast, handleSelectCaseById, selectedCase, handleNavigation]);

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
          setActiveView(PATHS.DASHBOARD);
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
  };
};

