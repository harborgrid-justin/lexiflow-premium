/**
 * @module components/discovery/DiscoveryContentRenderer
 * @category Discovery
 * @description Content router for Discovery Platform - maps activeTab to appropriate component.
 * 
 * ROUTING STRUCTURE:
 * - Main tab views: dashboard, requests, depositions, esi, productions, interviews, privilege, holds
 * - Additional views: custodians, examinations, plan
 * - Wizard/Detail views: doc_viewer, response, production_wizard
 * 
 * EXPORTED UTILITIES:
 * Workflow components (InitialDisclosureWizard, MotionToCompelBuilder, etc.) are exported
 * for use by parent components, action buttons, or future routing extensions.
 * 
 * NO THEME USAGE: Pure routing logic
 */

import React, { lazy, Suspense } from 'react';
import { DiscoveryRequest } from '@/types';
import { DiscoveryView } from '@/hooks/useDiscoveryPlatform';
import { LazyLoader } from '@/components/molecules/LazyLoader';

// Lazy load components ensuring named exports are handled correctly
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

// Utility & Workflow Components - Available for specialized views or action buttons
export const InitialDisclosureWizard = lazy(() => import('./InitialDisclosureWizard'));
export const MotionToCompelBuilder = lazy(() => import('./MotionToCompelBuilder'));
export const DiscoveryStipulations = lazy(() => import('./DiscoveryStipulations'));
export const RequestForAdmission = lazy(() => import('./RequestForAdmission'));
export const Examinations = lazy(() => import('./Examinations'));
export const TranscriptManager = lazy(() => import('./TranscriptManager'));
export const VendorManagement = lazy(() => import('./VendorManagement'));
export const PerpetuateTestimony = lazy(() => import('./PerpetuateTestimony'));

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
    case 'custodians': return <Suspense fallback={<LazyLoader message="Loading custodian interviews..." />}><DiscoveryInterviews /></Suspense>;
    case 'examinations': return <Suspense fallback={<LazyLoader message="Loading examinations..." />}><Examinations /></Suspense>;
    case 'plan': return <Suspense fallback={<LazyLoader message="Loading discovery plan..." />}><DiscoveryStipulations /></Suspense>;
    default: return <DiscoveryDashboard onNavigate={onNavigate} />;
  }
};

export default DiscoveryContentRenderer;
