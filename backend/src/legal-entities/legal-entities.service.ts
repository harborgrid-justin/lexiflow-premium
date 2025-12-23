import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalEntity } from './entities/legal-entity.entity';
import { CreateLegalEntityDto, UpdateLegalEntityDto } from './dto/legal-entity.dto';

@Injectable()
export class LegalEntitiesService {
  constructor(
    @InjectRepository(LegalEntity)
    private readonly legalEntityRepository: Repository<LegalEntity>,
  ) {}

  async findAll(filters?: {
    entityType?: string;
    status?: string;
    jurisdiction?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
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

  async getRelationships(id: string) {
    const entity = await this.findOne(id);
    return entity.relationships || [];
  }

  async getAllRelationships() {
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

  async getStats() {
    const total = await this.legalEntityRepository.count();
    const active = await this.legalEntityRepository.count({ where: { status: 'active' as any } });
    const corporations = await this.legalEntityRepository.count({ where: { entityType: 'corporation' as any } });
    const individuals = await this.legalEntityRepository.count({ where: { entityType: 'individual' as any } });

    return {
      total,
      active,
      corporations,
      individuals,
    };
  }
}
