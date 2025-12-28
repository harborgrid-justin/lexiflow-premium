import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalEntity, LegalEntityType, LegalEntityStatus } from './entities/legal-entity.entity';
import { CreateLegalEntityDto, UpdateLegalEntityDto } from './dto/legal-entity.dto';

interface LegalEntityFilters {
  entityType?: string;
  status?: string;
  jurisdiction?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface LegalEntityRelationshipExtended extends Record<string, unknown> {
  sourceEntityId: string;
  sourceEntityName: string;
}

interface LegalEntityStats {
  total: number;
  active: number;
  corporations: number;
  individuals: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class LegalEntitiesService {
  constructor(
    @InjectRepository(LegalEntity)
    private readonly legalEntityRepository: Repository<LegalEntity>,
  ) {}

  async findAll(filters?: LegalEntityFilters): Promise<PaginatedResult<LegalEntity>> {
    const { entityType, status, jurisdiction, search, page = 1, limit = 100 } = filters || {};
    
    const queryBuilder = this.legalEntityRepository.createQueryBuilder('entity');

    if (entityType) {
      queryBuilder.andWhere('entity.entityType = :entityType', { entityType });
    }

    if (status) {
      queryBuilder.andWhere('entity.status = :status', { status });
    }

    if (jurisdiction) {
      queryBuilder.andWhere('entity.jurisdiction = :jurisdiction', { jurisdiction });
    }

    if (search) {
      queryBuilder.andWhere(
        '(entity.name ILIKE :search OR entity.fullLegalName ILIKE :search OR entity.taxId ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('entity.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<LegalEntity> {
    const entity = await this.legalEntityRepository.findOne({ where: { id } });
    
    if (!entity) {
      throw new NotFoundException(`Legal entity with ID ${id} not found`);
    }

    return entity;
  }

  async create(createDto: CreateLegalEntityDto): Promise<LegalEntity> {
    const entity = this.legalEntityRepository.create(createDto);
    return await this.legalEntityRepository.save(entity);
  }

  async update(id: string, updateDto: UpdateLegalEntityDto): Promise<LegalEntity> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.legalEntityRepository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.legalEntityRepository.remove(entity);
  }

  async getRelationships(id: string): Promise<Record<string, unknown>[]> {
    const entity = await this.findOne(id);
    return entity.relationships || [];
  }

  async getAllRelationships(): Promise<LegalEntityRelationshipExtended[]> {
    // Get all entities and aggregate their relationships
    const entities = await this.legalEntityRepository.find();
    const allRelationships = entities.flatMap(entity =>
      (entity.relationships || []).map(rel => ({
        ...rel,
        sourceEntityId: entity.id,
        sourceEntityName: entity.name
      }))
    );
    return allRelationships;
  }

  async getStats(): Promise<LegalEntityStats> {
    const total = await this.legalEntityRepository.count();
    const active = await this.legalEntityRepository.count({ where: { status: LegalEntityStatus.ACTIVE } });
    const corporations = await this.legalEntityRepository.count({ where: { entityType: LegalEntityType.CORPORATION } });
    const individuals = await this.legalEntityRepository.count({ where: { entityType: LegalEntityType.INDIVIDUAL } });

    return {
      total,
      active,
      corporations,
      individuals,
    };
  }
}
