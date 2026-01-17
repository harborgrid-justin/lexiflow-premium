/**
 * ? Migrated to backend API (2025-12-21)
 */
import { api } from "@/lib/frontend-api";
import { apiClient } from "@/services/infrastructure/apiClient";
import {
  type DataDictionaryItem,
  type DataLakeItem,
  type LineageLink,
  type LineageNode,
  type SchemaTable,
} from "@/types";

type ApiSchemaTable = {
  name: string;
  columns: Array<{ name: string; type: string; nullable?: boolean }>;
};

export const DataCatalogService = {
  getDictionary: async (): Promise<DataDictionaryItem[]> => {
    try {
      const tables =
        (await api.schemaManagement.getTables()) as ApiSchemaTable[];
      const dictionary: DataDictionaryItem[] = [];
      tables.forEach((table: ApiSchemaTable) => {
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
    updates: Partial<DataDictionaryItem>,
  ): Promise<DataDictionaryItem> => {
    return apiClient.patch<DataDictionaryItem>(
      `/data-catalog/dictionary/${id}`,
      updates,
    );
  },

  getDataDomains: async () => {
    return apiClient.get<{ name: string; count: number; desc: string }[]>(
      "/data-catalog/domains",
    );
  },

  getSchemaTables: async (): Promise<SchemaTable[]> => {
    try {
      const tables =
        (await api.schemaManagement.getTables()) as ApiSchemaTable[];
      // Add layout coordinates
      return tables.map((table: ApiSchemaTable, i: number) => ({
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
    folderId: string = "root",
  ): Promise<DataLakeItem[]> => {
    try {
      return await apiClient.get<DataLakeItem[]>(
        `/data-catalog/lake/${folderId}`,
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
