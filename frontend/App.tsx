import React, { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { AppShell } from './components/layout/AppShell';
import { AppHeader } from './components/layout/AppHeader';
import { ThemeProvider } from '@/context';
import { ToastProvider } from '@/context';
import { WindowProvider } from '@/context';
import { SyncProvider } from '@/context';
import { DataSourceProvider } from '@/context';
import { HolographicDock } from '@/components';
import { ErrorBoundary } from '@/components';
import { LazyLoader } from '@/components';
import { initializeModules } from '@/config';
import { AppContentRenderer } from '@/components';
import { GlobalHotkeys } from '@/components';
import { useAppController } from '@/hooks';
import { useDataServiceCleanup } from './hooks/useDataServiceCleanup';
import { backendDiscovery } from '@/services';

// Initialize Module Registry
initializeModules();

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
  // Enable memory cleanup and optional logging in development
  useDataServiceCleanup({
    enableLogging: process.env.NODE_ENV === 'development',
  });

  // Initialize backend discovery service on app mount
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