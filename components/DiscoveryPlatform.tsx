// components/DiscoveryPlatform.tsx
import React, { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { DiscoveryRequest } from '../types';
import { 
  MessageCircle, Plus, Scale, Shield, Users, Lock, Clock,
  Mic2, Database, Package, ClipboardList, FileText
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { useQuery, useMutation, queryClient } from '../services/queryClient';
import { STORES } from '../services/db';
import { useNotify } from '../hooks/useNotify';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { LazyLoader } from './common/LazyLoader';
import { DiscoveryNavigation, getParentTabForView, getFirstTabOfParent } from './discovery/layout/DiscoveryNavigation';

const DiscoveryDashboard = lazy(() => import('./discovery/DiscoveryDashboard'));
const DiscoveryRequests = lazy(() => import('./discovery/DiscoveryRequests'));
const PrivilegeLog = lazy(() => import('./discovery/PrivilegeLog'));
const LegalHolds = lazy(() => import('./discovery/LegalHolds'));
const DiscoveryDocumentViewer = lazy(() => import('./discovery/DiscoveryDocumentViewer'));
const DiscoveryResponse = lazy(() => import('./discovery/DiscoveryResponse'));
const DiscoveryProduction = lazy(() => import('./discovery/DiscoveryProduction'));
const DiscoveryProductions = lazy(() => import('./discovery/DiscoveryProductions'));
const DiscoveryDepositions = lazy(() => import('./discovery/DiscoveryDepositions'));
const DiscoveryESI = lazy(() => import('./discovery/DiscoveryESI'));
const DiscoveryInterviews = lazy(() => import('./discovery/DiscoveryInterviews'));


export type DiscoveryView = 'dashboard' | 'requests' | 'privilege' | 'holds' | 'plan' | 'doc_viewer' | 'response' | 'production_wizard' | 'productions' | 'depositions' | 'esi' | 'interviews';

interface DiscoveryPlatformProps {
    initialTab?: DiscoveryView;
    caseId?: string; // Integration Point: Optional Scoping
}

export const DiscoveryPlatform: React.FC<DiscoveryPlatformProps> = ({ initialTab, caseId }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [activeTab, setActiveTab] = useSessionStorage<DiscoveryView>(
      caseId ? `discovery_active_tab_${caseId}` : 'discovery_active_tab', 
      'dashboard'
  );
  const [contextId, setContextId] = useState<string | null>(null);

  // Enterprise Query: Requests are central to many sub-views
  // We pass caseId to the service layer to scope the data fetch
  const { data: requests = [] } = useQuery<DiscoveryRequest[]>(
      [STORES.REQUESTS, caseId || 'all'], 
      () => DataService.discovery.getRequests(caseId) 
  );

  const { mutate: syncDeadlines, isLoading: isSyncing } = useMutation(
      DataService.discovery.syncDeadlines,
      {
          onSuccess: () => notify.success("Synced discovery deadlines with court calendar.")
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

  const handleSaveResponse = async (reqId: string, text: string) => {
      await DataService.discovery.updateRequestStatus(reqId, 'Responded');
      // Invalidate query to refresh lists
      queryClient.invalidate([STORES.REQUESTS, caseId || 'all']);
      alert(`Response saved for ${reqId}. Status updated to Responded.`);
      setActiveTab('requests');
  };

  const isWizardView = ['doc_viewer', 'response', 'production_wizard'].includes(activeTab);

  const tabContentMap = useMemo(() => ({
    'dashboard': <DiscoveryDashboard onNavigate={handleNavigate} />,
    'requests': <DiscoveryRequests items={requests} onNavigate={handleNavigate} />,
    'depositions': <DiscoveryDepositions />,
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
            <Suspense fallback={<LazyLoader message="Loading Discovery Module..." />}>
                {tabContentMap[activeTab as keyof typeof tabContentMap]}
            </Suspense>
        </div>
      </div>
    </div>
  );
};