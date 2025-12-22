import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Deposition } from './entities/deposition.entity';
import { CreateDepositionDto } from './dto/create-deposition.dto';
import { UpdateDepositionDto } from './dto/update-deposition.dto';
import { QueryDepositionDto } from './dto/query-deposition.dto';
import { validateSortField, validateSortOrder } from '../../common/utils/query-validation.util';

@Injectable()
export class DepositionsService {
  constructor(
    @InjectRepository(Deposition)
    private readonly depositionRepository: Repository<Deposition>,
  ) {}

  async create(createDto: CreateDepositionDto): Promise<Deposition> {
    const deposition = this.depositionRepository.create(createDto);
    return await this.depositionRepository.save(deposition);
  }

  async findAll(queryDto: QueryDepositionDto) {
    const {
      caseId,
      method,
      status,
      assignedAttorney,
      search,
      page = 1,
      limit = 20,
      sortBy = 'scheduledDate',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.depositionRepository
      .createQueryBuilder('deposition')
      .where('deposition.deletedAt IS NULL');

    if (caseId) {
      queryBuilder.andWhere('deposition.caseId = :caseId', { caseId });
    }

    if (method) {
      queryBuilder.andWhere('deposition.method = :method', { method });
    }

    if (status) {
      queryBuilder.andWhere('deposition.status = :status', { status });
    }

    if (assignedAttorney) {
      queryBuilder.andWhere('deposition.assignedAttorney = :assignedAttorney', {
        assignedAttorney,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(deposition.deponentName ILIKE :search OR deposition.deponentOrganization ILIKE :search OR deposition.location ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // SQL injection protection
    const safeSortField = validateSortField('deposition', sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`deposition.${safeSortField}`, safeSortOrder);

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

  async findOne(id: string): Promise<Deposition> {
    const deposition = await this.depositionRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!deposition) {
      throw new NotFoundException(`Deposition with ID ${id} not found`);
    }

    return deposition;
  }

  async update(
    id: string,
    updateDto: UpdateDepositionDto,
  ): Promise<Deposition> {
    const deposition = await this.findOne(id);

    Object.assign(deposition, updateDto);
    deposition.updatedAt = new Date();

    return await this.depositionRepository.save(deposition);
  }

  async remove(id: string): Promise<void> {
    const deposition = await this.findOne(id);
    deposition.deletedAt = new Date();
    await this.depositionRepository.save(deposition);
  }

  async getUpcoming(caseId: string, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const depositions = await this.depositionRepository
      .createQueryBuilder('deposition')
      .where('deposition.caseId = :caseId', { caseId })
      .andWhere('deposition.deletedAt IS NULL')
      .andWhere('deposition.scheduledDate >= :now', { now: new Date() })
      .andWhere('deposition.scheduledDate <= :futureDate', { futureDate })
      .orderBy('deposition.scheduledDate', 'ASC')
      .getMany();

    return depositions;
  }

  async getStatistics(caseId: string) {
    const depositions = await this.depositionRepository.find({
      where: { caseId, deletedAt: IsNull() },
    });

    const stats = {
      total: depositions.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalCost: 0,
      transcriptsPending: 0,
      upcoming: 0,
    };

    const now = new Date();

    depositions.forEach((deposition) => {
      stats.byType[deposition.method] = (stats.byType[deposition.method] || 0) + 1;
      stats.byStatus[deposition.status] =
        (stats.byStatus[deposition.status] || 0) + 1;

      if (deposition.estimatedCost) {
        stats.totalCost += Number(deposition.estimatedCost);
      }

      // if (deposition.isTranscriptOrdered && !deposition.transcriptReceivedDate) {
      //   stats.transcriptsPending++;
      // }

      if (deposition.scheduledDate && new Date(deposition.scheduledDate) > now) {
        stats.upcoming++;
      }
    });

    return stats;
  }
}
