import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Motion, MotionStatus } from './entities/motion.entity';
import { CreateMotionDto } from './dto/create-motion.dto';
import { UpdateMotionDto } from './dto/update-motion.dto';

@Injectable()
export class MotionsService {
  constructor(
    @InjectRepository(Motion)
    private readonly motionRepository: Repository<Motion>,
  ) {}

  async findAllByCaseId(caseId: string): Promise<Motion[]> {
    return this.motionRepository.find({
      where: { caseId },
      order: { filingDate: 'DESC', createdAt: 'DESC' },
    });
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
    await this.findOne(id);
    await this.motionRepository.update(id, updateMotionDto);
    return this.findOne(id);
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
    if (motion.status === MotionStatus.FILED as any) {
      throw new BadRequestException('Motion is already filed');
    }
    motion.status = MotionStatus.FILED as any;
    motion.filedDate = new Date();
    return this.motionRepository.save(motion);
  }

  async setHearingDate(id: string, hearingDate: Date): Promise<Motion> {
    const motion = await this.findOne(id);
    motion.hearingDate = hearingDate;
    return this.motionRepository.save(motion);
  }

  async recordRuling(id: string, ruling: any): Promise<Motion> {
    const motion = await this.findOne(id);
    motion.ruling = ruling;
    motion.status = 'decided' as any;
    motion.rulingDate = new Date();
    return this.motionRepository.save(motion);
  }

  async findByType(caseId: string, type: string): Promise<Motion[]> {
    return this.motionRepository.find({
      where: { caseId, type: type as any },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(caseId: string, status: string): Promise<Motion[]> {
    return this.motionRepository.find({
      where: { caseId, status: status as any },
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
      where: { status: 'pending' as any },
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

  async search(query: any): Promise<Motion[]> {
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
