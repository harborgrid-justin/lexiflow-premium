import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Motion } from './entities/motion.entity';
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
    await this.motionRepository.softDelete(id);
  }
}
