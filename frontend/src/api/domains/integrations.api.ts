/**
 * Integrations Domain API Services
 * PACER, webhooks, external APIs, organizations
 */

import { PACERApiService } from '../integrations/pacer-api';
import { WebhooksApiService } from '../webhooks-api';
import { IntegrationsApiService } from '../integrations-api';
import { OrganizationsApiService } from '../organizations-api';
import { ExternalAPIService } from '../external-api-api';
import { PipelinesApiService } from '../pipelines-api';

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
