/**
 * API Services Barrel Export
 * Re-exports all individual API service classes
 */

import { ApiKeysApiService } from './api/api-keys-api';
import { AuthApiService } from './api/auth-api';
import { BillingApiService } from './api/billing-api';
import { CasesApiService } from './api/cases-api';
import { CustodiansApiService } from './api/custodians-api';
import { DocketApiService } from './api/docket-api';
import { DocumentsApiService } from './api/documents-api';
import { EvidenceApiService } from './api/evidence-api';
import { ExaminationsApiService } from './api/examinations-api';
import { FeeAgreementsApiService } from './api/fee-agreements-api';
import { NotificationsApiService } from './api/notifications-api';
import { RateTablesApiService } from './api/rate-tables-api';
import { UsersApiService } from './api/users-api';
import { WebhooksApiService } from './api/webhooks-api';

export { ApiKeysApiService } from './api/api-keys-api';
export { AuthApiService } from './api/auth-api';
export { BillingApiService } from './api/billing-api';
export { CasesApiService } from './api/cases-api';
export { CustodiansApiService } from './api/custodians-api';
export { DocketApiService } from './api/docket-api';
export { DocumentsApiService } from './api/documents-api';
export { EvidenceApiService } from './api/evidence-api';
export { ExaminationsApiService } from './api/examinations-api';
export { FeeAgreementsApiService } from './api/fee-agreements-api';
export { NotificationsApiService } from './api/notifications-api';
export { RateTablesApiService } from './api/rate-tables-api';
export { UsersApiService } from './api/users-api';
export { WebhooksApiService } from './api/webhooks-api';

/**
 * Aggregated API services object for convenience
 */
export const apiServices = {
  apiKeys: new ApiKeysApiService(),
  auth: new AuthApiService(),
  billing: new BillingApiService(),
  cases: new CasesApiService(),
  custodians: new CustodiansApiService(),
  docket: new DocketApiService(),
  documents: new DocumentsApiService(),
  evidence: new EvidenceApiService(),
  examinations: new ExaminationsApiService(),
  feeAgreements: new FeeAgreementsApiService(),
  notifications: new NotificationsApiService(),
  rateTables: new RateTablesApiService(),
  users: new UsersApiService(),
  webhooks: new WebhooksApiService(),
};

/**
 * Check if backend API mode is enabled
 * @returns true if backend API should be used instead of IndexedDB
 */
export function isBackendApiEnabled(): boolean {
  // Check localStorage flag set by environment or user preference
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const storedValue = localStorage.getItem('VITE_USE_BACKEND_API');
    if (storedValue) return storedValue === 'true';
  }
  return false;
}
