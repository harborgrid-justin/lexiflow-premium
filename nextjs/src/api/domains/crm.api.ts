/**
 * CRM Domain API Services
 * Lead management and pipeline
 */

import { CrmApiService } from "../crm/crm-api";

// Export singleton instances
export const crmApi = {
  crm: new CrmApiService(),
} as const;
