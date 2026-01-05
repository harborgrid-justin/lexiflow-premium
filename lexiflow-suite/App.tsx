
import React, { useState, useTransition, Suspense, useDeferredValue, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { CaseList } from './components/CaseList.tsx';
import { ResearchTool } from './components/ResearchTool.tsx';
import { CaseDetail } from './components/CaseDetail.tsx';
import { DocumentManager } from './components/DocumentManager.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { ClauseLibrary } from './components/ClauseLibrary.tsx';
import { BillingDashboard } from './components/BillingDashboard.tsx';
import { ClientCRM } from './components/ClientCRM.tsx';
import { KnowledgeBase } from './components/KnowledgeBase.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { ComplianceDashboard } from './components/ComplianceDashboard.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { ThemeTokensViewer } from './components/admin/ThemeTokensViewer.tsx';
import { DiscoveryPlatform } from './components/DiscoveryPlatform.tsx';
import { EvidenceVault } from './components/EvidenceVault.tsx';
import { SecureMessenger } from './components/SecureMessenger.tsx';
import { JurisdictionManager } from './components/JurisdictionManager.tsx';
import { MasterWorkflow } from './components/MasterWorkflow.tsx';
import { DocketManager } from './components/DocketManager.tsx';
import { FirmOperations } from './components/FirmOperations.tsx';
import { DesignSystem } from './components/DesignSystem.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { AppShell } from './components/layout/AppShell.tsx';
import { Case, AppView, User } from './types.ts';
import { User as UserIcon, Search, Menu, Lock, Loader2, RefreshCw, Moon, Sun } from 'lucide-react';
import { useData, useActions } from './hooks/useData.ts';
import { useTheme, ThemeDensity } from './components/providers/ThemeProvider.tsx';

const App: React.FC = () => {
  const cases = useData(s => s.cases);
  const isLoading = useData(s => s.isLoading);
  const isSyncing = useData(s => s.isSyncing);
  const users = useData(s => s.users);
  const actions = useActions();

  const { density, setDensity, isDark, toggleDark } = useTheme();

  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [globalSearch, setGlobalSearch] = useState('');
  
  const deferredSearch = useDeferredValue(globalSearch);
  const [isPending, startTransition] = useTransition();

  const currentUser: User = users[currentUserIndex] || { 
    id: 'guest', 
    name: 'Loading...', 
    role: 'Guest' as const 
  };

  const handleSelectCaseById = useCallback((caseId: string) => {
    const found = cases.find(c => c.id === caseId);
    if (found) {
      startTransition(() => {
        setSelectedCase(found);
      });
    }
  }, [cases]);

  const handleNavigate = useCallback((view: AppView) => {
    startTransition(() => {
        setActiveView(view);
        setSelectedCase(null);
        setIsSidebarOpen(false);
    });
  }, []);

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && deferredSearch) {
        const foundCase = cases.find(c => 
            c.id.toLowerCase().includes(deferredSearch.toLowerCase()) || 
            c.title.toLowerCase().includes(deferredSearch.toLowerCase())
        );
        if (foundCase) {
            startTransition(() => {
                setSelectedCase(foundCase);
                setGlobalSearch('');
            });
        }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600"/>
          <p className="font-black uppercase tracking-widest text-[10px]">Initializing Enterprise Core</p>
        </div>
      );
    }

    if (selectedCase) return <CaseDetail caseData={selectedCase} onBack={() => handleNavigate(activeView)} />;
    
    const restrictedViews: AppView[] = ['admin', 'compliance', 'design', 'theme'];
    const isAuthorized = currentUser.role === 'Administrator' || currentUser.role === 'Senior Partner';
    
    if (restrictedViews.includes(activeView) && !isAuthorized) {
        return (
            <div className="flex flex-col justify-center items-center h-full text-slate-500">
                <div className="bg-red-50 p-6 rounded-full mb-4 shadow-xl shadow-red-500/10 border border-red-100">
                    <Lock className="h-10 w-10 text-red-500"/>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Access Restricted</h3>
                <p className="text-sm mt-2 max-w-md text-center font-medium">
                    This administrative domain requires elevated clearance.
                </p>
            </div>
        );
    }

    // Dynamic Spacing Wrapper
    const contentWrapperStyle = {
        padding: 'var(--spacing-gutter)',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        width: '100%'
    };

    switch (activeView) {
      case 'dashboard': return <div style={contentWrapperStyle}><Dashboard onSelectCase={handleSelectCaseById} /></div>;
      case 'cases': return <div style={contentWrapperStyle}><CaseList onSelectCase={(c) => startTransition(() => setSelectedCase(c))} /></div>;
      case 'docket': return <div style={contentWrapperStyle}><DocketManager /></div>;
      case 'workflows': return <div style={contentWrapperStyle}><MasterWorkflow onSelectCase={handleSelectCaseById} /></div>;
      case 'messages': return <div style={contentWrapperStyle}><SecureMessenger /></div>;
      case 'discovery': return <div style={contentWrapperStyle}><DiscoveryPlatform /></div>;
      case 'evidence': return <div style={contentWrapperStyle}><EvidenceVault onNavigateToCase={handleSelectCaseById} /></div>;
      case 'jurisdiction': return <div style={contentWrapperStyle}><JurisdictionManager currentUser={currentUser} /></div>;
      case 'calendar': return <div style={contentWrapperStyle}><CalendarView /></div>;
      case 'practice': return <div style={contentWrapperStyle}><FirmOperations /></div>;
      case 'billing': return <div style={contentWrapperStyle}><BillingDashboard navigateTo={(v) => handleNavigate(v as AppView)} /></div>;
      case 'crm': return <div style={contentWrapperStyle}><ClientCRM /></div>;
      case 'research': return <div style={contentWrapperStyle}><ResearchTool /></div>;
      case 'documents': return <div style={contentWrapperStyle}><DocumentManager currentUserRole={currentUser.role} /></div>;
      case 'library': return <div style={contentWrapperStyle}><KnowledgeBase /></div>;
      case 'clauses': return <div style={contentWrapperStyle}><ClauseLibrary /></div>;
      case 'analytics': return <div style={contentWrapperStyle}><AnalyticsDashboard /></div>;
      case 'compliance': return <div style={contentWrapperStyle}><ComplianceDashboard /></div>;
      case 'admin': return <div style={contentWrapperStyle}><AdminPanel /></div>;
      case 'theme': return <div style={contentWrapperStyle}><ThemeTokensViewer standalone /></div>;
      case 'design': return <div style={contentWrapperStyle}><DesignSystem /></div>; 
      default: return <div style={contentWrapperStyle}><Dashboard onSelectCase={handleSelectCaseById} /></div>;
    }
  };

  const headerContent = (
    <>
      <div className="flex items-center flex-1 gap-6">
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="md:hidden p-2 rounded-xl focus:outline-none hover:bg-[var(--color-background)] text-[var(--color-textMuted)]"
        >
            <Menu className="h-6 w-6" />
        </button>
        <div className="relative w-full hidden sm:block max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-textMuted)' }} />
            <input 
                type="text" 
                placeholder="Command Search (⌘K)..." 
                className="w-full pl-11 pr-4 py-3 border-transparent focus:ring-4 text-[11px] font-black uppercase tracking-wider outline-none transition-all shadow-inner placeholder:text-[var(--color-textMuted)] focus:bg-[var(--color-surface)]" 
                style={{ 
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    borderRadius: 'var(--radius-xl)',
                    '--tw-ring-color': 'var(--color-primaryLight)'
                } as React.CSSProperties}
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleGlobalSearch}
            />
        </div>
      </div>
      <div className="flex items-center space-x-3 md:space-x-5">
        <div 
            className="hidden lg:flex items-center gap-1 p-1 border shadow-inner"
            style={{ 
                backgroundColor: 'var(--color-background)', 
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-xl)'
            }}
        >
            {(['compact', 'normal', 'comfortable'] as ThemeDensity[]).map((d) => (
                <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${density === d ? 'shadow-sm ring-1 ring-inset' : 'hover:opacity-70'}`}
                    style={{
                        backgroundColor: density === d ? 'var(--color-surface)' : 'transparent',
                        color: density === d ? 'var(--color-secondary)' : 'var(--color-textMuted)',
                        borderRadius: 'var(--radius-lg)',
                        borderColor: density === d ? 'var(--color-border)' : 'transparent'
                    }}
                >
                    {d}
                </button>
            ))}
        </div>
        <button 
          onClick={toggleDark}
          className="p-2.5 transition-colors border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-background)]"
          style={{ 
              borderRadius: 'var(--radius-xl)', 
              color: 'var(--color-textMuted)' 
          }}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button 
          className={`p-2.5 transition-colors border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-background)]`}
          style={{ 
              borderRadius: 'var(--radius-xl)', 
              color: isSyncing ? 'var(--color-secondary)' : 'var(--color-textMuted)',
              backgroundColor: isSyncing ? 'var(--color-primaryLight)' : 'transparent'
          }}
          onClick={() => actions.syncData()}
        >
          <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
        <div 
            className="flex items-center space-x-4 border-l pl-5 md:pl-8 cursor-pointer p-1 transition-all hover:bg-[var(--color-background)]" 
            style={{ 
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-xl)'
            }}
            onClick={() => setCurrentUserIndex((prev) => (prev + 1) % users.length)}
        >
            <div className="text-right hidden md:block">
                <p className="text-sm font-black tracking-tighter leading-none" style={{ color: 'var(--color-text)' }}>{currentUser.name}</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-1.5" style={{ color: 'var(--color-textMuted)' }}>{currentUser.role}</p>
            </div>
            <div 
                className="h-11 w-11 flex items-center justify-center text-white shadow-xl border border-white/20"
                style={{
                    background: 'linear-gradient(to top right, var(--color-secondary), var(--color-accent))',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)'
                }}
            >
                <UserIcon className="h-5 w-5" />
            </div>
        </div>
      </div>
    </>
  );

  return (
    <AppShell
      sidebar={
        <Sidebar 
          activeView={selectedCase ? 'cases' : activeView} 
          setActiveView={handleNavigate} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          currentUser={currentUser} 
          onSwitchUser={() => setCurrentUserIndex((prev) => (prev + 1) % users.length)} 
        />
      }
      headerContent={headerContent}
      hideHeader={!!selectedCase}
    >
        <ErrorBoundary>
            <Suspense fallback={
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
            }>
                <div className={`transition-all duration-500 ${isPending ? 'opacity-30 grayscale blur-[2px]' : 'opacity-100'}`}>
                    {renderContent()}
                </div>
            </Suspense>
        </ErrorBoundary>
    </AppShell>
  );
};

export default App;
