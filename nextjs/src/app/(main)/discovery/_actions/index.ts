/**
 * Discovery Actions - Barrel Export
 * Re-exports all server actions for the discovery module
 *
 * @module discovery/_actions
 */

// Discovery Request Actions
export {
  getDiscoveryRequests,
  getDiscoveryRequest,
  createDiscoveryRequest,
  updateDiscoveryRequest,
  deleteDiscoveryRequest,
  respondToDiscoveryRequest,
  serveDiscoveryRequest,
  fileDiscoveryMotion,
  getDiscoveryStatistics,
} from './discovery-actions';

// Custodian & Legal Hold Actions
export {
  getCustodians,
  getCustodian,
  createCustodian,
  updateCustodian,
  deleteCustodian,
  acknowledgeLegalHold,
  recordCustodianInterview,
  getLegalHolds,
  getLegalHold,
  createLegalHold,
  releaseLegalHold,
  sendLegalHoldReminder,
  addCustodiansToHold,
} from './custodian-actions';

// Document Review Actions
export {
  getCollections,
  createCollection,
  startCollection,
  pauseCollection,
  searchDocuments,
  getReviewDocument,
  updateReviewStatus,
  updateDocumentCoding,
  addDocumentTags,
  addDocumentNotes,
  bulkUpdateDocuments,
  uploadDocuments,
  getDocumentContent,
} from './document-actions';

// Production Actions
export {
  getProductionSets,
  getProductionSet,
  createProductionSet,
  updateProductionStatus,
  addDocumentsToProduction,
  removeDocumentsFromProduction,
  generateBatesNumbers,
  runProductionQC,
  exportProduction,
  deleteProductionSet,
  getPrivilegeLog,
  addPrivilegeLogEntry,
  exportPrivilegeLog,
} from './production-actions';
