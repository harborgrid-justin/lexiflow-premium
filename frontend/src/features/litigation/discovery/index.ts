// components/discovery/index.ts

export { default as DiscoveryContentRenderer } from './DiscoveryContentRenderer';  // Re-exports: InitialDisclosureWizard, MotionToCompelBuilder, DiscoveryStipulations, RequestForAdmission, Examinations, TranscriptManager, VendorManagement, PerpetuateTestimony
export { default as DiscoveryDepositions } from './DiscoveryDepositions';
export { default as DiscoveryDocumentViewer } from './DiscoveryDocumentViewer';
export { default as DiscoveryESI } from './DiscoveryESI';
export { default as DiscoveryInterviews } from './DiscoveryInterviews';
export { default as DiscoveryPlatform } from './DiscoveryPlatform';
export { default as DiscoveryProduction } from './DiscoveryProduction';
export { default as DiscoveryProductions } from './DiscoveryProductions';
export { default as DiscoveryRequests } from './DiscoveryRequests';
export { default as DiscoveryResponse } from './DiscoveryResponse';
export { default as DiscoveryResponseModal } from './DiscoveryResponseModal';
// Removed duplicate exports - already exported by DiscoveryContentRenderer:
// export { DiscoveryStipulations } from './DiscoveryStipulations';
// export { Examinations } from './Examinations';
// export { InitialDisclosureWizard } from './InitialDisclosureWizard';
// export { MotionToCompelBuilder } from './MotionToCompelBuilder';
// export { PerpetuateTestimony } from './PerpetuateTestimony';
// export { RequestForAdmission } from './RequestForAdmission';
// export { TranscriptManager } from './TranscriptManager';
// export { VendorManagement } from './VendorManagement';
export { default as LegalHolds } from './LegalHolds';
export { default as MotionForSanctions } from './MotionForSanctions';
export { default as PrivilegeLog } from './PrivilegeLog';
export { DiscoveryErrorBoundary } from './DiscoveryErrorBoundary';
export * from './DiscoverySkeleton';
