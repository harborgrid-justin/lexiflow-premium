import React, { useMemo, useCallback, useEffect, useState, Suspense, lazy } from 'react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { 
  MessageCircle, Plus, Scale, Shield, Users, Lock, Clock,
  Mic2, Database, Package, ClipboardList, FileText, FileCheck, Gavel, AlertTriangle,
  Stethoscope, Briefcase, Settings, CheckSquare
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { useQuery, useMutation, queryClient } from '../services/queryClient';
import { STORES } from '../services/db';
import { useNotify } from '../hooks/useNotify';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { TabbedPageLayout, TabConfigItem } from './layout/TabbedPageLayout';
import { LazyLoader } from './common/LazyLoader';
import { DiscoveryRequest } from '../types';

// Sub-components (Lazy Loaded)
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
const DiscoveryPlanBuilder = lazy(() => import('./case-detail/collaboration/DiscoveryPlanBuilder').then(m => ({ default: m.DiscoveryPlanBuilder })));
const InitialDisclosureWizard = lazy(() => import('./discovery/InitialDisclosureWizard').then(m => ({ default: m.InitialDisclosureWizard })));
const MotionToCompelBuilder = lazy(() => import('./discovery/MotionToCompelBuilder').then(m => ({ default: m.MotionToCompelBuilder })));
const DiscoveryStipulations = lazy(() => import('./discovery/DiscoveryStipulations').then(m => ({ default: m.DiscoveryStipulations })));
const RequestForAdmission = lazy(() => import('./discovery/RequestForAdmission').then(m => ({ default: m.RequestForAdmission })));
const Examinations = lazy(() => import('./discovery/Examinations').then(m => ({ default: m.Examinations })));
const MotionForSanctions = lazy(() => import('./discovery/MotionForSanctions').then(m => ({ default: m.MotionForSanctions })));
const VendorManagement = lazy(() => import('./discovery/VendorManagement').then(m => ({ default: m.VendorManagement })));
const TranscriptManager = lazy(() => import('./discovery/TranscriptManager').then(m => ({ default: m.TranscriptManager })));
const PerpetuateTestimony = lazy(() => import('./discovery/PerpetuateTestimony').then(m => ({ default: m.PerpetuateTestimony })));

export type DiscoveryView = 'dashboard' | 'plan' | 'disclosures' | 'requests' | 'privilege' | 'holds' | 'doc_viewer' | 'response' | 'production_wizard' | 'productions' | 'depositions' | 'esi' | 'interviews' | 'compel' | 'stipulations' | 'perpetuate' | 'admissions' | 'examinations' | 'sanctions' | 'vendors' | 'transcripts';

interface DiscoveryPlatformProps {
    initialTab?: DiscoveryView;
}

const TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'strategy', label: 'Strategy & Planning', icon: Scale,
    subTabs: [ 
      { id: 'dashboard', label: 'Overview', icon: Scale },
      { id: 'plan', label: 'Rule 26(f) Plan', icon: Users },
      { id: 'stipulations', label: 'Stipulations (Rule 29)', icon: FileText },
    ]
  },
  {
    id: 'disclosure', label: 'Disclosures & Preservation', icon: Database,
    subTabs: [
      { id: 'disclosures', label: 'Initial Disclosures (26a)', icon: FileCheck },
      { id: 'perpetuate', label: 'Perpetuate Testimony (27)', icon: Clock },
      { id: 'holds', label: 'Legal Holds', icon: Lock },
      { id: 'esi', label: 'ESI Map', icon: Database },
      { id: 'interviews', label: 'Custodian Interviews', icon: ClipboardList },
    ]
  },
  {
    id: 'conduct', label: 'Conduct Discovery', icon: FileText,
    subTabs: [
      { id: 'requests', label: 'Interrogatories/RFPs (33/34)', icon: MessageCircle },
      { id: 'admissions', label: 'Requests for Admission (36)', icon: CheckSquare },
      { id: 'depositions', label: 'Depositions (30/31)', icon: Mic2 },
      { id: 'examinations', label: 'Examinations (35)', icon: Stethoscope },
      { id: 'productions', label: 'Productions', icon: Package },
      { id: 'privilege', label: 'Privilege Log (26b)', icon: Shield },
    ]
  },
  {
    id: 'enforce', label: 'Disputes & Enforcement', icon: Gavel,
    subTabs: [
      { id: 'compel', label: 'Motion to Compel (37a)', icon: AlertTriangle },
      { id: 'sanctions', label: 'Motion for Sanctions (37b)', icon: Gavel },
    ]
  },
  {
    id: 'operations', label: 'Operations', icon: Settings,
    subTabs: [
        {id: 'vendors', label: 'Vendor Management (28)', icon: Briefcase},
        {id: 'transcripts', label: 'Transcript Manager (32)', icon: FileText}
    ]
  }
];

