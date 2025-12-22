// components/discovery/index.ts

export * from './DiscoveryContentRenderer';  // Re-exports: InitialDisclosureWizard, MotionToCompelBuilder, DiscoveryStipulations, RequestForAdmission, Examinations, TranscriptManager, VendorManagement, PerpetuateTestimony
export * from './DiscoveryDepositions';
export * from './DiscoveryDocumentViewer';
export * from './DiscoveryESI';
export * from './DiscoveryInterviews';
export * from './DiscoveryPlatform';
export * from './DiscoveryProduction';
export * from './DiscoveryProductions';
export * from './DiscoveryRequests';
export * from './DiscoveryResponse';
export * from './DiscoveryResponseModal';
// Removed duplicate exports - already exported by DiscoveryContentRenderer:
// export * from './DiscoveryStipulations';
// export * from './Examinations';
// export * from './InitialDisclosureWizard';
// export * from './MotionToCompelBuilder';
// export * from './PerpetuateTestimony';
// export * from './RequestForAdmission';
// export * from './TranscriptManager';
// export * from './VendorManagement';
export * from './LegalHolds';
export * from './MotionForSanctions';
export * from './PrivilegeLog';
export * from './DiscoveryErrorBoundary';
export * from './DiscoverySkeleton';
