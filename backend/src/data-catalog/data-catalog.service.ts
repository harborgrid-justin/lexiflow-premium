import { Injectable } from "@nestjs/common";
import { SchemaManagementService } from "../schema-management/schema-management.service";
import { UpdateDictionaryItemDto } from "./dto/update-dictionary-item.dto";

@Injectable()
export class DataCatalogService {
  constructor(private readonly schemaService: SchemaManagementService) {}

  async getDomains() {
    return [
      { name: "Legal", count: 120, desc: "Case and matter management data" },
      { name: "Finance", count: 45, desc: "Billing, invoicing, and expenses" },
      { name: "HR", count: 23, desc: "Employee and contractor records" },
      { name: "Operations", count: 67, desc: "System configuration and logs" },
      { name: "Security", count: 15, desc: "Audit logs and access controls" },
    ];
  }

  async getRegistryInfo() {
    return [
      {
        id: "reg_01",
        name: "Document Processor",
        type: "Service",
        status: "Active",
        version: "1.2.0",
      },
      {
        id: "reg_02",
        name: "Email Ingestion",
        type: "Agent",
        status: "Active",
        version: "2.0.1",
      },
      {
        id: "reg_03",
        name: "Search Indexer",
        type: "Worker",
        status: "Idle",
        version: "1.0.5",
      },
      {
        id: "reg_04",
        name: "Notification Service",
        type: "Service",
        status: "Active",
        version: "1.1.2",
      },
    ];
  }

  async getDataLakeItems(folderId: string) {
    const now = new Date();
    if (folderId === "root") {
      return [
        {
          id: "f_raw",
          name: "raw",
          type: "folder",
          size: "-",
          modified: now,
          path: "/raw",
        },
        {
          id: "f_processed",
          name: "processed",
          type: "folder",
          size: "-",
          modified: now,
          path: "/processed",
        },
        {
          id: "f_curated",
          name: "curated",
          type: "folder",
          size: "-",
          modified: now,
          path: "/curated",
        },
        {
          id: "f_temp",
          name: "temp",
          type: "folder",
          size: "-",
          modified: now,
          path: "/temp",
        },
      ];
    }

    // Default file list for any folder
    return [
      {
        id: `doc_${folderId}_1`,
        name: "contract_extracts.parquet",
        type: "file",
        size: "2.5MB",
        modified: now,
        path: `/${folderId}/contract_extracts.parquet`,
      },
      {
        id: `doc_${folderId}_2`,
        name: "metadata_v2.json",
        type: "file",
        size: "150KB",
        modified: now,
        path: `/${folderId}/metadata_v2.json`,
      },
      {
        id: `doc_${folderId}_3`,
        name: "audit_log_2025.csv",
        type: "file",
        size: "12MB",
        modified: now,
        path: `/${folderId}/audit_log_2025.csv`,
      },
    ];
  }

  async getLineageGraph() {
    try {
      // Try to get real tables to make the graph more realistic
      const tables = await this.schemaService.getTables();
      const nodes = tables
        .slice(0, 5)
        .map((t) => ({ id: `table_${t.name}`, label: t.name, type: "table" }));

      // Add some jobs and reports
      nodes.push({ id: "job_daily_etl", label: "Daily ETL", type: "job" });
      nodes.push({
        id: "report_executive",
        label: "Executive Dashboard",
        type: "dashboard",
      });

      const links = [];
      if (nodes.length > 0) {
        // Connect first few tables to ETL
        links.push({ source: nodes[0]!.id, target: "job_daily_etl" });
        if (nodes.length > 1)
          links.push({ source: nodes[1]!.id, target: "job_daily_etl" });

        // Connect ETL to Report
        links.push({ source: "job_daily_etl", target: "report_executive" });
      }

      return { nodes, links };
    } catch (e) {
      // Fallback
      return {
        nodes: [
          { id: "table_users", label: "users", type: "table" },
          { id: "table_cases", label: "cases", type: "table" },
          { id: "job_etl", label: "Daily ETL", type: "job" },
          { id: "report_monthly", label: "Monthly Report", type: "dashboard" },
        ],
        links: [
          { source: "table_users", target: "job_etl" },
          { source: "table_cases", target: "job_etl" },
          { source: "job_etl", target: "report_monthly" },
        ],
      };
    }
  }

  async updateDictionaryItem(id: string, updates: UpdateDictionaryItemDto) {
    // In a real application, this would persist the metadata updates to a database.
    // For now we assume success and return the echoed object.
    return {
      id,
      ...updates,
      lastUpdated: new Date(),
      status: "success",
    };
  }
}
