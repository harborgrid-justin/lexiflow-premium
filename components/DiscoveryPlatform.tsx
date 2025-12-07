
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

// FIX: Import all lazy loaded components for DiscoveryPlatform
const DiscoveryDashboard = lazy(() => import('./discovery/DiscoveryDashboard').then(m => ({ default: m.DiscoveryDashboard })));
const DiscoveryRequests = lazy(() => import('./discovery/DiscoveryRequests').then(m => ({ default: m.DiscoveryRequests })));
const PrivilegeLog = lazy(() => import('./discovery/PrivilegeLog').then(m => ({ default: m.PrivilegeLog })));
const LegalHolds = lazy(() => import('./discovery/LegalHolds').then(m => ({ default: m.LegalHolds })));
const DiscoveryDocumentViewer = lazy(() => import('./discovery/DiscoveryDocumentViewer').then(m => ({ default: m.DiscoveryDocumentViewer })));
const DiscoveryResponse = lazy(() => import('./discovery/DiscoveryResponse').then(m => ({ default: m.DiscoveryResponse })));
const DiscoveryProduction = lazy(() => import('./discovery/DiscoveryProduction').then(m => ({ default: m.DiscoveryProduction })));
const DiscoveryProductions = lazy(() => import('./discovery/DiscoveryProductions').then(m => ({ default: m.DiscoveryProductions })));
const DiscoveryDepositions = lazy(() => import('./discovery/DiscoveryDepositions').then(m => ({ default: m.DiscoveryDepositions })));
const DiscoveryESI = lazy(() => import('./discovery/DiscoveryESI').then(m => ({ default: m.DiscoveryESI })));
const DiscoveryInterviews = lazy(() => import('./discovery/DiscoveryInterviews').then(m => ({ default: m.DiscoveryInterviews })));


export type DiscoveryView = 'dashboard' | 'requests' | 'privilege' | 'holds' | 'plan' | 'doc_viewer' | 'response' | 'production_wizard' | 'productions' | 'depositions' | 'esi' | 'interviews';

interface DiscoveryPlatformProps {
    initialTab?: DiscoveryView;
    caseId?: string; // Integration Point: Optional Scoping
}

const PARENT_TABS = [
  {
    id: 'dashboard_parent', label: 'Dashboard', icon: Scale,
    subTabs: [ { id: 'dashboard', label: 'Overview', icon: Scale } ]
  },
  {
    id: 'collection', label: 'Collection', icon: Database,
    subTabs: [
      { id: 'esi', label: 'ESI Map', icon: Database },
      { id: 'interviews', label: 'Interviews', icon: ClipboardList },
      { id: 'holds', label: 'Legal Holds', icon: Lock },
    ]
  },
  {
    id: 'review', label: 'Review & Production', icon: FileText,
    subTabs: [
      { id: 'requests', label: 'Requests', icon: MessageCircle },
      { id: 'productions', label: 'Productions', icon: Package },
      { id: 'privilege', label: 'Privilege Log', icon: Shield },
    ]
  },
  {
    id: 'proceedings', label: 'Proceedings', icon: Mic2,
    subTabs: [
      { id: 'depositions', label: 'Depositions', icon: Mic2 },
      { id: 'plan', label: 'Discovery Plan', icon: Users },
    ]
  }
];

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
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as DiscoveryView);
    }
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
        
        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                        activeParentTab.id === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs.length > 1 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 touch-pan-x", theme.surfaceHighlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as DiscoveryView)} 
                        className={cn(
                            "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                            activeTab === tab.id 
                                ? cn(theme.surface.default, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                                : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface.default}`)
                        )}
                    >
                        <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                        {tab.label}
                    </button>
                ))}
            </div>
        )}
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