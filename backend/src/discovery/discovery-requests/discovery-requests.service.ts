import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { DiscoveryRequest } from './entities/discovery-request.entity';
import { CreateDiscoveryRequestDto } from './dto/create-discovery-request.dto';
import { UpdateDiscoveryRequestDto } from './dto/update-discovery-request.dto';
import { QueryDiscoveryRequestDto } from './dto/query-discovery-request.dto';

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

    queryBuilder.orderBy(`discoveryRequest.${sortBy}`, sortOrder);

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
      where: { id, deletedAt: null },
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
    const discoveryRequest = await this.findOne(id);

    Object.assign(discoveryRequest, updateDto);
    discoveryRequest.updatedAt = new Date();

    return await this.discoveryRequestRepository.save(discoveryRequest);
  }

  async remove(id: string): Promise<void> {
    const discoveryRequest = await this.findOne(id);
    discoveryRequest.deletedAt = new Date();
    await this.discoveryRequestRepository.save(discoveryRequest);
  }

  async getStatistics(caseId: string) {
    const requests = await this.discoveryRequestRepository.find({
      where: { caseId, deletedAt: null },
    });

    const stats = {
      total: requests.length,
      byType: {},
      byStatus: {},
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
