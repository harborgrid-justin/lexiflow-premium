import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { TimeEntry, TimeEntryStatus } from './entities/time-entry.entity';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { TimeEntryFilterDto } from './dto/time-entry-filter.dto';
import { validateSortField, validateSortOrder } from '../../common/utils/query-validation.util';

@Injectable()
export class TimeEntriesService {
  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
  ) {}

  async create(createTimeEntryDto: CreateTimeEntryDto): Promise<TimeEntry> {
    const total = createTimeEntryDto.duration * createTimeEntryDto.rate;
    const discountedTotal = createTimeEntryDto.discount
      ? total * (1 - createTimeEntryDto.discount / 100)
      : total;

    const timeEntry = this.timeEntryRepository.create({
      ...createTimeEntryDto,
      total,
      discountedTotal,
      status: createTimeEntryDto.status || TimeEntryStatus.DRAFT,
      billable: createTimeEntryDto.billable !== undefined ? createTimeEntryDto.billable : true,
    });

    return await this.timeEntryRepository.save(timeEntry);
  }

  async bulkCreate(entries: CreateTimeEntryDto[]): Promise<TimeEntry[]> {
    const timeEntries = entries.map((dto) => {
      const total = dto.duration * dto.rate;
      const discountedTotal = dto.discount ? total * (1 - dto.discount / 100) : total;

      return this.timeEntryRepository.create({
        ...dto,
        total,
        discountedTotal,
        status: dto.status || TimeEntryStatus.DRAFT,
        billable: dto.billable !== undefined ? dto.billable : true,
      });
    });

    return await this.timeEntryRepository.save(timeEntries);
  }

  async findAll(filterDto: TimeEntryFilterDto): Promise<{ data: TimeEntry[]; total: number }> {
    const {
      caseId,
      userId,
      invoiceId,
      status,
      billable,
      startDate,
      endDate,
      activity,
      phaseCode,
      page = 1,
      limit = 50,
      sortBy = 'date',
      sortOrder = 'DESC',
    } = filterDto;

    const query = this.timeEntryRepository.createQueryBuilder('timeEntry');

    if (caseId) {
      query.andWhere('timeEntry.caseId = :caseId', { caseId });
    }

    if (userId) {
      query.andWhere('timeEntry.userId = :userId', { userId });
    }

    if (invoiceId) {
      query.andWhere('timeEntry.invoiceId = :invoiceId', { invoiceId });
    }

    if (status) {
      query.andWhere('timeEntry.status = :status', { status });
    }

    if (billable !== undefined) {
      query.andWhere('timeEntry.billable = :billable', { billable });
    }

    if (startDate && endDate) {
      query.andWhere('timeEntry.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('timeEntry.date >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('timeEntry.date <= :endDate', { endDate });
    }

    if (activity) {
      query.andWhere('timeEntry.activity = :activity', { activity });
    }

    if (phaseCode) {
      query.andWhere('timeEntry.phaseCode = :phaseCode', { phaseCode });
    }

    query.andWhere('timeEntry.deletedAt IS NULL');

    const total = await query.getCount();

    // SQL injection protection
    const safeSortField = validateSortField('timeEntry', sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);

    query
      .orderBy(`timeEntry.${safeSortField}`, safeSortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const data = await query.getMany();

    return { data, total };
  }

  async findOne(id: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!timeEntry) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }

    return timeEntry;
  }

  async findByCase(caseId: string): Promise<TimeEntry[]> {
    return await this.timeEntryRepository.find({
      where: { caseId, deletedAt: IsNull() },
      order: { date: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<TimeEntry[]> {
    return await this.timeEntryRepository.find({
      where: { userId, deletedAt: IsNull() },
      order: { date: 'DESC' },
    });
  }

  async update(id: string, updateTimeEntryDto: UpdateTimeEntryDto): Promise<TimeEntry> {
    // Fetch existing entry to compute totals if rate/duration changed
    const timeEntry = await this.findOne(id);

    let updateData: any = { ...updateTimeEntryDto };

    // Recalculate totals if duration or rate changed
    if (updateTimeEntryDto.duration !== undefined || updateTimeEntryDto.rate !== undefined) {
      const duration = updateTimeEntryDto.duration ?? timeEntry.duration;
      const rate = updateTimeEntryDto.rate ?? timeEntry.rate;
      const total = duration * rate;
      const discount = updateTimeEntryDto.discount ?? timeEntry.discount;
      const discountedTotal = discount ? total * (1 - discount / 100) : total;

      updateData = { ...updateData, total, discountedTotal };
    }

    const result = await this.timeEntryRepository
      .createQueryBuilder()
      .update(TimeEntry)
      .set(updateData)
      .where('id = :id', { id })
      .andWhere('deletedAt IS NULL')
      .returning('*')
      .execute();

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }

    return result.raw[0];
  }

  async remove(id: string): Promise<void> {
    const result = await this.timeEntryRepository
      .createQueryBuilder()
      .softDelete()
      .where('id = :id', { id })
      .andWhere('deletedAt IS NULL')
      .execute();

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }
  }

  async approve(id: string, approvedBy: string): Promise<TimeEntry> {
    const timeEntry = await this.findOne(id);
    timeEntry.status = TimeEntryStatus.APPROVED;
    timeEntry.approvedBy = approvedBy;
    timeEntry.approvedAt = new Date();
    return await this.timeEntryRepository.save(timeEntry);
  }

  async bill(id: string, invoiceId: string, billedBy: string): Promise<TimeEntry> {
    const timeEntry = await this.findOne(id);
    timeEntry.status = TimeEntryStatus.BILLED;
    timeEntry.invoiceId = invoiceId; // Link time entry to invoice
    timeEntry.billedBy = billedBy;
    timeEntry.billedAt = new Date();
    return await this.timeEntryRepository.save(timeEntry);
  }

  async getUnbilledByCase(caseId: string): Promise<TimeEntry[]> {
    return await this.timeEntryRepository.find({
      where: {
        caseId,
        status: In([TimeEntryStatus.APPROVED, TimeEntryStatus.SUBMITTED]),
        billable: true,
        deletedAt: IsNull(),
      },
      order: { date: 'ASC' },
    });
  }

  async getTotalsByCase(
    caseId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ total: number; billable: number; billed: number; unbilled: number }> {
    const query = this.timeEntryRepository
      .createQueryBuilder('timeEntry')
      .where('timeEntry.caseId = :caseId', { caseId })
      .andWhere('timeEntry.deletedAt IS NULL');

    if (startDate && endDate) {
      query.andWhere('timeEntry.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const entries = await query.getMany();

    const total = entries.reduce((sum, entry) => sum + Number(entry.discountedTotal || entry.total), 0);
    const billable = entries
      .filter((e) => e.billable)
      .reduce((sum, entry) => sum + Number(entry.discountedTotal || entry.total), 0);
    const billed = entries
      .filter((e) => e.status === TimeEntryStatus.BILLED)
      .reduce((sum, entry) => sum + Number(entry.discountedTotal || entry.total), 0);
    const unbilled = entries
      .filter((e) => e.billable && e.status !== TimeEntryStatus.BILLED)
      .reduce((sum, entry) => sum + Number(entry.discountedTotal || entry.total), 0);

    return { total, billable, billed, unbilled };
  }

  async approveBulk(ids: string[], approvedBy: string): Promise<{ success: boolean; approved: number }> {
    const entries = await this.timeEntryRepository.find({
      where: { id: In(ids), deletedAt: IsNull() },
    });

    if (entries.length === 0) {
      return { success: false, approved: 0 };
    }

    const updated = await Promise.all(
      entries.map((entry) =>
        this.timeEntryRepository.save({
          ...entry,
          status: TimeEntryStatus.APPROVED,
          approvedBy,
          approvedAt: new Date(),
        }),
      ),
    );

    return { success: true, approved: updated.length };
  }

  async billBulk(
    ids: string[],
    invoiceId: string,
    billedBy: string,
  ): Promise<{ success: boolean; billed: number }> {
    const entries = await this.timeEntryRepository.find({
      where: { id: In(ids), deletedAt: IsNull() },
    });

    if (entries.length === 0) {
      return { success: false, billed: 0 };
    }

    const updated = await Promise.all(
      entries.map((entry) =>
        this.timeEntryRepository.save({
          ...entry,
          status: TimeEntryStatus.BILLED,
          invoiceId,
          billedBy,
          billedAt: new Date(),
        }),
      ),
    );

    return { success: true, billed: updated.length };
  }

  async deleteBulk(ids: string[]): Promise<{ success: boolean; deleted: number }> {
    const entries = await this.timeEntryRepository.find({
      where: { id: In(ids), deletedAt: IsNull() },
    });

    if (entries.length === 0) {
      return { success: false, deleted: 0 };
    }

    const updated = await Promise.all(
      entries.map((entry) =>
        this.timeEntryRepository.save({
          ...entry,
          deletedAt: new Date(),
        }),
      ),
    );

    return { success: true, deleted: updated.length };
  }
}
