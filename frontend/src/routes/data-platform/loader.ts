/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Data Platform Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { dataPlatformApi } from "@/lib/frontend-api/data-platform";
import type {
  DataSource,
  RLSPolicy,
  SavedQuery,
  SchemaInfo,
} from "./DataPlatformContext";

export interface DataPlatformLoaderData {
  sources: DataSource[];
  policies: RLSPolicy[];
  schemas: SchemaInfo[];
  queries: SavedQuery[];
}

export async function dataPlatformLoader() {
  const [sourcesRes, policiesRes, schemasRes, queriesRes] = await Promise.all([
    dataPlatformApi.dataSources.getAll(),
    dataPlatformApi.rlsPolicies.getAll(),
    dataPlatformApi.schemaManagement.getSchemas(),
    dataPlatformApi.queryWorkbench.getSavedQueries(),
  ]);

  return {
    sources: sourcesRes.ok ? (sourcesRes.data as DataSource[]) : [],
    policies: policiesRes.ok ? (policiesRes.data as RLSPolicy[]) : [],
    schemas: schemasRes.ok ? (schemasRes.data as SchemaInfo[]) : [],
    queries: queriesRes.ok ? (queriesRes.data as SavedQuery[]) : [],
  };
}
