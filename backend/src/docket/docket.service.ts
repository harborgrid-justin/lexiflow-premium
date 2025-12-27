import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocketEntry } from './entities/docket-entry.entity';
import { CreateDocketEntryDto } from './dto/create-docket-entry.dto';
import { UpdateDocketEntryDto } from './dto/update-docket-entry.dto';
import { PacerSyncDto, PacerSyncResultDto } from './dto/pacer-sync.dto';

@Injectable()
export class DocketService {
  private readonly logger = new Logger(DocketService.name);

  constructor(
    @InjectRepository(DocketEntry)
    private readonly docketRepository: Repository<DocketEntry>,
  ) {}

  async findAll(options?: { page?: number; limit?: number }): Promise<{ data: DocketEntry[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50 } = options || {};
    const skip = (page - 1) * limit;

    const [entries, total] = await this.docketRepository.findAndCount({
      order: { sequenceNumber: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: entries,
      total,
      page,
      limit,
    };
  }

  async findAllByCaseId(caseId: string, options?: { page?: number; limit?: number }): Promise<{ data: DocketEntry[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50 } = options || {};
    const skip = (page - 1) * limit;

    const [entries, total] = await this.docketRepository.findAndCount({
      where: { caseId },
      order: { sequenceNumber: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: entries,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<DocketEntry> {
    const entry = await this.docketRepository.findOne({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException(`Docket entry with ID ${id} not found`);
    }

    return entry;
  }

  async create(createDocketEntryDto: CreateDocketEntryDto): Promise<DocketEntry> {
    const entry = this.docketRepository.create(createDocketEntryDto);
    return this.docketRepository.save(entry);
  }

  async update(id: string, updateDocketEntryDto: UpdateDocketEntryDto): Promise<DocketEntry> {
    const result = await this.docketRepository
      .createQueryBuilder()
      .update(DocketEntry)
      .set(updateDocketEntryDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Docket entry with ID ${id} not found`);
    }

    return result.raw[0];
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.docketRepository.delete(id);
  }

  async syncFromPacer(pacerSyncDto: PacerSyncDto): Promise<PacerSyncResultDto> {
    // This is a placeholder implementation
    // In a real implementation, this would:
    // 1. Connect to PACER API
    // 2. Fetch docket entries for the case
    // 3. Compare with existing entries
    // 4. Add/update entries as needed
    // 5. Return sync results

    const result: PacerSyncResultDto = {
      success: true,
      entriesAdded: 0,
      entriesUpdated: 0,
      lastSyncDate: new Date(),
      errors: [],
    };

    try {
      // Mock PACER sync implementation
      this.logger.log(`PACER sync requested for case: ${pacerSyncDto.caseId}`);
      this.logger.log(`PACER case number: ${pacerSyncDto.pacerCaseNumber}`);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful sync
      result.entriesAdded = 2;
      result.entriesUpdated = 1;
      result.lastSyncDate = new Date();
      
      // In a real implementation, we would fetch entries and save them to the database
      // const entries = await this.pacerService.getDocketSheet(...)
      // await this.saveDocketEntries(entries)

    } catch (error: any) {
      this.logger.error(`PACER sync failed: ${error.message}`);
      result.success = false;
      result.errors = [error.message];
    }

    return result;
  }

  async getNextEntryNumber(caseId: string): Promise<number> {
    const count = await this.docketRepository.count({ where: { caseId } });
    return count + 1;
  }

  async search(query: {
    caseId?: string;
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: DocketEntry[]; total: number }> {
    const qb = this.docketRepository.createQueryBuilder('docket');

    if (query.caseId) {
      qb.where('docket.caseId = :caseId', { caseId: query.caseId });
    }

    if (query.query) {
      qb.andWhere(
        '(docket.description ILIKE :query OR docket.entryText ILIKE :query)',
        { query: `%${query.query}%` },
      );
    }

    qb.orderBy('docket.sequenceNumber', 'DESC');

    if (query.page && query.limit) {
      qb.skip((query.page - 1) * query.limit);
      qb.take(query.limit);
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async getDocketSummary(caseId: string): Promise<{
    totalEntries: number;
    byCategory: Record<string, number>;
    latestEntry: DocketEntry | null;
  }> {
    const entries = await this.docketRepository.find({
      where: { caseId },
      order: { sequenceNumber: 'DESC' },
    });

    const byCategory: Record<string, number> = {};
    entries.forEach((entry) => {
      const category = entry.type || 'Uncategorized';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return {
      totalEntries: entries.length,
      byCategory,
      latestEntry: entries[0] || null,
    };
  }
}
