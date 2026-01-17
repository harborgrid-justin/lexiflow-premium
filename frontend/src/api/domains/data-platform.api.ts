/**
 * Data Platform Domain API Services
 * Data sources, RLS policies, schema management, query workbench
 */

import { DataSourcesApiService } from '../data-platform/data-sources-api';
import { QueryWorkbenchApiService } from '../data-platform/query-workbench-api';
import { RLSPoliciesApiService } from '../data-platform/rls-policies-api';
import { SchemaManagementApiService } from '../data-platform/schema-management-api';

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
