/**
 * @module components/discovery/DiscoveryPlatform
 * @category Discovery
 * @description Comprehensive discovery platform with requests, productions, and ESI.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { Plus, Users, Clock } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { PageHeader } from '@/components/organisms';
import { Button } from '@/components/atoms';
import { LazyLoader } from '@/components/molecules';
import { DiscoveryNavigation, getParentTabForView, getFirstTabOfParent } from './layout/DiscoveryNavigation';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { useNotify } from '@/hooks/useNotify';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Services & Utils
import { DataService } from '@/services';
import { cn } from '@/utils/cn';
import { STORES } from '@/services/data/db';
import { queryKeys } from '@/utils/queryKeys';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { DiscoveryRequest } from '@/types';

// FIX: Import all lazy loaded components for DiscoveryPlatform
const DiscoveryDashboard = lazy(() => import('./dashboard/DiscoveryDashboard'));
const DiscoveryRequests = lazy(() => import('./DiscoveryRequests'));
const PrivilegeLog = lazy(() => import('./PrivilegeLog'));
const LegalHolds = lazy(() => import('./LegalHolds'));
const DiscoveryDocumentViewer = lazy(() => import('./DiscoveryDocumentViewer'));
const DiscoveryResponse = lazy(() => import('./DiscoveryResponse'));
const DiscoveryProduction = lazy(() => import('./DiscoveryProduction'));
const DiscoveryProductions = lazy(() => import('./DiscoveryProductions'));
const DiscoveryDepositions = lazy(() => import('./DiscoveryDepositions'));
const DiscoveryESI = lazy(() => import('./DiscoveryESI'));
const DiscoveryInterviews = lazy(() => import('./DiscoveryInterviews'));
const Examinations = lazy(() => import('./Examinations'));
const Custodians = lazy(() => import('./Custodians'));

import { DiscoveryView, DiscoveryPlatformProps } from './types';
import { DiscoveryErrorBoundary } from './DiscoveryErrorBoundary';
import { DiscoveryRequestsSkeleton, PrivilegeLogSkeleton, LegalHoldsSkeleton, ESIDashboardSkeleton } from './DiscoverySkeleton';

const DiscoveryPlatformInternal = ({ initialTab, caseId }: DiscoveryPlatformProps) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [activeTab, setActiveTab] = useSessionStorage<DiscoveryView>(
      caseId ? `discovery_active_tab_${caseId}` : 'discovery_active_tab', 
      initialTab || 'dashboard'
  );
  const [contextId, setContextId] = useState<string | null>(null);

  // Reset to dashboard if we're on a wizard view but have no context
  useEffect(() => {
    const isWizard = ['doc_viewer', 'response', 'production_wizard'].includes(activeTab);
    if (isWizard && !contextId) {
      console.warn('[DiscoveryPlatform] Wizard view without context, resetting to dashboard');
      setActiveTab('dashboard');
    }
  }, [activeTab, contextId, setActiveTab]);

  // Enterprise Query: Requests are central to many sub-views
  // We pass caseId to the service layer to scope the data fetch
  const { data: requests = [] } = useQuery<DiscoveryRequest[]>(
      [STORES.REQUESTS, caseId || 'all'],
      async () => {
        const discovery = DataService.discovery as any;
        return discovery.getRequests(caseId);
      }
  );

  const { mutate: syncDeadlines, isLoading: isSyncing } = useMutation(
      async () => {
        const discovery = DataService.discovery as any;
        return discovery.syncDeadlines();
      },
      {
          onSuccess: () => {
              notify.success("Synced discovery deadlines with court calendar.");
              queryClient.invalidate(queryKeys.discovery.all());
              queryClient.invalidate(queryKeys.calendar.events());
          },
          onError: (error: unknown) => {
              notify.error('Failed to sync deadlines. Please try again later.');
              console.error('Sync error:', error);
          }
      }
  );

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab, setActiveTab]);

  const activeParentTab = useMemo(() => 
    getParentTabForView(activeTab),
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    setActiveTab(getFirstTabOfParent(parentId));
  }, [setActiveTab]);
  
  const handleNavigate = (targetView: DiscoveryView, id?: string) => {
    if (id) setContextId(id);
    setActiveTab(targetView);
  };
  
  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
    setContextId(null);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
      'mod+d': () => setActiveTab('dashboard'),
      'mod+r': () => setActiveTab('requests'),
      'mod+p': () => setActiveTab('privilege'),
      'mod+h': () => setActiveTab('holds'),
      'mod+e': () => setActiveTab('esi'),
      'escape': () => {
          if (isWizardView) {
              handleBackToDashboard();
          }
      }
  });

  const handleSaveResponse = async (reqId: string) => {
      const discovery = DataService.discovery as any;
      await discovery.updateRequestStatus(reqId, 'Responded');
      queryClient.invalidate(caseId ? queryKeys.discovery.byCaseId(caseId) : queryKeys.discovery.all());
      alert(`Response saved for ${reqId}. Status updated to Responded.`);
      setActiveTab('requests');
  };

  const isWizardView = ['doc_viewer', 'response', 'production_wizard'].includes(activeTab);

  const tabContentMap = useMemo(() => ({
    'dashboard': <DiscoveryDashboard onNavigate={handleNavigate} />,
    'requests': <DiscoveryRequests items={requests} onNavigate={handleNavigate} />,
    'depositions': <DiscoveryDepositions />,
    'examinations': <Examinations />,
    'custodians': <Custodians />,
    'esi': <DiscoveryESI />,
    'productions': <DiscoveryProductions onCreateClick={() => setActiveTab('production_wizard')} />,
    'interviews': <DiscoveryInterviews />,
    'privilege': <PrivilegeLog />,
    'holds': <LegalHolds />,
    'plan': (
        <div className={cn("p-12 flex flex-col items-center justify-center h-full text-center rounded-lg border-2 border-dashed", theme.border.default)}>
            <Users className={cn("h-16 w-16 mb-4 opacity-20", theme.text.primary)}/>
            <p className={cn("font-medium text-lg", theme.text.primary)}>Rule 26(f) Discovery Plan Builder</p>
            <p className={cn("text-sm mb-6", theme.text.secondary)}>Collaborative editor for joint discovery plans.</p>
            <Button variant="outline" onClick={handleBackToDashboard}>Return to Dashboard</Button>
        </div>
    ),
  }), [requests, theme, handleNavigate, handleBackToDashboard]);

  if (isWizardView) {
      return (
          <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
            <Suspense fallback={<LazyLoader message="Loading Discovery Wizard..." />}>
              {activeTab === 'doc_viewer' && (
                  <DiscoveryDocumentViewer docId={contextId || ''} onBack={handleBackToDashboard} />
              )}
              {activeTab === 'response' && (
                  <div className="p-6 h-full"><DiscoveryResponse request={requests.find(r => r.id === contextId) || null} onBack={() => setActiveTab('requests')} onSave={handleSaveResponse} /></div>
              )}
              {activeTab === 'production_wizard' && (
                  <div className="p-6 h-full"><DiscoveryProduction request={requests.find(r => r.id === contextId) || null} onBack={() => setActiveTab('productions')} /></div>
              )}
            </Suspense>
          </div>
      );
  }

  // Show skeletons while loading
  const renderSkeleton = () => {
    switch(activeTab) {
      case 'requests': return <DiscoveryRequestsSkeleton />;
      case 'privilege': return <PrivilegeLogSkeleton />;
      case 'holds': return <LegalHoldsSkeleton />;
      case 'esi': return <ESIDashboardSkeleton />;
      default: return <LazyLoader message="Loading Discovery Module..." />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className={cn("px-6 pt-6 shrink-0", caseId ? "pt-2" : "")}>
        {!caseId && (
            <PageHeader 
                title="Discovery Center" 
                subtitle="Manage Requests, Legal Holds, and FRCP Compliance."
                actions={
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Clock} onClick={() => syncDeadlines(undefined)} isLoading={isSyncing}>Sync Deadlines</Button>
                    <Button variant="primary" icon={Plus} onClick={() => alert("New Request Wizard")}>Create Request</Button>
                </div>
                }
            />
        )}
        
        <DiscoveryNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            activeParentTabId={activeParentTab.id}
            onParentTabChange={handleParentTabChange}
        />
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
            <Suspense fallback={renderSkeleton()}>
                {tabContentMap[activeTab as keyof typeof tabContentMap]}
            </Suspense>
        </div>
      </div>
    </div>
  );
};

// Wrap with error boundary
export const DiscoveryPlatform = (props: DiscoveryPlatformProps) => (
  <DiscoveryErrorBoundary onReset={() => window.location.reload()}>
    <DiscoveryPlatformInternal {...props} />
  </DiscoveryErrorBoundary>
);

export default DiscoveryPlatform;

