import { AppHeader } from '@/components/organisms/AppHeader/AppHeader';
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary/ErrorBoundary';
import { GlobalHotkeys } from '@/components/organisms/GlobalHotkeys/GlobalHotkeys';
import { HolographicDock } from '@/components/organisms/HolographicDock/HolographicDock';
import { Sidebar } from '@/components/organisms/Sidebar/Sidebar';
import { AppContentRenderer } from '@/components/ui/layouts/AppContentRenderer/AppContentRenderer';
import { AppShell } from '@/components/ui/layouts/AppShell/AppShell';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { initializeModules } from '@/config/modules';
import { useAppController } from '@/hooks';
import { DataSourceProvider, SyncProvider, ThemeProvider, ToastProvider, WindowProvider } from '@/providers';
import { backendDiscovery } from '@/services/integration/backendDiscovery';
import { IntegrationOrchestrator } from '@/services/integration/integrationOrchestrator';
import type { Case } from '@/types';
import type { IntentResult } from '@/types/ai';
import React, { useEffect } from 'react';
import { useDataServiceCleanup } from './hooks/useDataServiceCleanup';
import { GlobalSearchResult } from './services/search/searchService';

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
            onGlobalSearch={() => { }}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onSearchResultClick={(result: GlobalSearchResult) => selectCase(result.id)}
            onNeuralCommand={(intent: IntentResult) => console.log('Neural command:', intent)}
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
InnerApp.displayName = 'InnerApp';

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
App.displayName = 'App';

export default App;
