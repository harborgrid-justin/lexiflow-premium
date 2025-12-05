
import React, { useState, useCallback, Suspense, useTransition, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { AppShell } from './layout/AppShell';
import { AppHeader } from './layout/AppHeader';
import { Case, AppView } from '../types';
import { HelpCircle, Lock, Loader2 } from 'lucide-react';
import { MOCK_USERS } from '../data/models/user';
import { LazyLoader } from './common/LazyLoader';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { WindowProvider } from '../context/WindowContext';
import { SyncProvider } from '../context/SyncContext';
import { HolographicDock } from './layout/HolographicDock';
import { PATHS } from '../constants/paths';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { DataService } from '../services/dataService';
import { GlobalSearchResult } from '../services/searchService';
import { IntentResult } from '../services/geminiService';
import { ErrorBoundary } from './common/ErrorBoundary';
import { db } from '../services/db';
import { GlobalHotkeys } from './common/GlobalHotkeys';

// DYNAMIC IMPORT CONFIG
import { initializeModules } from '../config/modules';
import { ModuleRegistry } from '../services/moduleRegistry';
import { HolographicRouting } from '../services/holographicRouting';

// Lazy Loaded Core Case Detail (Special Route)
const CaseDetail = React.lazy(() => import('./case-detail/CaseDetail').then(m => ({ default: m.CaseDetail as React.ComponentType<any> })));

// Initialize Registry immediately
initializeModules();

// Inner App Component to access Context
const InnerApp: React.FC = () => {
  const [activeView, setActiveView] = useSessionStorage<AppView>('lexiflow_active_view', PATHS.DASHBOARD);
  const [selectedCaseId, setSelectedCaseId] = useSessionStorage<string | null>('lexiflow_selected_case_id', '1:24-cv-01442-LMB-IDD');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const { addToast } = useToast();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  
  // Ref to focus search input on hotkey
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Holographic Routing State
  const [initialTab, setInitialTab] = useState<string | undefined>(undefined);

  const currentUser = MOCK_USERS[currentUserIndex];

  // Load case data on mount if ID exists in storage
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
    }
  }, [selectedCaseId]);

  // --- NAVIGATION HANDLERS ---

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
        handleSelectCase(result.data);
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

  // --- AI NEURAL INTERFACE ---
  const handleNeuralCommand = useCallback((intent: IntentResult) => {
    console.log("Processing Neural Intent:", intent);
    startTransition(() => {
      // 1. Module Navigation
      if (intent.action === 'NAVIGATE' && intent.targetModule) {
        const moduleId = ModuleRegistry.resolveIntent(intent.targetModule.toLowerCase());
        
        if (moduleId) {
            // HOLOGRAPHIC ROUTING ENGINE
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
      
      // 2. Entity Resolution (Cases/Clients)
      if ((intent.action === 'NAVIGATE' || intent.action === 'SEARCH') && intent.entityId) {
          handleSelectCaseById(intent.entityId);
      }
      
      // 3. Action Creation (Drafting, Tasks)
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

  // --- DYNAMIC RENDERER ---
  const renderContent = () => {
    if (selectedCase) {
        return (
            <Suspense fallback={<LazyLoader message="Loading Case Context..." />}>
                <CaseDetail 
                  caseData={selectedCase} 
                  onBack={handleBackToMain} 
                  onSelectCase={handleSelectCase}
                  initialTab={initialTab} 
                />
            </Suspense>
        );
    }
    
    const moduleDef = ModuleRegistry.getModule(activeView);

    if (moduleDef) {
        if (moduleDef.requiresAdmin && currentUser.role !== 'Administrator' && currentUser.role !== 'Senior Partner') {
             return (
                <div className="flex flex-col justify-center items-center h-full text-slate-500 animate-fade-in">
                    <div className="bg-red-50 p-6 rounded-full mb-4 border border-red-100">
                        <Lock className="h-12 w-12 text-red-500"/>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
                    <p className="text-sm mt-2 max-w-md text-center text-slate-600">
                        You do not have permission to view the <strong>{moduleDef.label}</strong> module. 
                        Please contact your system administrator.
                    </p>
                </div>
            );
        }

        const Component = moduleDef.component;
        const dynamicProps: any = {};
        
        // Inject Holographic Route
        if (initialTab) {
            dynamicProps.initialTab = initialTab;
        }
        
        if (activeView === PATHS.CASES) {
            dynamicProps.onSelectCase = handleSelectCase;
        } else if (([PATHS.DASHBOARD, PATHS.WORKFLOWS, PATHS.EVIDENCE, PATHS.EXHIBITS] as string[]).includes(activeView)) {
            dynamicProps.onSelectCase = handleSelectCaseById;
            dynamicProps.onNavigateToCase = handleSelectCaseById; 
        }
        
        if (activeView === PATHS.BILLING) {
            dynamicProps.navigateTo = (v: string) => startTransition(() => setActiveView(v));
        }
        
        if (activeView === PATHS.DOCUMENTS || activeView === PATHS.JURISDICTION) {
            dynamicProps.currentUser = currentUser;
            dynamicProps.currentUserRole = currentUser.role;
        }

        return (
            <Suspense fallback={<LazyLoader message={`Loading ${moduleDef.label}...`} />}>
                <Component {...dynamicProps} />
            </Suspense>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center h-full text-slate-400">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
                <HelpCircle className="h-10 w-10 text-slate-300"/>
            </div>
            <p className="text-xl font-semibold">Module Not Found</p>
            <p className="text-sm mt-2">The requested module <span className="font-mono bg-slate-100 px-1 rounded text-slate-600">"{activeView}"</span> is not registered in the dynamic runtime.</p>
        </div>
    );
  };

  // Pass focus trigger to header
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
                isOpen={false} 
                onClose={() => {}}
                currentUser={currentUser} 
                onSwitchUser={handleSwitchUser} 
            />
        }
        headerContent={
            <AppHeader 
                onToggleSidebar={() => {}}
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
            {renderContent()}
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
            <div className="flex items-center justify-center h-screen bg-slate-50">
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
