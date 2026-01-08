import { dataPlatformApi } from "@/api/data-platform";
import {
  DataDictionaryItem,
  DataLakeItem,
  LineageLink,
  LineageNode,
  SchemaTable,
} from "@/types";

/**
 * Data Catalog Service
 * Manages data dictionary, schema tables, data lake items, and lineage graph.
 * Refactored to use Backend API (2025-12-29).
 */
export const DataCatalogService = {
  getDictionary: async (): Promise<DataDictionaryItem[]> => {
    return dataPlatformApi.dataCatalog.getDictionary();
  },

  updateItem: async (
    id: string,
    updates: Partial<DataDictionaryItem>
  ): Promise<DataDictionaryItem> => {
    return dataPlatformApi.dataCatalog.updateDictionaryItem(id, updates);
  },

  getDataDomains: async () => {
    return dataPlatformApi.dataCatalog.getDataDomains();
  },

  getSchemaTables: async (): Promise<SchemaTable[]> => {
    const tables = await dataPlatformApi.schemaManagement.getTables();
    // Map backend SchemaTable to frontend structure (adding x, y for visualization)
    return tables.map((t, i) => ({
      name: t.name,
      x: (i % 6) * 300 + 50,
      y: Math.floor(i / 6) * 350 + 50,
      columns: t.columns.map((c) => ({
        name: c.name,
        type: c.type,
        pk: c.pk,
        notNull: c.notNull,
        default: c.defaultValue,
      })),
    })) as unknown as SchemaTable[];
  },

  getRegistryInfo: async (): Promise<unknown[]> => {
    // Using backend tables as registry info source
    const tables = await dataPlatformApi.schemaManagement.getTables();
    return tables.map((t) => ({
      name: t.name,
      type: "System Table",
      records: "N/A", // Backend stats would be needed here
      size: "Unknown",
    }));
  },

  getDataLakeItems: async (
    folderId: string = "root"
  ): Promise<DataLakeItem[]> => {
    return dataPlatformApi.dataCatalog.getDataLakeItems(folderId);
  },

  getLineageGraph: async (): Promise<{
    nodes: LineageNode[];
    links: LineageLink[];
  }> => {
    return dataPlatformApi.dataCatalog.getLineageGraph();
  },
};
