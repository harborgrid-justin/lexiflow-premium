import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pleading, PleadingStatus } from './entities/pleading.entity';
import { CreatePleadingDto } from './dto/create-pleading.dto';
import { UpdatePleadingDto } from './dto/update-pleading.dto';
import { FilePleadingDto } from './dto/file-pleading.dto';

@Injectable()
export class PleadingsService {
  private readonly logger = new Logger(PleadingsService.name);

  constructor(
    @InjectRepository(Pleading)
    private pleadingRepository: Repository<Pleading>,
  ) {}

  /**
   * Create a new pleading
   */
  async create(
    createPleadingDto: CreatePleadingDto,
    userId?: string,
  ): Promise<Pleading> {
    try {
      const pleading = this.pleadingRepository.create({
        ...createPleadingDto,
        createdBy: userId,
      });

      const savedPleading = await this.pleadingRepository.save(pleading);
      this.logger.log(`Pleading created: ${savedPleading.id}`);

      return savedPleading;
    } catch (error) {
      this.logger.error('Failed to create pleading', error);
      throw error;
    }
  }

  /**
   * Find all pleadings with optional filtering
   */
  async findAll(
    caseId?: string,
    status?: PleadingStatus,
  ): Promise<Pleading[]> {
    const query = this.pleadingRepository.createQueryBuilder('pleading');

    if (caseId) {
      query.andWhere('pleading.caseId = :caseId', { caseId });
    }

    if (status) {
      query.andWhere('pleading.status = :status', { status });
    }

    query.orderBy('pleading.filedDate', 'DESC');
    query.addOrderBy('pleading.createdAt', 'DESC');

    return await query.getMany();
  }

  /**
   * Find a pleading by ID
   */
  async findOne(id: string): Promise<Pleading> {
    const pleading = await this.pleadingRepository.findOne({ where: { id } });

    if (!pleading) {
      throw new NotFoundException(`Pleading with ID ${id} not found`);
    }

    return pleading;
  }

  /**
   * Update a pleading
   */
  async update(
    id: string,
    updatePleadingDto: UpdatePleadingDto,
    userId?: string,
  ): Promise<Pleading> {
    const pleading = await this.findOne(id);

    Object.assign(pleading, updatePleadingDto);
    pleading.updatedBy = userId;

    const updatedPleading = await this.pleadingRepository.save(pleading);
    this.logger.log(`Pleading updated: ${id}`);

    return updatedPleading;
  }

  /**
   * Delete a pleading
   */
  async remove(id: string): Promise<void> {
    const pleading = await this.findOne(id);

    await this.pleadingRepository.remove(pleading);
    this.logger.log(`Pleading deleted: ${id}`);
  }

  /**
   * File a pleading (mark as filed)
   */
  async file(
    id: string,
    filePleadingDto: FilePleadingDto,
    userId?: string,
  ): Promise<Pleading> {
    const pleading = await this.findOne(id);

    pleading.status = PleadingStatus.FILED;
    pleading.filedBy = filePleadingDto.filedBy;
    pleading.filedDate = new Date(filePleadingDto.filedDate);

    if (filePleadingDto.courtName) {
      pleading.courtName = filePleadingDto.courtName;
    }

    pleading.updatedBy = userId;

    const updatedPleading = await this.pleadingRepository.save(pleading);
    this.logger.log(`Pleading filed: ${id}`);

    return updatedPleading;
  }

  /**
   * Get pleadings by case ID
   */
  async findByCaseId(caseId: string): Promise<Pleading[]> {
    return await this.pleadingRepository.find({
      where: { caseId },
      order: { filedDate: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Get upcoming hearings
   */
  async getUpcomingHearings(daysAhead: number = 30): Promise<Pleading[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return await this.pleadingRepository
      .createQueryBuilder('pleading')
      .where('pleading.hearingDate >= :today', { today })
      .andWhere('pleading.hearingDate <= :futureDate', { futureDate })
      .orderBy('pleading.hearingDate', 'ASC')
      .getMany();
  }

  /**
   * Get pleadings by status
   */
  async findByStatus(status: PleadingStatus): Promise<Pleading[]> {
    return await this.pleadingRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find pleadings by type
   */
  async findByType(caseId: string, type: string): Promise<Pleading[]> {
    return await this.pleadingRepository.find({
      where: { caseId, type: type as any },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get overdue pleadings
   */
  async getOverduePleadings(): Promise<Pleading[]> {
    const today = new Date();
    return await this.pleadingRepository
      .createQueryBuilder('pleading')
      .where('pleading.dueDate < :today', { today })
      .andWhere('pleading.status != :filed', { filed: PleadingStatus.FILED })
      .orderBy('pleading.dueDate', 'ASC')
      .getMany();
  }

  /**
   * Attach document to pleading
   */
  async attachDocument(id: string, documentId: string): Promise<Pleading> {
    const pleading = await this.findOne(id);
    pleading.documentId = documentId;
    return await this.pleadingRepository.save(pleading);
  }

  /**
   * Set hearing date
   */
  async setHearingDate(id: string, hearingDate: Date): Promise<Pleading> {
    const pleading = await this.findOne(id);
    pleading.hearingDate = hearingDate;
    return await this.pleadingRepository.save(pleading);
  }

  /**
   * Get pleadings due soon
   */
  async getDueSoon(days: number): Promise<Pleading[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await this.pleadingRepository
      .createQueryBuilder('pleading')
      .where('pleading.dueDate >= :today', { today })
      .andWhere('pleading.dueDate <= :futureDate', { futureDate })
      .andWhere('pleading.status != :filed', { filed: PleadingStatus.FILED })
      .orderBy('pleading.dueDate', 'ASC')
      .getMany();
  }

  /**
   * Search pleadings
   */
  async search(query: {
    caseId?: string;
    query?: string;
    type?: string;
    status?: PleadingStatus;
  }): Promise<Pleading[]> {
    const qb = this.pleadingRepository.createQueryBuilder('pleading');

    if (query.caseId) {
      qb.andWhere('pleading.caseId = :caseId', { caseId: query.caseId });
    }

    if (query.query) {
      qb.andWhere(
        '(pleading.title ILIKE :search OR pleading.content ILIKE :search)',
        { search: `%${query.query}%` },
      );
    }

    if (query.type) {
      qb.andWhere('pleading.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('pleading.status = :status', { status: query.status });
    }

    return await qb.orderBy('pleading.createdAt', 'DESC').getMany();
  }
}
