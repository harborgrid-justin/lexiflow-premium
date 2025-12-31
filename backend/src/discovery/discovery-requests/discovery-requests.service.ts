import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull} from 'typeorm';
import { DiscoveryRequest } from './entities/discovery-request.entity';
import { CreateDiscoveryRequestDto } from './dto/create-discovery-request.dto';
import { UpdateDiscoveryRequestDto } from './dto/update-discovery-request.dto';
import { QueryDiscoveryRequestDto } from './dto/query-discovery-request.dto';
import { validateSortField, validateSortOrder } from '@common/utils/query-validation.util';

/**
 * ╔=================================================================================================================╗
 * ║DISCOVERYREQUESTS                                                                                                ║
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
export class DiscoveryRequestsService {
  constructor(
    @InjectRepository(DiscoveryRequest)
    private readonly discoveryRequestRepository: Repository<DiscoveryRequest>,
  ) {}

  async create(
    createDto: CreateDiscoveryRequestDto,
  ): Promise<DiscoveryRequest> {
    const discoveryRequest = this.discoveryRequestRepository.create(createDto);
    return await this.discoveryRequestRepository.save(discoveryRequest);
  }

  async findAll(queryDto: QueryDiscoveryRequestDto) {
    const {
      caseId,
      type,
      status,
      assignedTo,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.discoveryRequestRepository
      .createQueryBuilder('discoveryRequest')
      .where('discoveryRequest.deletedAt IS NULL');

    if (caseId) {
      queryBuilder.andWhere('discoveryRequest.caseId = :caseId', { caseId });
    }

    if (type) {
      queryBuilder.andWhere('discoveryRequest.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('discoveryRequest.status = :status', { status });
    }

    if (assignedTo) {
      queryBuilder.andWhere('discoveryRequest.assignedTo = :assignedTo', {
        assignedTo,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(discoveryRequest.title ILIKE :search OR discoveryRequest.description ILIKE :search OR discoveryRequest.requestNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // SQL injection protection
    const safeSortField = validateSortField('discoveryRequest', sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`discoveryRequest.${safeSortField}`, safeSortOrder);

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

  async findOne(id: string): Promise<DiscoveryRequest> {
    const discoveryRequest = await this.discoveryRequestRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!discoveryRequest) {
      throw new NotFoundException(
        `Discovery request with ID ${id} not found`,
      );
    }

    return discoveryRequest;
  }

  async update(
    id: string,
    updateDto: UpdateDiscoveryRequestDto,
  ): Promise<DiscoveryRequest> {
    const result = await this.discoveryRequestRepository
      .createQueryBuilder()
      .update(DiscoveryRequest)
      .set({ ...updateDto, updatedAt: new Date() } as any)
      .where('id = :id', { id })
      .andWhere('deletedAt IS NULL')
      .returning('*')
      .execute();

    if (!result.affected) {
      throw new NotFoundException(
        `Discovery request with ID ${id} not found`,
      );
    }
    return result.raw[0];
  }

  async remove(id: string): Promise<void> {
    const result = await this.discoveryRequestRepository
      .createQueryBuilder()
      .softDelete()
      .where('id = :id', { id })
      .andWhere('deletedAt IS NULL')
      .execute();

    if (!result.affected) {
      throw new NotFoundException(
        `Discovery request with ID ${id} not found`,
      );
    }
  }

  async getStatistics(caseId: string) {
    const requests = await this.discoveryRequestRepository.find({
      where: { caseId, deletedAt: IsNull() },
    });

    const stats = {
      total: requests.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      overdue: 0,
      dueThisWeek: 0,
    };

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    requests.forEach((request) => {
      // Count by type
      stats.byType[request.type] = (stats.byType[request.type] || 0) + 1;

      // Count by status
      stats.byStatus[request.status] =
        (stats.byStatus[request.status] || 0) + 1;

      // Check if overdue
      if (request.dueDate && new Date(request.dueDate) < now) {
        stats.overdue++;
      }

      // Check if due this week
      if (
        request.dueDate &&
        new Date(request.dueDate) >= now &&
        new Date(request.dueDate) <= weekFromNow
      ) {
        stats.dueThisWeek++;
      }
    });

    return stats;
  }
}
