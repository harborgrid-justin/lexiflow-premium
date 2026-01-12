import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { Production } from "./entities/production.entity";
import { CreateProductionDto } from "./dto/create-production.dto";
import { UpdateProductionDto } from "./dto/update-production.dto";
import { QueryProductionDto } from "./dto/query-production.dto";
import {
  validateSortField,
  validateSortOrder,
} from "@common/utils/query-validation.util";

/**
 * ╔=================================================================================================================╗
 * ║PRODUCTIONS                                                                                                      ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class ProductionsService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>
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
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = queryDto;

    const queryBuilder = this.productionRepository
      .createQueryBuilder("production")
      .where("production.deletedAt IS NULL");

    if (caseId) {
      queryBuilder.andWhere("production.caseId = :caseId", { caseId });
    }

    if (status) {
      queryBuilder.andWhere("production.status = :status", { status });
    }

    if (format) {
      queryBuilder.andWhere("production.format = :format", { format });
    }

    if (assignedTo) {
      queryBuilder.andWhere("production.assignedTo = :assignedTo", {
        assignedTo,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        "(production.productionName ILIKE :search OR production.productionNumber ILIKE :search OR production.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // SQL injection protection
    const safeSortField = validateSortField("production", sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`production.${safeSortField}`, safeSortOrder);

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
      where: { id, deletedAt: IsNull() },
    });

    if (!production) {
      throw new NotFoundException(`Production with ID ${id} not found`);
    }

    return production;
  }

  async update(
    id: string,
    updateDto: UpdateProductionDto
  ): Promise<Production> {
    const result = await this.productionRepository
      .createQueryBuilder()
      .update(Production)
      .set({
        ...updateDto,
        updatedAt: new Date(),
      } as unknown as QueryDeepPartialEntity<Production>)
      .where("id = :id", { id })
      .andWhere("deletedAt IS NULL")
      .returning("*")
      .execute();

    if (!result.affected) {
      throw new NotFoundException(`Production with ID ${id} not found`);
    }
    const rows = result.raw as Production[];
    return rows[0] as Production;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productionRepository
      .createQueryBuilder()
      .softDelete()
      .where("id = :id", { id })
      .andWhere("deletedAt IS NULL")
      .execute();

    if (!result.affected) {
      throw new NotFoundException(`Production with ID ${id} not found`);
    }
  }

  async getStatistics(caseId: string) {
    const productions = await this.productionRepository.find({
      where: { caseId, deletedAt: IsNull() },
    });

    const stats = {
      total: productions.length,
      byStatus: {} as Record<string, number>,
      byFormat: {} as Record<string, number>,
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
