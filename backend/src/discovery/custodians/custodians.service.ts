import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Custodian } from './entities/custodian.entity';
import { CreateCustodianDto } from './dto/create-custodian.dto';
import { UpdateCustodianDto } from './dto/update-custodian.dto';
import { QueryCustodianDto } from './dto/query-custodian.dto';
import { validateSortField, validateSortOrder } from '../../common/utils/query-validation.util';

@Injectable()
export class CustodiansService {
  constructor(
    @InjectRepository(Custodian)
    private readonly custodianRepository: Repository<Custodian>,
  ) {}

  async create(createDto: CreateCustodianDto): Promise<Custodian> {
    const custodian = this.custodianRepository.create(createDto);
    return await this.custodianRepository.save(custodian);
  }

  async findAll(queryDto: QueryCustodianDto) {
    const {
      caseId,
      status,
      isKeyPlayer,
      isOnLegalHold,
      assignedTo,
      search,
      page = 1,
      limit = 20,
      sortBy = 'fullName',
      sortOrder = 'ASC',
    } = queryDto;

    const queryBuilder = this.custodianRepository
      .createQueryBuilder('custodian')
      .where('custodian.deletedAt IS NULL');

    if (caseId) {
      queryBuilder.andWhere('custodian.caseId = :caseId', { caseId });
    }

    if (status) {
      queryBuilder.andWhere('custodian.status = :status', { status });
    }

    if (typeof isKeyPlayer === 'boolean') {
      queryBuilder.andWhere('custodian.isKeyPlayer = :isKeyPlayer', {
        isKeyPlayer,
      });
    }

    if (typeof isOnLegalHold === 'boolean') {
      queryBuilder.andWhere('custodian.isOnLegalHold = :isOnLegalHold', {
        isOnLegalHold,
      });
    }

    if (assignedTo) {
      queryBuilder.andWhere('custodian.assignedTo = :assignedTo', {
        assignedTo,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(custodian.fullName ILIKE :search OR custodian.email ILIKE :search OR custodian.department ILIKE :search OR custodian.title ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // SQL injection protection
    const safeSortField = validateSortField('custodian', sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`custodian.${safeSortField}`, safeSortOrder);

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

  async findOne(id: string): Promise<Custodian> {
    const custodian = await this.custodianRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!custodian) {
      throw new NotFoundException(`Custodian with ID ${id} not found`);
    }

    return custodian;
  }

  async update(id: string, updateDto: UpdateCustodianDto): Promise<Custodian> {
    const custodian = await this.findOne(id);

    Object.assign(custodian, updateDto);
    custodian.updatedAt = new Date();

    return await this.custodianRepository.save(custodian);
  }

  async remove(id: string): Promise<void> {
    const custodian = await this.findOne(id);
    custodian.deletedAt = new Date();
    await this.custodianRepository.save(custodian);
  }

  async getStatistics(caseId: string) {
    const custodians = await this.custodianRepository.find({
      where: { caseId, deletedAt: IsNull() },
    });

    const stats = {
      total: custodians.length,
      byStatus: {},
      keyPlayers: 0,
      onLegalHold: 0,
      interviewed: 0,
      dataCollected: 0,
    };

    custodians.forEach((custodian) => {
      stats.byStatus[custodian.status] =
        (stats.byStatus[custodian.status] || 0) + 1;

      if (custodian.isKeyPlayer) {
        stats.keyPlayers++;
      }

      if (custodian.isOnLegalHold) {
        stats.onLegalHold++;
      }

      if (custodian.dateInterviewed) {
        stats.interviewed++;
      }

      if (custodian.dataCollectionDate) {
        stats.dataCollected++;
      }
    });

    return stats;
  }
}
