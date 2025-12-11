
import React, { Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { AppShell } from './components/layout/AppShell';
import { AppHeader } from './components/layout/AppHeader';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WindowProvider } from './context/WindowContext';
import { SyncProvider } from './context/SyncContext';
import { HolographicDock } from './components/layout/HolographicDock';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { initializeModules } from './config/modules';
import { AppContentRenderer } from './components/layout/AppContentRenderer';
import { GlobalHotkeys } from './components/common/GlobalHotkeys';
import { useAppController } from './hooks/useAppController';

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
      <div className="flex items-center justify-center h-[100dvh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">{appStatusMessage}</p>
        </div>
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
  return (
    <ThemeProvider>
      <ErrorBoundary scope="AppRoot">
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
};

export default App;
