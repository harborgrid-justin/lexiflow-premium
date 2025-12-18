/**
 * Data Platform Domain API Services
 * Data sources, RLS policies, schema management, query workbench
 */

import { DataSourcesApiService } from '../data-sources-api';
import { RLSPoliciesApiService } from '../rls-policies-api';
import { 
  SchemaManagementApiService,
  QueryWorkbenchApiService
} from '../data-platform-api';

// Export service classes
export {
  DataSourcesApiService,
  RLSPoliciesApiService,
  SchemaManagementApiService,
  QueryWorkbenchApiService,
};

// Export singleton instances
export const dataPlatformApi = {
  dataSources: new DataSourcesApiService(),
  rlsPolicies: new RLSPoliciesApiService(),
  schemaManagement: new SchemaManagementApiService(),
  queryWorkbench: new QueryWorkbenchApiService(),
} as const;
