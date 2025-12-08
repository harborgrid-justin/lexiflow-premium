

import React, { useState, useCallback, useEffect, useTransition } from 'react';
import { Sidebar } from './components/Sidebar';
import { AppShell } from './components/layout/AppShell';
import { AppHeader } from './components/layout/AppHeader';
import { AppView, User, Case } from './types';
import { MOCK_USERS } from './data/models/user';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { WindowProvider } from './context/WindowContext';
import { SyncProvider } from './context/SyncContext';
import { HolographicDock } from './components/layout/HolographicDock';
import { PATHS } from './constants/paths';
import { useSessionStorage } from './hooks/useSessionStorage';
import { DataService } from './services/dataService';
import { GlobalSearchResult } from './services/searchService';
import { IntentResult } from './services/geminiService';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { db } from './services/db';
import { GlobalHotkeys } from './components/common/GlobalHotkeys';
import { AppContentRenderer } from './components/layout/AppContentRenderer';
import { Loader2 } from 'lucide-react';
import { initializeModules } from './config/modules';
import { ModuleRegistry } from './services/moduleRegistry';
import { HolographicRouting } from './services/holographicRouting';

// Initialize Registry
initializeModules();

const InnerApp: React.FC = () => {
  const [activeView, setActiveView] = useSessionStorage<AppView>(`lexiflow_active_view`, PATHS.DASHBOARD);
  const [selectedCaseId, setSelectedCaseId] = useSessionStorage<string | null>(`lexiflow_selected_case_id`, null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const { addToast } = useToast();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [globalSearch, setGlobalSearch] = useState('');
  const [, startTransition] = useTransition();

  const [initialTab, setInitialTab] = useState<string | undefined>(undefined);

  const currentUser: User = MOCK_USERS[currentUserIndex];

  useEffect(() => {
    if (selectedCaseId) {
        const loadCase = async () => {
            try {
              const found = await DataService.cases.getById(selectedCaseId);
              if (found) {
                setSelectedCase(found);
              } else {
                setSelectedCaseId(null);
              }
            } catch (e) {
              console.error("Failed to restore case context", e);
            }
        };
        loadCase();
    } else {
      setSelectedCase(null);
    }
  }, [selectedCaseId, setSelectedCaseId]);

  const handleSelectCaseById = useCallback((caseId: string) => {
    startTransition(async () => {
        const found = await DataService.cases.getById(caseId);
        if (found) {
            setSelectedCase(found);
            setSelectedCaseId(caseId);
            setInitialTab(undefined); 
            addToast(`Context switched to ${found.title}`, 'info');
        } else {
            addToast(`Case ${caseId} not found`, 'error');
        }
    });
  }, [setSelectedCaseId, addToast]);
  
  const handleSelectCase = useCallback((c: Case) => {
    if (!c) return;
    startTransition(() => {
      setSelectedCase(c);
      setSelectedCaseId(c.id);
      setInitialTab(undefined);
    });
  }, [setSelectedCaseId]);

  const handleNavigation = useCallback((view: string) => {
      startTransition(() => {
          setActiveView(view);
          setSelectedCase(null);
          setSelectedCaseId(null);
          setInitialTab(undefined);
          setIsSidebarOpen(false);
      });
  }, [setActiveView, setSelectedCaseId]);

  const handleSearchResultClick = useCallback((result: GlobalSearchResult) => {
    startTransition(() => {
      if (result.type === 'case') {
        handleSelectCase(result.data as Case);
      } else if (result.type === 'client') {
        setActiveView(PATHS.CRM);
        setSelectedCase(null);
        setSelectedCaseId(null);
        setInitialTab('directory');
      } else if (result.type === 'task') {
        setActiveView(PATHS.WORKFLOWS);
        setSelectedCase(null);
        setSelectedCaseId(null);
      } else if (result.type === 'evidence') {
          setActiveView(PATHS.EVIDENCE);
          setSelectedCase(null);
          setSelectedCaseId(null);
          setInitialTab('inventory');
      }
      setIsSidebarOpen(false);
    });
  }, [handleSelectCase, setActiveView, setSelectedCaseId]);

  const handleNeuralCommand = useCallback((intent: IntentResult) => {
    startTransition(() => {
      if (intent.action === 'NAVIGATE' && intent.targetModule) {
        const moduleId = ModuleRegistry.resolveIntent(intent.targetModule.toLowerCase());
        
        if (moduleId) {
            const deepLinkTab = HolographicRouting.resolveTab(moduleId, intent.context);
            setInitialTab(deepLinkTab);
            setActiveView(moduleId);
            if (!['cases', 'documents', 'docket'].includes(moduleId)) {
                setSelectedCase(null);
                setSelectedCaseId(null);
            }
            const destName = deepLinkTab ? `${intent.targetModule} / ${deepLinkTab}` : intent.targetModule;
            addToast(`Navigating to ${destName}...`, 'info');
        } else {
            const route = Object.values(PATHS).find(p => p === intent.targetModule?.toLowerCase());
            if (route) {
                setActiveView(route);
                addToast(`Navigating to ${intent.targetModule}...`, 'info');
            }
        }
      }
      
      if ((intent.action === 'NAVIGATE' || intent.action === 'SEARCH') && intent.entityId) {
          handleSelectCaseById(intent.entityId);
      }
      
      if (intent.action === 'CREATE' && intent.context) {
          if (intent.context.toLowerCase().includes('motion') || intent.context.toLowerCase().includes('draft')) {
             if (selectedCase) {
                 setInitialTab('Drafting');
                 addToast('Opening Drafting Tools...', 'success');
             } else {
                 setActiveView(PATHS.CASES);
                 addToast('Please select a case first to start drafting.', 'warning');
             }
          }
      }
    });
  }, [addToast, handleSelectCaseById, selectedCase, setActiveView, setSelectedCaseId]);

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearch) {
        setGlobalSearch('');
    }
  };

  const handleSwitchUser = useCallback(() => {
    startTransition(() => {
        setCurrentUserIndex((prev) => (prev + 1) % MOCK_USERS.length);
        addToast(`Switched user profile`, 'info');
    });
  }, [addToast]);

  const handleBackToMain = useCallback(() => {
      startTransition(() => {
          setSelectedCase(null);
          setSelectedCaseId(null);
          setInitialTab(undefined);
      });
  }, [setSelectedCaseId]);

  const focusSearch = useCallback(() => {
      const input = document.querySelector('input[placeholder*="Search or type a command"]');
      if (input) (input as HTMLElement).focus();
  }, []);

  return (
    <AppShell
        activeView={selectedCase ? PATHS.CASES : activeView}
        onNavigate={handleNavigation}
        selectedCaseId={selectedCaseId}
        sidebar={
            <Sidebar 
                activeView={selectedCase ? PATHS.CASES : activeView} 
                setActiveView={handleNavigation} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)}
                currentUser={currentUser} 
                onSwitchUser={handleSwitchUser} 
            />
        }
        headerContent={
            <AppHeader 
                onToggleSidebar={() => setIsSidebarOpen(true)}
                globalSearch={globalSearch}
                setGlobalSearch={setGlobalSearch}
                onGlobalSearch={handleGlobalSearch}
                currentUser={currentUser}
                onSwitchUser={handleSwitchUser}
                onSearchResultClick={handleSearchResultClick}
                onNeuralCommand={handleNeuralCommand}
            />
        }
    >
        <GlobalHotkeys onToggleCommand={focusSearch} onNavigate={handleNavigation} />
        <ErrorBoundary>
            <AppContentRenderer 
                activeView={activeView}
                currentUser={currentUser}
                selectedCase={selectedCase}
                handleSelectCase={handleSelectCase}
                handleSelectCaseById={handleSelectCaseById}
                handleBackToMain={handleBackToMain}
                setActiveView={setActiveView}
                initialTab={initialTab}
            />
            <HolographicDock />
        </ErrorBoundary>
    </AppShell>
  );
};

const App: React.FC = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                await db.seedData();
            } catch (e) {
                console.error("Failed to seed database:", e);
            } finally {
                setIsReady(true);
            }
        };
        init();
    }, []);

    if (!isReady) {
        return (
            <div className="flex items-center justify-center h-[100dvh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin h-10 w-10 text-blue-600"/>
                    <p className="text-sm font-medium text-slate-500 animate-pulse">Initializing Secure Data Layer...</p>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <ErrorBoundary>
                <ToastProvider>
                    <SyncProvider>
                        <WindowProvider>
                            <InnerApp />
                        </WindowProvider>
                    </SyncProvider>
                </ToastProvider>
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;
