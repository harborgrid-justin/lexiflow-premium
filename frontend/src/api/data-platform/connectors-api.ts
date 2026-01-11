/**
 * @module services/api/data-platform/connectors-api
 * @description Data Connectors API service
 * Handles management of data source and destination connectors
 *
 * @responsibility Manage database connections and external integrations
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/apiClient";

/**
 * Connector interface
 */
export interface Connector {
  id: string;
  name: string;
  type: "Database" | "Warehouse" | "SaaS" | "Storage";
  provider: string; // e.g., 'PostgreSQL', 'Snowflake', 'Salesforce'
  connectionString?: string;
  status: "Healthy" | "Syncing" | "Error" | "Inactive";
  lastSync?: string;
  color?: string;
  configuration?: Record<string, unknown>;
}

/**
 * Connectors API service class
 * Provides methods for managing data connectors
 */
export class ConnectorsApiService {
  /**
   * Get all connectors
   */
  async getAll(): Promise<Connector[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<Connector>>(
        "/connectors"
      );
      return response.data || [];
    } catch (error) {
      console.error("[ConnectorsApi] Error fetching connectors:", error);
      return [];
    }
  }

  /**
   * Create a new connector
   */
  async create(
    connector: Omit<Connector, "id" | "status">
  ): Promise<Connector> {
    console.log("[ConnectorsApi] Creating connector:", connector);
    // Mock implementation
    return {
      ...connector,
      id: `conn_${Date.now()}`,
      status: "Healthy",
    };
  }
}
