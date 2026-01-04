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
import { STORES, db } from "@/services/data/db";
import { delay } from "@/utils/async";
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
    const tables: SchemaTable[] = Object.values(STORES).map((name, i) => ({
      name: name as string,
      x: (i % 6) * 300 + 50,
      y: Math.floor(i / 6) * 350 + 50,
      columns: [
        { name: "id", type: "UUID", pk: true, notNull: true },
        { name: "created_at", type: "TIMESTAMP WITH TIME ZONE", notNull: true },
        { name: "updated_at", type: "TIMESTAMP WITH TIME ZONE" },
        { name: "version", type: "INTEGER", default: "1" },
      ],
    }));
    return tables;
  },

  getRegistryInfo: async (): Promise<unknown[]> => {
    const stores = Object.values(STORES);
    const info: unknown[] = [];
    for (const store of stores) {
      try {
        const count = (await db.count(store)) as number;
        info.push({
          name: store,
          type: "System Table",
          records: count,
          size: `${(count * 1.5 + 24).toFixed(1)} KB`,
        });
      } catch {
        // Store doesn't exist in IndexedDB yet - skip it
        console.debug(
          `[DataCatalog] Store "${store}" not found in IndexedDB, skipping`
        );
      }
    }
    return info;
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

  // Dynamically build lineage based on current Entity Relationships in backend
  getLineageGraph: async (): Promise<{
    nodes: LineageNode[];
    links: LineageLink[];
  }> => {
    // Note: dataPlatform API is not yet available in the integrations API
    // This will need to be updated when the API is added
    const entities: unknown[] = [];
    const relationships: unknown[] = [];

    interface EntityLike {
      id: string;
      name: string;
      type: string;
    }
    const nodes: LineageNode[] = entities.map((e: unknown) => {
      const entity = e as EntityLike;
      return {
        id: entity.id,
        label: entity.name,
        type: entity.type === "Corporation" ? "org" : "party",
      };
    });

    interface RelationshipLike {
      sourceId: string;
      targetId: string;
      weight?: number;
    }
    const links: LineageLink[] = relationships.map((r: unknown) => {
      const rel = r as RelationshipLike;
      return {
        source: rel.sourceId,
        target: rel.targetId,
        strength: rel.weight || 0.5,
      };
    });

    // Add System Nodes if empty to show structure
    if (nodes.length === 0) {
      return {
        nodes: [
          { id: "src1", label: "Salesforce CRM", type: "root" },
          { id: "stg1", label: "Raw Zone (S3)", type: "org" },
          { id: "wh1", label: "Data Warehouse", type: "org" },
          { id: "rpt1", label: "Revenue Dashboard", type: "evidence" },
        ],
        links: [
          { source: "src1", target: "stg1", strength: 0.8 },
          { source: "stg1", target: "wh1", strength: 0.8 },
          { source: "wh1", target: "rpt1", strength: 0.8 },
        ],
      };
    }

    return { nodes, links };
  },
};
