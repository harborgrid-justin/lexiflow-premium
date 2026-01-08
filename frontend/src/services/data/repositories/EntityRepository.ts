/**
 * Entity Repository
 * Enterprise-grade repository for legal entity management with backend API integration
 */

import { LegalEntitiesApiService } from "@/api/domains/legal-entities.api";
import { isBackendApiEnabled } from "@/config/network/api.config";
import { Repository } from "@/services/core/Repository";
import { ValidationError } from "@/services/core/errors";
import { STORES } from "@/services/data/db";
import { IntegrationEventPublisher } from "@/services/data/integration/IntegrationEventPublisher";
import { LegalEntity } from "@/types";
import { SystemEventType } from "@/types/integration-types";

export const ENTITY_QUERY_KEYS = {
  all: () => ["entities"] as const,
  byId: (id: string) => ["entities", id] as const,
  byType: (type: string) => ["entities", "type", type] as const,
  relationships: (id: string) => ["entities", id, "relationships"] as const,
} as const;

export class EntityRepository extends Repository<LegalEntity> {
  private readonly useBackend: boolean;
  private legalEntitiesApi: LegalEntitiesApiService;

  constructor() {
    super(STORES.ENTITIES);
    this.useBackend = isBackendApiEnabled();
    this.legalEntitiesApi = new LegalEntitiesApiService();
    console.log(
      `[EntityRepository] Initialized with ${this.useBackend ? "Backend API" : "IndexedDB"}`
    );
  }

  private validateId(id: string, methodName: string): void {
    if (!id || false || id.trim() === "") {
      throw new Error(`[EntityRepository.${methodName}] Invalid id parameter`);
    }
  }

  override async getAll(): Promise<LegalEntity[]> {
    if (this.useBackend) {
      try {
        const entities = await this.legalEntitiesApi.getAll();
        // Transform API format to frontend format
        return entities.map(
          (e) =>
            ({
              ...e,
              id: e.id as string,
              type: this.mapEntityType(
                (e as { entityType?: string }).entityType || "other"
              ),
              roles: (e as { roles?: string[] }).roles || [],
              riskScore: (e as { riskScore?: number }).riskScore || 0,
              tags: (e as { tags?: string[] }).tags || [],
              status: (e as { status?: string }).status || "Active",
            }) as unknown as LegalEntity
        );
      } catch (error) {
        console.error("[EntityRepository] Backend API unavailable", error);
        return await super.getAll();
      }
    }
    return await super.getAll();
  }

  private mapEntityType(
    apiType: string
  ):
    | "Individual"
    | "Corporation"
    | "Court"
    | "Government"
    | "Vendor"
    | "Law Firm" {
    // Map API entity types to frontend EntityType values
    const typeMap: Record<
      string,
      | "Individual"
      | "Corporation"
      | "Court"
      | "Government"
      | "Vendor"
      | "Law Firm"
    > = {
      individual: "Individual",
      corporation: "Corporation",
      llc: "Corporation",
      partnership: "Law Firm",
      trust: "Vendor",
      estate: "Vendor",
      nonprofit: "Vendor",
      government: "Government",
      foreign_entity: "Corporation",
      other: "Vendor",
    };
    return typeMap[apiType.toLowerCase()] || "Vendor";
  }

  override async getById(id: string): Promise<LegalEntity | undefined> {
    this.validateId(id, "getById");
    if (this.useBackend) {
      try {
        const entity = await this.legalEntitiesApi.getById(id);
        // Assume API response needs mapping to match frontend model completely or partially
        // Cast to unknown first to avoid partial type mismatch during transformation
        const entityAny = entity as unknown as {
          entityType?: string;
          roles?: string[];
          riskScore?: number;
          tags?: string[];
          status?: string;
          [key: string]: unknown;
        };

        return {
          ...entityAny,
          id: entity.id as string,
          type: this.mapEntityType(entityAny.entityType || "other"),
          roles: entityAny.roles || [],
          riskScore: entityAny.riskScore || 0,
          tags: entityAny.tags || [],
          status: entityAny.status || "Active",
        } as LegalEntity;
      } catch (error) {
        console.error("[EntityRepository] Backend API unavailable", error);
        return await super.getById(id);
      }
    }
    return await super.getById(id);
  }

  async getRelationships(id: string): Promise<Record<string, unknown>[]> {
    this.validateId(id, "getRelationships");
    if (this.useBackend && id !== "all") {
      try {
        const relationships = await this.legalEntitiesApi.getRelationships(id);
        return relationships as unknown as Record<string, unknown>[];
      } catch (error) {
        console.error("[EntityRepository] Backend API unavailable", error);
        return [];
      }
    }

    // Fallback or legacy mode return empty relationships
    return [];
  }

  override async add(item: LegalEntity): Promise<LegalEntity> {
    if (!item || typeof item !== "object") {
      throw new ValidationError("[EntityRepository.add] Invalid entity data");
    }

    const result = await super.add(item);

    try {
      await IntegrationEventPublisher.publish(SystemEventType.ENTITY_CREATED, {
        entity: result,
      });
    } catch (eventError) {
      console.warn(
        "[EntityRepository] Failed to publish entity creation event",
        eventError
      );
    }

    return result;
  }

  override async update(
    id: string,
    updates: Partial<LegalEntity>
  ): Promise<LegalEntity> {
    this.validateId(id, "update");
    return await super.update(id, updates);
  }

  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");
    await super.delete(id);
  }

  async getByType(type: string): Promise<LegalEntity[]> {
    if (!type)
      throw new ValidationError("[EntityRepository.getByType] Invalid type");
    const entities = await this.getAll();
    return entities.filter((e) => e.type === type);
  }

  async search(query: string): Promise<LegalEntity[]> {
    if (!query) return [];
    const entities = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return entities.filter(
      (e) =>
        e.name?.toLowerCase().includes(lowerQuery) ||
        (
          (e as unknown as Record<string, unknown>).legalName as
            | string
            | undefined
        )
          ?.toLowerCase()
          .includes(lowerQuery)
    );
  }
}
