/**
 * Entity Repository
 * Enterprise-grade repository for legal entity management with backend API integration
 */

import {
  LegalEntitiesApiService,
  type LegalEntityApi,
} from "@/api/domains/legal-entities.api";
import { ValidationError } from "@/services/core/errors";
import { GenericRepository } from "@/services/core/factories";
import { IntegrationEventPublisher } from "@/services/data/integration/IntegrationEventPublisher";
import { type LegalEntity } from "@/types";
import { type EntityRole } from "@/types/enums";
import { SystemEventType } from "@/types/integration-types";
import { type EntityId, type MetadataRecord } from "@/types/primitives";

export const ENTITY_QUERY_KEYS = {
  all: () => ["entities"] as const,
  byId: (id: string) => ["entities", id] as const,
  byType: (type: string) => ["entities", "type", type] as const,
  relationships: (id: string) => ["entities", id, "relationships"] as const,
} as const;

export class EntityRepository extends GenericRepository<LegalEntity> {
  private legalEntitiesApi: LegalEntitiesApiService;
  protected apiService: LegalEntitiesApiService;
  protected repositoryName = "EntityRepository";

  constructor() {
    super("entities");
    this.legalEntitiesApi = new LegalEntitiesApiService();
    this.apiService = this.legalEntitiesApi;
    console.log(`[EntityRepository] Initialized with Backend API`);
  }

  private validateId(id: string, methodName: string): void {
    if (!id || id.trim() === "") {
      throw new Error(`[EntityRepository.${methodName}] Invalid id parameter`);
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
      court: "Court",
    };
    return typeMap[apiType.toLowerCase()] || "Vendor";
  }

  private mapToFrontend(entity: LegalEntityApi): LegalEntity {
    const entityAny = entity as unknown as Record<string, unknown>;

    return {
      ...entityAny,
      id: entity.id as EntityId,
      name: (entityAny["name"] as string) || "Unknown Entity",
      type: this.mapEntityType(entity.entityType || "other"),
      roles: (entityAny["roles"] as EntityRole[]) || [],
      riskScore: (entityAny["riskScore"] as number) || 0,
      tags: (entityAny["tags"] as string[]) || [],
      status: ((entity.status as string) || "Active") as
        | "Prospect"
        | "Active"
        | "Inactive"
        | "Blacklisted"
        | "Deceased",
      createdAt: entity.createdAt || new Date().toISOString(),
      updatedAt: entity.updatedAt || new Date().toISOString(),
      metadata: (entity.metadata as unknown as MetadataRecord) || {},
    };
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

  override async add(item: LegalEntity): Promise<LegalEntity> {
    if (!item || typeof item !== "object") {
      throw new ValidationError("[EntityRepository.add] Invalid entity data");
    }

    try {
      const apiItem = item as unknown as Partial<LegalEntityApi>;
      const resultApi = await this.legalEntitiesApi.create(apiItem);
      const result = this.mapToFrontend(resultApi);

      try {
        await IntegrationEventPublisher.publish(
          SystemEventType.ENTITY_CREATED,
          {
            entity: result,
          },
        );
      } catch (eventError) {
        console.warn(
          "[EntityRepository] Failed to publish entity creation event",
          eventError,
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
    updates: Partial<LegalEntity>,
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

  override async search(query: string): Promise<LegalEntity[]> {
    if (!query) return [];
    const entities = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return entities.filter(
      (e) =>
        e.name?.toLowerCase().includes(lowerQuery) ||
        (
          (e as unknown as Record<string, unknown>)["legalName"] as
            | string
            | undefined
        )
          ?.toLowerCase()
          .includes(lowerQuery),
    );
  }
}
