import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ESISource } from './entities/esi-source.entity';
import { CreateESISourceDto } from './dto/create-esi-source.dto';
import { UpdateESISourceDto } from './dto/update-esi-source.dto';
import { QueryESISourceDto } from './dto/query-esi-source.dto';
import { validateSortField, validateSortOrder } from '../../common/utils/query-validation.util';

@Injectable()
export class ESISourcesService {
  constructor(
    @InjectRepository(ESISource)
    private readonly esiSourceRepository: Repository<ESISource>,
  ) {}

  async create(createDto: CreateESISourceDto): Promise<ESISource> {
    const esiSource = this.esiSourceRepository.create(createDto);
    return await this.esiSourceRepository.save(esiSource);
  }

  async findAll(queryDto: QueryESISourceDto) {
    const {
      caseId,
      sourceType,
      status,
      custodianId,
      assignedTo,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.esiSourceRepository
      .createQueryBuilder('esiSource')
      .where('esiSource.deletedAt IS NULL');

    if (caseId) {
      queryBuilder.andWhere('esiSource.caseId = :caseId', { caseId });
    }

    if (sourceType) {
      queryBuilder.andWhere('esiSource.sourceType = :sourceType', {
        sourceType,
      });
    }

    if (status) {
      queryBuilder.andWhere('esiSource.status = :status', { status });
    }

    if (custodianId) {
      queryBuilder.andWhere('esiSource.custodianId = :custodianId', {
        custodianId,
      });
    }

    if (assignedTo) {
      queryBuilder.andWhere('esiSource.assignedTo = :assignedTo', {
        assignedTo,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(esiSource.sourceName ILIKE :search OR esiSource.description ILIKE :search OR esiSource.location ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // SQL injection protection
    const safeSortField = validateSortField('esiSource', sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`esiSource.${safeSortField}`, safeSortOrder);

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ESISource> {
    const esiSource = await this.esiSourceRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!esiSource) {
      throw new NotFoundException(`ESI Source with ID ${id} not found`);
    }

    return esiSource;
  }

  async update(id: string, updateDto: UpdateESISourceDto): Promise<ESISource> {
    const result = await this.esiSourceRepository
      .createQueryBuilder()
      .update(ESISource)
      .set({ ...updateDto, updatedAt: new Date() })
      .where('id = :id', { id })
      .andWhere('deletedAt IS NULL')
      .returning('*')
      .execute();

    if (!result.affected) {
      throw new NotFoundException(`ESI Source with ID ${id} not found`);
    }
    return result.raw[0];
  }

  async remove(id: string): Promise<void> {
    const result = await this.esiSourceRepository
      .createQueryBuilder()
      .softDelete()
      .where('id = :id', { id })
      .andWhere('deletedAt IS NULL')
      .execute();

    if (!result.affected) {
      throw new NotFoundException(`ESI Source with ID ${id} not found`);
    }
  }

  async getStatistics(caseId: string) {
    const sources = await this.esiSourceRepository.find({
      where: { caseId, deletedAt: IsNull() },
    });

    const stats = {
      total: sources.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalVolume: 0,
      totalCost: 0,
      encrypted: 0,
      requiresSpecialProcessing: 0,
    };

    sources.forEach((source) => {
      stats.byType[source.sourceType] =
        (stats.byType[source.sourceType] || 0) + 1;
      stats.byStatus[source.status] = (stats.byStatus[source.status] || 0) + 1;

      if (source.actualVolume) {
        stats.totalVolume += Number(source.actualVolume);
      }

      if (source.collectionCost) {
        stats.totalCost += Number(source.collectionCost);
      }

      if (source.processingCost) {
        stats.totalCost += Number(source.processingCost);
      }

      if (source.isEncrypted) {
        stats.encrypted++;
      }

      if (source.requiresSpecialProcessing) {
        stats.requiresSpecialProcessing++;
      }
    });

    return stats;
  }
}
