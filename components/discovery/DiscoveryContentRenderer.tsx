import React, { lazy, Suspense } from 'react';
import { DiscoveryRequest } from '../../types';
import { DiscoveryView } from '../../hooks/useDiscoveryPlatform';
import { LazyLoader } from '../common/LazyLoader';

// Lazy load components ensuring named exports are handled correctly
const DiscoveryDashboard = lazy(() => import('./DiscoveryDashboard').then(m => ({ default: m.DiscoveryDashboard })));
const DiscoveryRequests = lazy(() => import('./DiscoveryRequests').then(m => ({ default: m.DiscoveryRequests })));
const PrivilegeLog = lazy(() => import('./PrivilegeLog').then(m => ({ default: m.PrivilegeLog })));
const LegalHolds = lazy(() => import('./LegalHolds').then(m => ({ default: m.LegalHolds })));
const DiscoveryDocumentViewer = lazy(() => import('./DiscoveryDocumentViewer').then(m => ({ default: m.DiscoveryDocumentViewer })));
const DiscoveryResponse = lazy(() => import('./DiscoveryResponse').then(m => ({ default: m.DiscoveryResponse })));
const DiscoveryProduction = lazy(() => import('./DiscoveryProduction').then(m => ({ default: m.DiscoveryProduction })));
const DiscoveryProductions = lazy(() => import('./DiscoveryProductions').then(m => ({ default: m.DiscoveryProductions })));
const DiscoveryDepositions = lazy(() => import('./DiscoveryDepositions').then(m => ({ default: m.DiscoveryDepositions })));
const DiscoveryESI = lazy(() => import('./DiscoveryESI').then(m => ({ default: m.DiscoveryESI })));
const DiscoveryInterviews = lazy(() => import('./DiscoveryInterviews').then(m => ({ default: m.DiscoveryInterviews })));

// Helper components that might be used internally or in future routes
const InitialDisclosureWizard = lazy(() => import('./InitialDisclosureWizard').then(m => ({ default: m.InitialDisclosureWizard })));
const MotionToCompelBuilder = lazy(() => import('./MotionToCompelBuilder').then(m => ({ default: m.MotionToCompelBuilder })));
const DiscoveryStipulations = lazy(() => import('./DiscoveryStipulations').then(m => ({ default: m.DiscoveryStipulations })));
const RequestForAdmission = lazy(() => import('./RequestForAdmission').then(m => ({ default: m.RequestForAdmission })));
const Examinations = lazy(() => import('./Examinations').then(m => ({ default: m.Examinations })));
const TranscriptManager = lazy(() => import('./TranscriptManager').then(m => ({ default: m.TranscriptManager })));
const VendorManagement = lazy(() => import('./VendorManagement').then(m => ({ default: m.VendorManagement })));
const PerpetuateTestimony = lazy(() => import('./PerpetuateTestimony').then(m => ({ default: m.PerpetuateTestimony })));

interface DiscoveryContentRendererProps {
  activeTab: DiscoveryView;
  requests: DiscoveryRequest[];
  contextId: string | null;
  onNavigate: (view: DiscoveryView, id?: string) => void;
  onBack: () => void;
  onSaveResponse: (reqId: string, text: string) => void;
  onCreateProduction: () => void;
}

export const DiscoveryContentRenderer: React.FC<DiscoveryContentRendererProps> = ({
  activeTab, requests, contextId, onNavigate, onBack, onSaveResponse, onCreateProduction
}) => {
  // Wizard/Detail Views
  if (activeTab === 'doc_viewer') return <DiscoveryDocumentViewer docId={contextId || ''} onBack={onBack} />;
  if (activeTab === 'response') return <DiscoveryResponse request={requests.find(r => r.id === contextId) || null} onBack={onBack} onSave={onSaveResponse} />;
  if (activeTab === 'production_wizard') return <DiscoveryProduction request={requests.find(r => r.id === contextId) || null} onBack={onBack} />;

  // Main Tab Views
  switch(activeTab) {
    case 'dashboard': return <DiscoveryDashboard />;
    case 'requests': return <DiscoveryRequests items={requests} onNavigate={onNavigate} />;
    case 'depositions': return <DiscoveryDepositions />;
    case 'esi': return <DiscoveryESI />;
    case 'productions': return <DiscoveryProductions onCreateClick={onCreateProduction} />;
    case 'interviews': return <DiscoveryInterviews />;
    case 'privilege': return <PrivilegeLog />;
    case 'holds': return <LegalHolds />;
    // Add other main views here
    default: return <DiscoveryDashboard />;
  }
};
