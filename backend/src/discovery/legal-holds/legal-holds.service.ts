import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalHold, LegalHoldStatus } from './entities/legal-hold.entity';
import { CreateLegalHoldDto } from './dto/create-legal-hold.dto';
import { UpdateLegalHoldDto } from './dto/update-legal-hold.dto';
import { QueryLegalHoldDto } from './dto/query-legal-hold.dto';
import { ReleaseLegalHoldDto } from './dto/release-legal-hold.dto';
import { validateSortField, validateSortOrder } from '../../../common/utils/query-validation.util';

@Injectable()
export class LegalHoldsService {
  constructor(
    @InjectRepository(LegalHold)
    private readonly legalHoldRepository: Repository<LegalHold>,
  ) {}

  async create(createDto: CreateLegalHoldDto): Promise<LegalHold> {
    const legalHold = this.legalHoldRepository.create({
      ...createDto,
      totalCustodians: createDto.custodians?.length || 0,
      pendingCount: createDto.custodians?.length || 0,
      acknowledgedCount: 0,
    });
    return await this.legalHoldRepository.save(legalHold);
  }

  async findAll(queryDto: QueryLegalHoldDto) {
    const {
      caseId,
      status,
      issuedBy,
      search,
      page = 1,
      limit = 20,
      sortBy = 'issueDate',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.legalHoldRepository
      .createQueryBuilder('legalHold')
      .where('legalHold.deletedAt IS NULL');

    if (caseId) {
      queryBuilder.andWhere('legalHold.caseId = :caseId', { caseId });
    }

    if (status) {
      queryBuilder.andWhere('legalHold.status = :status', { status });
    }

    if (issuedBy) {
      queryBuilder.andWhere('legalHold.issuedBy = :issuedBy', { issuedBy });
    }

    if (search) {
      queryBuilder.andWhere(
        '(legalHold.holdName ILIKE :search OR legalHold.holdNumber ILIKE :search OR legalHold.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // SQL injection protection
    const safeSortField = validateSortField('legalHold', sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`legalHold.${safeSortField}`, safeSortOrder);

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

  async findOne(id: string): Promise<LegalHold> {
    const legalHold = await this.legalHoldRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!legalHold) {
      throw new NotFoundException(`Legal hold with ID ${id} not found`);
    }

    return legalHold;
  }

  async update(id: string, updateDto: UpdateLegalHoldDto): Promise<LegalHold> {
    const legalHold = await this.findOne(id);

    Object.assign(legalHold, updateDto);
    legalHold.updatedAt = new Date();

    // Recalculate custodian counts if custodians array is updated
    if (updateDto.custodians) {
      legalHold.totalCustodians = updateDto.custodians.length;
      legalHold.acknowledgedCount = updateDto.custodians.filter(
        (c) => c.acknowledgedDate,
      ).length;
      legalHold.pendingCount =
        legalHold.totalCustodians - legalHold.acknowledgedCount;
    }

    return await this.legalHoldRepository.save(legalHold);
  }

  async release(id: string, releaseDto: ReleaseLegalHoldDto): Promise<LegalHold> {
    const legalHold = await this.findOne(id);

    if (legalHold.status === LegalHoldStatus.RELEASED) {
      throw new BadRequestException('Legal hold is already released');
    }

    legalHold.status = LegalHoldStatus.RELEASED;
    legalHold.releaseDate = new Date(releaseDto.releaseDate);
    legalHold.releaseReason = releaseDto.releaseReason;
    legalHold.releaseNotes = releaseDto.releaseNotes;
    legalHold.releasedBy = releaseDto.releasedBy;
    legalHold.updatedAt = new Date();

    return await this.legalHoldRepository.save(legalHold);
  }

  async remove(id: string): Promise<void> {
    const legalHold = await this.findOne(id);
    legalHold.deletedAt = new Date();
    await this.legalHoldRepository.save(legalHold);
  }

  async getStatistics(caseId: string) {
    const holds = await this.legalHoldRepository.find({
      where: { caseId, deletedAt: null },
    });

    const stats = {
      total: holds.length,
      byStatus: {},
      totalCustodians: 0,
      totalAcknowledged: 0,
      totalPending: 0,
      activeHolds: 0,
      releasedHolds: 0,
    };

    holds.forEach((hold) => {
      stats.byStatus[hold.status] = (stats.byStatus[hold.status] || 0) + 1;
      stats.totalCustodians += hold.totalCustodians || 0;
      stats.totalAcknowledged += hold.acknowledgedCount || 0;
      stats.totalPending += hold.pendingCount || 0;

      if (hold.status === LegalHoldStatus.ACTIVE) {
        stats.activeHolds++;
      } else if (hold.status === LegalHoldStatus.RELEASED) {
        stats.releasedHolds++;
      }
    });

    return stats;
  }

  async getPendingReminders(): Promise<LegalHold[]> {
    const today = new Date();
    return await this.legalHoldRepository
      .createQueryBuilder('legalHold')
      .where('legalHold.deletedAt IS NULL')
      .andWhere('legalHold.status = :status', { status: LegalHoldStatus.ACTIVE })
      .andWhere('legalHold.isAutoReminder = :isAutoReminder', {
        isAutoReminder: true,
      })
      .andWhere('legalHold.nextReminderDate <= :today', { today })
      .getMany();
  }
}
