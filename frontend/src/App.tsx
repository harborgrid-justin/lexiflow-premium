import React, { useEffect } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar/Sidebar';
import { AppShell } from '@/components/ui/layouts/AppShell/AppShell';
import { AppHeader } from '@/components/organisms/AppHeader/AppHeader';
import { 
  ThemeProvider, 
  ToastProvider, 
  WindowProvider, 
  SyncProvider, 
  DataSourceProvider 
} from '@/providers';
import { HolographicDock } from '@/components/organisms/HolographicDock/HolographicDock';
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary/ErrorBoundary';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { initializeModules } from '@/config';
import { AppContentRenderer } from '@/components/ui/layouts/AppContentRenderer/AppContentRenderer';
import { GlobalHotkeys } from '@/components/organisms/GlobalHotkeys/GlobalHotkeys';
import { useAppController } from '@/hooks';
import { useDataServiceCleanup } from './hooks/useDataServiceCleanup';
import { backendDiscovery } from '@/services';
import { IntegrationOrchestrator } from '@/services/integration/integrationOrchestrator';

// Initialize Module Registry
initializeModules();

// Initialize Integration Orchestrator
IntegrationOrchestrator.initialize();

const InnerApp: React.FC = () => {
  const {
    activeView,
    selectedCase,
    isSidebarOpen,
    toggleSidebar,
    currentUser,
    globalSearch,
    updateSearch,
    navigateToView,
    selectCase,
    switchUser,
    initialTab,
    isAppLoading,
    appStatusMessage,
  } = useAppController();

  // Create wrapper functions to match expected signatures
  const handleSwitchUser = () => switchUser(0); // Switch to first user by default
  const handleSelectCaseFromObject = (c: Case) => selectCase(c.id);
  const handleSelectCaseById = (id: string) => selectCase(id);

  if (isAppLoading || !currentUser) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <LazyLoader message={appStatusMessage} />
      </div>
    );
  }

  return (
    <AppShell
      activeView={activeView}
      onNavigate={navigateToView}
      selectedCaseId={selectedCase?.id || null}
      sidebar={
        <ErrorBoundary scope="Sidebar">
          <Sidebar
            activeView={selectedCase ? 'cases' : activeView}
            setActiveView={navigateToView}
            isOpen={isSidebarOpen}
            onClose={() => toggleSidebar()}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
          />
        </ErrorBoundary>
      }
      headerContent={
        <ErrorBoundary scope="Header">
          <AppHeader
            onToggleSidebar={() => toggleSidebar()}
            globalSearch={globalSearch}
            setGlobalSearch={updateSearch}
            onGlobalSearch={() => {}}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onSearchResultClick={(result: any) => selectCase(result.id)}
            onNeuralCommand={(cmd: any) => console.log('Neural command:', cmd)}
          />
        </ErrorBoundary>
      }
    >
      <GlobalHotkeys onToggleCommand={() => updateSearch('')} onNavigate={navigateToView} />
      <ErrorBoundary scope="MainContent" onReset={() => navigateToView('dashboard')}>
        <AppContentRenderer
          activeView={activeView}
          currentUser={currentUser}
          selectedCase={selectedCase}
          handleSelectCase={handleSelectCaseFromObject}
          handleSelectCaseById={handleSelectCaseById}
          navigateToCaseTab={(caseId: string, tab: string) => selectCase(caseId, tab)}
          handleBackToMain={() => navigateToView('dashboard')}
          setActiveView={navigateToView}
          initialTab={initialTab}
        />
      </ErrorBoundary>
      <HolographicDock />
    </AppShell>
  );
};

const App: React.FC = () => {
  // Use Vite built-in env flags
  useDataServiceCleanup({
    enableLogging: import.meta.env.DEV,
  });

  useEffect(() => {
    backendDiscovery.start();
    return () => {
      backendDiscovery.stop();
    };
  }, []);

  return (
    <ErrorBoundary scope="AppRoot">
      <ToastProvider>
        <SyncProvider>
          <DataSourceProvider>
            <ThemeProvider>
              <WindowProvider>
                <InnerApp />
              </WindowProvider>
            </ThemeProvider>
          </DataSourceProvider>
        </SyncProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
