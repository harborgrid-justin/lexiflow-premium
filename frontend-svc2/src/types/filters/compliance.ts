/**
 * Compliance Domain Filter Types
 * Centralized filter interfaces for compliance API services
 */

// Ethical Wall Filters
export interface EthicalWallFilters {
  status?: 'active' | 'inactive' | 'pending_approval';
  userId?: string;
  caseId?: string;
}
