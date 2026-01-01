/**
 * Integrations Domain API Services
 * PACER, webhooks, external APIs, organizations
 */

import { PACERApiService } from '../integrations/pacer-api';
import { WebhooksApiService } from '../integrations/webhooks-api';
import { IntegrationsApiService } from '../integrations/integrations-api';
import { OrganizationsApiService } from '../integrations/organizations-api';
import { ExternalAPIService } from '../integrations/external-api-api';
import { PipelinesApiService } from '../data-platform/pipelines-api';

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
