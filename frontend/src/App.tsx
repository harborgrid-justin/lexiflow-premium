import React, { useEffect } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar/Sidebar';
import { AppShell } from '@/components/layouts/AppShell/AppShell';
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
import { LazyLoader } from '@/components/molecules/LazyLoader/LazyLoader';
import { initializeModules } from '@/config';
import { AppContentRenderer } from '@/components/layouts/AppContentRenderer';
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
  } = useAppController();

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
      onNavigate={handleNavigation}
      selectedCaseId={selectedCase?.id || null}
      sidebar={
        <ErrorBoundary scope="Sidebar">
          <Sidebar
            activeView={selectedCase ? 'cases' : activeView}
            setActiveView={handleNavigation}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
          />
        </ErrorBoundary>
      }
      headerContent={
        <ErrorBoundary scope="Header">
          <AppHeader
            onToggleSidebar={() => setIsSidebarOpen(true)}
            globalSearch={globalSearch}
            setGlobalSearch={setGlobalSearch}
            onGlobalSearch={() => {}}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onSearchResultClick={handleSearchResultClick}
            onNeuralCommand={handleNeuralCommand}
          />
        </ErrorBoundary>
      }
    >
      <GlobalHotkeys onToggleCommand={focusSearch} onNavigate={handleNavigation} />
      <ErrorBoundary scope="MainContent" onReset={handleBackToMain}>
        <AppContentRenderer
          activeView={activeView}
          currentUser={currentUser}
          selectedCase={selectedCase}
          handleSelectCase={handleSelectCase}
          handleSelectCaseById={handleSelectCaseById}
          navigateToCaseTab={navigateToCaseTab}
          handleBackToMain={handleBackToMain}
          setActiveView={handleNavigation}
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
