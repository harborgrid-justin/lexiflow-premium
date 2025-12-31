import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere} from 'typeorm';
import { TrialEvent } from './entities/trial-event.entity';
import { WitnessPrepSession } from './entities/witness-prep-session.entity';
import { CreateTrialEventDto } from './dto/create-trial-event.dto';
import { UpdateTrialEventDto } from './dto/update-trial-event.dto';
import { CreateWitnessPrepDto, WitnessPrepStatus } from './dto/create-witness-prep.dto';
import { calculateOffset, calculateTotalPages } from '@common/utils/math.utils';
import { validateDateRange, validatePagination} from '@common/utils/query-validation.util';

interface TrialEventFilters {
  caseId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface WitnessPrepFilters {
  caseId?: string;
  status?: WitnessPrepStatus;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * ╔=================================================================================================================╗
 * ║TRIAL                                                                                                            ║
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
export class TrialService {
  constructor(
    @InjectRepository(TrialEvent)
    private readonly trialEventRepository: Repository<TrialEvent>,
    @InjectRepository(WitnessPrepSession)
    private readonly witnessPrepRepository: Repository<WitnessPrepSession>,
  ) {}

  // Trial Events
  async createEvent(createDto: CreateTrialEventDto): Promise<TrialEvent> {
    const event = this.trialEventRepository.create(createDto);
    return await this.trialEventRepository.save(event);
  }

  async findAllEvents(filters: TrialEventFilters): Promise<PaginatedResponse<TrialEvent>> {
    const { caseId, type, startDate, endDate } = filters;
    const { page, limit } = validatePagination(filters.page, filters.limit);

    const queryBuilder = this.trialEventRepository.createQueryBuilder('event');

    if (caseId) queryBuilder.andWhere('event.caseId = :caseId', { caseId });
    if (type) queryBuilder.andWhere('event.type = :type', { type });

    const dateRange = validateDateRange(startDate, endDate);
    if (dateRange) {
      queryBuilder.andWhere('event.date BETWEEN :startDate AND :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('event.date', 'ASC')
      .skip(calculateOffset(page, limit))
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: calculateTotalPages(total, limit),
    };
  }

  async findOneEvent(id: string): Promise<TrialEvent> {
    const event = await this.trialEventRepository.findOne({ where: { id } });
    
    if (!event) {
      throw new NotFoundException(`Trial event with ID ${id} not found`);
    }

    return event;
  }

  async updateEvent(id: string, updateDto: UpdateTrialEventDto): Promise<TrialEvent> {
    const event = await this.findOneEvent(id);
    Object.assign(event, updateDto);
    return await this.trialEventRepository.save(event);
  }

  async removeEvent(id: string): Promise<void> {
    const event = await this.findOneEvent(id);
    await this.trialEventRepository.remove(event);
  }

  // Witness Prep
  async createWitnessPrep(createDto: CreateWitnessPrepDto): Promise<WitnessPrepSession> {
    const session = this.witnessPrepRepository.create(createDto);
    return await this.witnessPrepRepository.save(session);
  }

  async findAllWitnessPrep(filters: WitnessPrepFilters): Promise<PaginatedResponse<WitnessPrepSession>> {
    const { caseId, status } = filters;
    const { page, limit } = validatePagination(filters.page, filters.limit);

    const where: FindOptionsWhere<WitnessPrepSession> = {};
    if (caseId) where.caseId = caseId;
    if (status) where.status = status;

    const [data, total] = await this.witnessPrepRepository.findAndCount({
      where,
      order: { scheduledDate: 'ASC' },
      skip: calculateOffset(page, limit),
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: calculateTotalPages(total, limit),
    };
  }
}
