// ================================================================================
// DATA CATALOG DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → DataCatalogService → Frontend API → Backend
//
// PURPOSE:
//   - Data dictionary and metadata management
//   - Data lake discovery and cataloging
//   - Schema documentation and lineage tracking
//
// USAGE:
//   Called by DataCatalogContext and route loaders for catalog operations.
//   Never called directly from view components.
//
// ================================================================================

import {
  DataDictionaryItem,
  DataLakeItem,
  LineageLink,
  LineageNode,
  SchemaTable,
} from "@/types";
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { api } from "@/lib/frontend-api";
import { apiClient } from "@/services/infrastructure/api-client.service";

export const DataCatalogService = {
  getDictionary: async (): Promise<DataDictionaryItem[]> => {
    try {
      const tables = await api.schemaManagement.getTables();
      const dictionary: DataDictionaryItem[] = [];
      tables.forEach((table) => {
        table.columns.forEach((col) => {
          dictionary.push({
            id: `${table.name}-${col.name}`,
            table: table.name,
            column: col.name,
            dataType: col.type,
            description: "Imported from schema",
            classification: "Internal",
            isPII: false,
            domain: "System",
            owner: "System",
            sourceSystem: "PostgreSQL",
            dataQualityScore: 100,
          });
        });
      });
      return dictionary;
    } catch (e) {
      console.warn("Failed to fetch dictionary", e);
      return [];
    }
  },

  updateItem: async (
    id: string,
    updates: Partial<DataDictionaryItem>
  ): Promise<DataDictionaryItem> => {
    return apiClient.patch<DataDictionaryItem>(
      `/data-catalog/dictionary/${id}`,
      updates
    );
  },

  getDataDomains: async () => {
    return apiClient.get<{ name: string; count: number; desc: string }[]>(
      "/data-catalog/domains"
    );
  },

  getSchemaTables: async (): Promise<SchemaTable[]> => {
    try {
      const tables = await api.schemaManagement.getTables();
      // Add layout coordinates
      return tables.map((table, i) => ({
        ...table,
        x: (i % 6) * 300 + 50,
        y: Math.floor(i / 6) * 350 + 50,
      }));
    } catch (e) {
      console.warn("Failed to fetch schema tables", e);
      return [];
    }
  },

  getRegistryInfo: async (): Promise<unknown[]> => {
    return apiClient.get("/data-catalog/registry");
  },

  getDataLakeItems: async (
    folderId: string = "root"
  ): Promise<DataLakeItem[]> => {
    try {
      return await apiClient.get<DataLakeItem[]>(
        `/data-catalog/lake/${folderId}`
      );
    } catch (e) {
      console.warn("Failed to fetch data lake items", e);
      return [];
    }
  },

  getLineageGraph: async (): Promise<{
    nodes: LineageNode[];
    links: LineageLink[];
  }> => {
    return apiClient.get<{
      nodes: LineageNode[];
      links: LineageLink[];
    }>("/data-catalog/lineage");
  },
};