export const DiscoveryPlatform: React.FC<DiscoveryPlatformProps> = ({ initialTab }) => {
  const notify = useNotify();
  const [activeTab, setActiveTab] = useSessionStorage<DiscoveryView>('discovery_active_tab', initialTab || 'dashboard');
  const [contextId, setContextId] = useState<string | null>(null);

  const { data: requests = [] } = useQuery<DiscoveryRequest[]>(
      [STORES.REQUESTS, 'all'], 
      () => DataService.discovery.getRequests()
  );

  const { mutate: syncDeadlines, isLoading: isSyncing } = useMutation(
      DataService.discovery.syncDeadlines,
      { onSuccess: () => notify.success("Synced discovery deadlines.") }
  );
  
  const handleNavigate = (targetView: DiscoveryView, id?: string) => {
    if (id) setContextId(id);
    setActiveTab(targetView);
  };

  const handleSaveResponse = async (reqId: string, text: string) => {
      await DataService.discovery.updateRequestStatus(reqId, 'Responded');
      queryClient.invalidate([STORES.REQUESTS, 'all']);
      notify.success(`Response saved for ${reqId}.`);
      setActiveTab('requests');
  };

  const isWizardView = ['doc_viewer', 'response', 'production_wizard'].includes(activeTab);

  const renderContent = () => {
    if (isWizardView) {
        if (activeTab === 'doc_viewer') return <DiscoveryDocumentViewer docId={contextId || ''} onBack={() => setActiveTab('dashboard')} />;
        if (activeTab === 'response') return <DiscoveryResponse request={requests.find(r => r.id === contextId) || null} onBack={() => setActiveTab('requests')} onSave={handleSaveResponse} />;
        if (activeTab === 'production_wizard') return <DiscoveryProduction request={requests.find(r => r.id === contextId) || null} onBack={() => setActiveTab('productions')} />;
    }
    
    switch(activeTab) {
        case 'dashboard': return <DiscoveryDashboard onNavigate={handleNavigate} />;
        case 'plan': return <div className="p-6"><DiscoveryPlanBuilder caseId="C-2024-001" /></div>;
        case 'disclosures': return <InitialDisclosureWizard onComplete={() => setActiveTab('dashboard')} />;
        case 'requests': return <DiscoveryRequests items={requests} onNavigate={handleNavigate} />;
        case 'depositions': return <DiscoveryDepositions />;
        case 'esi': return <DiscoveryESI />;
        case 'productions': return <DiscoveryProductions onCreateClick={() => setActiveTab('production_wizard')} />;
        case 'interviews': return <DiscoveryInterviews />;
        case 'privilege': return <PrivilegeLog />;
        case 'holds': return <LegalHolds />;
        case 'compel': return <MotionToCompelBuilder requests={requests} onCancel={() => setActiveTab('requests')} />;
        case 'stipulations': return <DiscoveryStipulations />;
        case 'perpetuate': return <PerpetuateTestimony />;
        case 'admissions': return <RequestForAdmission />;
        case 'examinations': return <Examinations />;
        case 'sanctions': return <MotionForSanctions />;
        case 'vendors': return <VendorManagement />;
        case 'transcripts': return <TranscriptManager />;
        default: return <DiscoveryDashboard onNavigate={handleNavigate} />;
    }
  };

  if (isWizardView) {
    return <Suspense fallback={<LazyLoader message="Loading Discovery Module..." />}>{renderContent()}</Suspense>;
  }

  return (
    <TabbedPageLayout
      pageTitle="Discovery Center"
      pageSubtitle="FRCP Title V Lifecycle Management (Rules 26-37)"
      pageActions={
        <div className="flex gap-2">
            <Button variant="secondary" icon={Clock} onClick={() => syncDeadlines(undefined)} isLoading={isSyncing}>Sync Deadlines</Button>
            <Button variant="primary" icon={Plus} onClick={() => alert("New Request Wizard")}>Create Request</Button>
        </div>
      }
      tabConfig={TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as DiscoveryView)}
    >
      <Suspense fallback={<LazyLoader message="Loading Discovery Module..." />}>
        {renderContent()}
      </Suspense>
    </TabbedPageLayout>
  );
};
