import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Motion, MotionStatus, MotionType } from './entities/motion.entity';
import { CreateMotionDto } from './dto/create-motion.dto';
import { UpdateMotionDto } from './dto/update-motion.dto';

interface MotionRuling {
  decision: string;
  date: Date;
  judge?: string;
  notes?: string;
  [key: string]: unknown;
}

interface MotionSearchQuery {
  query?: string;
  caseId?: string;
  type?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * ╔=================================================================================================================╗
 * ║MOTIONS                                                                                                          ║
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
export class MotionsService {
  constructor(
    @InjectRepository(Motion)
    private readonly motionRepository: Repository<Motion>,
  ) {}

  async findAllByCaseId(caseId: string, options?: { page?: number; limit?: number }): Promise<{ data: Motion[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50 } = options || {};
    const skip = (page - 1) * limit;

    const [motions, total] = await this.motionRepository.findAndCount({
      where: { caseId },
      order: { filingDate: 'DESC', createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: motions,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Motion> {
    const motion = await this.motionRepository.findOne({
      where: { id },
    });

    if (!motion) {
      throw new NotFoundException(`Motion with ID ${id} not found`);
    }

    return motion;
  }

  async create(createMotionDto: CreateMotionDto): Promise<Motion> {
    const motion = this.motionRepository.create(createMotionDto);
    return this.motionRepository.save(motion);
  }

  async update(id: string, updateMotionDto: UpdateMotionDto): Promise<Motion> {
    const motion = await this.findOne(id);
    Object.assign(motion, updateMotionDto);
    // Note: updatedBy tracking handled by BaseEntity updatedAt
    return this.motionRepository.save(motion);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.motionRepository.delete(id);
  }

  async findAll(): Promise<Motion[]> {
    return this.motionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Motion> {
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    return this.remove(id);
  }

  async file(id: string): Promise<Motion> {
    const motion = await this.findOne(id);
    if (motion.status === MotionStatus.FILED) {
      throw new BadRequestException('Motion is already filed');
    }
    motion.status = MotionStatus.FILED;
    motion.filedDate = new Date();
    return this.motionRepository.save(motion);
  }

  async setHearingDate(id: string, hearingDate: Date): Promise<Motion> {
    const motion = await this.findOne(id);
    motion.hearingDate = hearingDate;
    return this.motionRepository.save(motion);
  }

  async recordRuling(id: string, ruling: MotionRuling): Promise<Motion> {
    const motion = await this.findOne(id);
    motion.ruling = ruling;
    motion.status = MotionStatus.GRANTED;
    motion.rulingDate = new Date();
    return this.motionRepository.save(motion);
  }

  async findByType(caseId: string, type: string): Promise<Motion[]> {
    return this.motionRepository.find({
      where: { caseId, type: type as MotionType },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(caseId: string, status: string): Promise<Motion[]> {
    return this.motionRepository.find({
      where: { caseId, status: status as MotionStatus },
      order: { createdAt: 'DESC' },
    });
  }

  async getUpcomingHearings(): Promise<Motion[]> {
    const now = new Date();
    return this.motionRepository
      .createQueryBuilder('motion')
      .where('motion.hearingDate > :now', { now })
      .orderBy('motion.hearingDate', 'ASC')
      .getMany();
  }

  async getPendingResponses(): Promise<Motion[]> {
    return this.motionRepository.find({
      where: { status: MotionStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async attachDocument(id: string, documentId: string): Promise<Motion> {
    const motion = await this.findOne(id);
    if (!motion.attachments) {
      motion.attachments = [];
    }
    motion.attachments.push(documentId);
    return this.motionRepository.save(motion);
  }

  async search(query: MotionSearchQuery): Promise<Motion[]> {
    const qb = this.motionRepository.createQueryBuilder('motion');

    if (query.query) {
      qb.where('motion.title LIKE :query OR motion.description LIKE :query', {
        query: `%${query.query}%`,
      });
    }

    if (query.caseId) {
      qb.andWhere('motion.caseId = :caseId', { caseId: query.caseId });
    }

    return qb.orderBy('motion.createdAt', 'DESC').getMany();
  }
}
