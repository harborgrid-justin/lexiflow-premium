/**
 * @module services/api/data-platform/data-catalog-api
 * @description Data Catalog API Service
 * Handles data dictionary, data lineage, and data lake browsing
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import {
  DataDictionaryItem,
  DataLakeItem,
  LineageLink,
  LineageNode,
} from "@/types";

export interface DataDomain {
  name: string;
  count: number;
  desc: string;
}

export interface LineageGraph {
  nodes: LineageNode[];
  links: LineageLink[];
}

export class DataCatalogApiService {
  private readonly baseUrl = "/data-catalog";

  /**
   * Get data dictionary items
   */
  async getDictionary(): Promise<DataDictionaryItem[]> {
    return apiClient.get<DataDictionaryItem[]>(`${this.baseUrl}/dictionary`);
  }

  /**
   * Update data dictionary item
   */
  async updateDictionaryItem(
    id: string,
    updates: Partial<DataDictionaryItem>
  ): Promise<DataDictionaryItem> {
    return apiClient.patch<DataDictionaryItem>(
      `${this.baseUrl}/dictionary/${id}`,
      updates
    );
  }

  /**
   * Get data domains summary
   */
  async getDataDomains(): Promise<DataDomain[]> {
    return apiClient.get<DataDomain[]>(`${this.baseUrl}/domains`);
  }

  /**
   * Get data lake items (files/folders)
   */
  async getDataLakeItems(folderId: string = "root"): Promise<DataLakeItem[]> {
    return apiClient.get<DataLakeItem[]>(`${this.baseUrl}/data-lake`, {
      params: { folderId },
    });
  }

  /**
   * Get lineage graph
   */
  async getLineageGraph(): Promise<LineageGraph> {
    return apiClient.get<LineageGraph>(`${this.baseUrl}/lineage`);
  }
}
