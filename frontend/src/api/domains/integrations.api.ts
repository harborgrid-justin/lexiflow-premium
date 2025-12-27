/**
 * Integrations Domain API Services
 * PACER, webhooks, external APIs, organizations
 */

import { PACERApiService } from '@/api';
import { WebhooksApiService } from '@/api';
import { IntegrationsApiService } from '@/api';
import { OrganizationsApiService } from '@/api';
import { ExternalAPIService } from '@/api';
import { PipelinesApiService } from '@/api';

// Export service classes
export {
  PACERApiService,
  WebhooksApiService,
  IntegrationsApiService,
  OrganizationsApiService,
  ExternalAPIService,
  PipelinesApiService,
};

// Export singleton instances
export const integrationsApi = {
  pacer: new PACERApiService(),
  webhooks: new WebhooksApiService(),
  integrations: new IntegrationsApiService(),
  organizations: new OrganizationsApiService(),
  externalApi: new ExternalAPIService(),
  pipelines: new PipelinesApiService(),
} as const;
