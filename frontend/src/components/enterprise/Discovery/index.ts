/**
 * @module enterprise/Discovery
 * @category Enterprise eDiscovery
 * @description Barrel export for enterprise eDiscovery components
 */

export { EDiscoveryDashboard } from './EDiscoveryDashboard';
export { PrivilegeLog } from './PrivilegeLog';
export { ProductionManager } from './ProductionManager';
export { EvidenceChainOfCustody } from './EvidenceChainOfCustody';
export { ExhibitOrganizer } from './ExhibitOrganizer';

// Re-export types
export type { EDiscoveryDashboardProps, Custodian, Collection, ProcessingStatus, ReviewMetrics } from './EDiscoveryDashboard';
export type { PrivilegeLogProps, PrivilegeEntry } from './PrivilegeLog';
export type { ProductionManagerProps, Production, BatesRange, Redaction, ProductionHistory } from './ProductionManager';
export type { EvidenceChainOfCustodyProps, EvidenceItem, CustodyTransfer, HandlingLog, AuthenticationRecord } from './EvidenceChainOfCustody';
export type { ExhibitOrganizerProps, Exhibit, ExhibitList } from './ExhibitOrganizer';
