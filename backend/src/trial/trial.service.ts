import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { TrialEvent } from './entities/trial-event.entity';
import { WitnessPrepSession } from './entities/witness-prep-session.entity';
import { CreateTrialEventDto } from './dto/create-trial-event.dto';
import { UpdateTrialEventDto } from './dto/update-trial-event.dto';
import { CreateWitnessPrepDto } from './dto/create-witness-prep.dto';

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

  async findAllEvents(filters: {
    caseId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { caseId, type, startDate, endDate, page = 1, limit = 50 } = filters;
    
    const queryBuilder = this.trialEventRepository.createQueryBuilder('event');

    if (caseId) queryBuilder.andWhere('event.caseId = :caseId', { caseId });
    if (type) queryBuilder.andWhere('event.type = :type', { type });
    if (startDate && endDate) {
      queryBuilder.andWhere('event.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('event.date', 'ASC')
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

  async findAllWitnessPrep(filters: {
    caseId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { caseId, status, page = 1, limit = 50 } = filters;
    
    const where: FindOptionsWhere<WitnessPrepSession> = {};
    if (caseId) where.caseId = caseId;
    if (status) where.status = status as any;

    const [data, total] = await this.witnessPrepRepository.findAndCount({
      where,
      order: { scheduledDate: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
