import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Production } from './entities/production.entity';
import { CreateProductionDto } from './dto/create-production.dto';
import { UpdateProductionDto } from './dto/update-production.dto';
import { QueryProductionDto } from './dto/query-production.dto';

@Injectable()
export class ProductionsService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
  ) {}

  async create(createDto: CreateProductionDto): Promise<Production> {
    const production = this.productionRepository.create(createDto);
    return await this.productionRepository.save(production);
  }

  async findAll(queryDto: QueryProductionDto) {
    const {
      caseId,
      status,
      format,
      assignedTo,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.productionRepository
      .createQueryBuilder('production')
      .where('production.deletedAt IS NULL');

    if (caseId) {
      queryBuilder.andWhere('production.caseId = :caseId', { caseId });
    }

    if (status) {
      queryBuilder.andWhere('production.status = :status', { status });
    }

    if (format) {
      queryBuilder.andWhere('production.format = :format', { format });
    }

    if (assignedTo) {
      queryBuilder.andWhere('production.assignedTo = :assignedTo', {
        assignedTo,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(production.productionName ILIKE :search OR production.productionNumber ILIKE :search OR production.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy(`production.${sortBy}`, sortOrder);

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

  async findOne(id: string): Promise<Production> {
    const production = await this.productionRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!production) {
      throw new NotFoundException(`Production with ID ${id} not found`);
    }

    return production;
  }

  async update(
    id: string,
    updateDto: UpdateProductionDto,
  ): Promise<Production> {
    const production = await this.findOne(id);

    Object.assign(production, updateDto);
    production.updatedAt = new Date();

    return await this.productionRepository.save(production);
  }

  async remove(id: string): Promise<void> {
    const production = await this.findOne(id);
    production.deletedAt = new Date();
    await this.productionRepository.save(production);
  }

  async getStatistics(caseId: string) {
    const productions = await this.productionRepository.find({
      where: { caseId, deletedAt: null },
    });

    const stats = {
      total: productions.length,
      byStatus: {},
      byFormat: {},
      totalDocuments: 0,
      totalPages: 0,
      totalCost: 0,
    };

    productions.forEach((production) => {
      stats.byStatus[production.status] =
        (stats.byStatus[production.status] || 0) + 1;
      stats.byFormat[production.format] =
        (stats.byFormat[production.format] || 0) + 1;

      stats.totalDocuments += production.totalDocuments || 0;
      stats.totalPages += production.totalPages || 0;

      if (production.productionCost) {
        stats.totalCost += Number(production.productionCost);
      }
    });

    return stats;
  }

  async generateBatesNumbers(id: string): Promise<Production> {
    const production = await this.findOne(id);

    // This would be expanded with actual bates numbering logic
    // For now, just update the end number based on total documents
    if (production.batesStart && production.totalDocuments) {
      production.batesEnd =
        production.batesStart + production.totalDocuments - 1;
      return await this.productionRepository.save(production);
    }

    return production;
  }
}
