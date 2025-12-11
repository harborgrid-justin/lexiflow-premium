
import React, { lazy, Suspense } from 'react';
import { DiscoveryRequest } from '../../types';
// FIX: Corrected import path for DiscoveryView type.
import { DiscoveryView } from '../../hooks/useDiscoveryPlatform';
import { LazyLoader } from '../common/LazyLoader';

const DiscoveryDashboard = lazy(() => import('./DiscoveryDashboard'));
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
const InitialDisclosureWizard = lazy(() => import('./InitialDisclosureWizard'));
const MotionToCompelBuilder = lazy(() => import('./MotionToCompelBuilder'));
const DiscoveryStipulations = lazy(() => import('./DiscoveryStipulations'));
const RequestForAdmission = lazy(() => import('./RequestForAdmission'));
const Examinations = lazy(() => import('./Examinations'));
const TranscriptManager = lazy(() => import('./TranscriptManager'));
const VendorManagement = lazy(() => import('./VendorManagement'));
const PerpetuateTestimony = lazy(() => import('./PerpetuateTestimony'));

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
    case 'dashboard': return <DiscoveryDashboard onNavigate={onNavigate} />;
    case 'requests': return <DiscoveryRequests items={requests} onNavigate={onNavigate} />;
    case 'depositions': return <DiscoveryDepositions />;
    case 'esi': return <DiscoveryESI />;
    case 'productions': return <DiscoveryProductions onCreateClick={onCreateProduction} />;
    case 'interviews': return <DiscoveryInterviews />;
    case 'privilege': return <PrivilegeLog />;
    case 'holds': return <LegalHolds />;
    // Add other main views here
    default: return <DiscoveryDashboard onNavigate={onNavigate} />;
  }
};
