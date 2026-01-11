/**
 * Entity Repository
 * Enterprise-grade repository for legal entity management with backend API integration
 */

import {
  LegalEntitiesApiService,
  LegalEntityApi,
} from "@/api/domains/legal-entities.api";
import { Repository } from "@/services/core/Repository";
import { ValidationError } from "@/services/core/errors";
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
  private legalEntitiesApi: LegalEntitiesApiService;

  constructor() {
    super("entities");
    this.legalEntitiesApi = new LegalEntitiesApiService();
    console.log(`[EntityRepository] Initialized with Backend API`);
  }

  private validateId(id: string, methodName: string): void {
    if (!id || id.trim() === "") {
      throw new Error(`[EntityRepository.${methodName}] Invalid id parameter`);
    }
  }

  override async getAll(): Promise<LegalEntity[]> {
    try {
      const entities = await this.legalEntitiesApi.getAll();
      return entities.map((e) => this.mapToFrontend(e));
    } catch (error) {
      console.error("[EntityRepository] Backend API error", error);
      throw error;
    }
  }

  private mapEntityType(apiType: string): LegalEntity["type"] {
    const typeMap: Record<string, LegalEntity["type"]> = {
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
      court: "Court", // Added based on inference
    };
    return typeMap[apiType.toLowerCase()] || "Vendor";
  }

  private mapToFrontend(entity: LegalEntityApi): LegalEntity {
    // Explicitly cast to an intermediate type that matches our spread assumptions
    const entityAny = entity as unknown as Record<string, unknown>;

    return {
      ...entityAny,
      id: entity.id,
      name: (entityAny.name as string) || "Unknown Entity",
      type: this.mapEntityType(entity.entityType || "other"),
      roles: (entityAny.roles as string[]) || [],
      riskScore: (entityAny.riskScore as number) || 0,
      tags: (entityAny.tags as string[]) || [],
      status: entity.status || "Active",
      createdAt: entity.createdAt || new Date().toISOString(),
      updatedAt: entity.updatedAt || new Date().toISOString(),
      userId: entity.userId || "system",
      metadata: (entity.metadata as Record<string, unknown>) || {},
    } as LegalEntity;
  }

  override async getById(id: string): Promise<LegalEntity | undefined> {
    this.validateId(id, "getById");
    try {
      const entity = await this.legalEntitiesApi.getById(id);
      return this.mapToFrontend(entity);
    } catch (error) {
      console.error("[EntityRepository] Backend API error", error);
      throw error;
    }
  }

  async getRelationships(id: string): Promise<Record<string, unknown>[]> {
    this.validateId(id, "getRelationships");
    if (id !== "all") {
      try {
        const relationships = await this.legalEntitiesApi.getRelationships(id);
        return relationships as unknown as Record<string, unknown>[];
      } catch (error) {
        console.error("[EntityRepository] Backend API error", error);
        return [];
      }
    }
    return [];
  }

  override async add(item: LegalEntity): Promise<LegalEntity> {
    if (!item || typeof item !== "object") {
      throw new ValidationError("[EntityRepository.add] Invalid entity data");
    }

    try {
      const apiItem = item as unknown as Partial<LegalEntityApi>;
      // Simplified mapping (direct cast) for now, assuming BE handles flexibility or item matches reasonably well.
      // Ideally should map types back to enums.

      const resultApi = await this.legalEntitiesApi.create(apiItem);
      const result = this.mapToFrontend(resultApi);

      try {
        await IntegrationEventPublisher.publish(
          SystemEventType.ENTITY_CREATED,
          {
            entity: result,
          }
        );
      } catch (eventError) {
        console.warn(
          "[EntityRepository] Failed to publish entity creation event",
          eventError
        );
      }
      return result;
    } catch (error) {
      console.error("[EntityRepository] Backend API error", error);
      throw error;
    }
  }

  override async update(
    id: string,
    updates: Partial<LegalEntity>
  ): Promise<LegalEntity> {
    this.validateId(id, "update");
    try {
      const apiUpdates = updates as unknown as Partial<LegalEntityApi>;
      const resultApi = await this.legalEntitiesApi.update(id, apiUpdates);
      return this.mapToFrontend(resultApi);
    } catch (error) {
      console.error("[EntityRepository] Backend API error", error);
      throw error;
    }
  }

  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");
    try {
      await this.legalEntitiesApi.delete(id);
    } catch (error) {
      console.error("[EntityRepository] Backend API error", error);
      throw error;
    }
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
