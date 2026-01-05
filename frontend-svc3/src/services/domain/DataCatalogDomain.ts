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
import { api, isBackendApiEnabled } from "@/api";
import { apiClient } from "@/services/infrastructure/apiClient";

export const DataCatalogService = {
  getDictionary: async (): Promise<DataDictionaryItem[]> => {
    if (isBackendApiEnabled()) {
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
    }
    return [];
  },

  updateItem: async (
    id: string,
    updates: Partial<DataDictionaryItem>
  ): Promise<DataDictionaryItem> => {
    if (isBackendApiEnabled()) {
      return apiClient.patch<DataDictionaryItem>(
        `/data-catalog/dictionary/${id}`,
        updates
      );
    }
    throw new Error("Backend API disabled");
  },

  getDataDomains: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get<{ name: string; count: number; desc: string }[]>(
        "/data-catalog/domains"
      );
    }
    return [];
  },

  getSchemaTables: async (): Promise<SchemaTable[]> => {
    if (isBackendApiEnabled()) {
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
    }
    return [];
  },

  getRegistryInfo: async (): Promise<unknown[]> => {
    if (isBackendApiEnabled()) {
      return apiClient.get("/data-catalog/registry");
    }
    return [];
  },

  getDataLakeItems: async (
    folderId: string = "root"
  ): Promise<DataLakeItem[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<DataLakeItem[]>(
          `/data-catalog/lake/${folderId}`
        );
      } catch (e) {
        console.warn("Failed to fetch data lake items", e);
        return [];
      }
    }
    return [];
  },

  getLineageGraph: async (): Promise<{
    nodes: LineageNode[];
    links: LineageLink[];
  }> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<{
          nodes: LineageNode[];
          links: LineageLink[];
        }>("/data-catalog/lineage");
      } catch (e) {
        console.warn("Failed to fetch lineage graph", e);
        return { nodes: [], links: [] };
      }
    }
    return { nodes: [], links: [] };
  },
};
