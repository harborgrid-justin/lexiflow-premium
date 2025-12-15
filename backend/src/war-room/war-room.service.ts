import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advisor, Expert, CaseStrategy } from './entities/war-room.entity';
import { CreateAdvisorDto, CreateExpertDto, UpdateStrategyDto } from './dto/war-room.dto';

@Injectable()
export class WarRoomService {
  constructor(
    @InjectRepository(Advisor)
    private readonly advisorRepository: Repository<Advisor>,
    @InjectRepository(Expert)
    private readonly expertRepository: Repository<Expert>,
    @InjectRepository(CaseStrategy)
    private readonly strategyRepository: Repository<CaseStrategy>,
  ) {}

  // Advisor methods
  async createAdvisor(createDto: CreateAdvisorDto): Promise<Advisor> {
    const advisor = this.advisorRepository.create(createDto);
    return await this.advisorRepository.save(advisor);
  }

  async findAllAdvisors(query: any): Promise<{ data: Advisor[]; total: number }> {
    const { page = 1, limit = 50, caseId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (caseId) where.caseId = caseId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [data, total] = await this.advisorRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { name: 'ASC' }
    });

    return { data, total };
  }

  async findOneAdvisor(id: string): Promise<Advisor> {
    const advisor = await this.advisorRepository.findOne({ where: { id } });
    if (!advisor) throw new NotFoundException(`Advisor ${id} not found`);
    return advisor;
  }

  async removeAdvisor(id: string): Promise<void> {
    const advisor = await this.findOneAdvisor(id);
    await this.advisorRepository.remove(advisor);
  }

  // Expert methods
  async createExpert(createDto: CreateExpertDto): Promise<Expert> {
    const expert = this.expertRepository.create(createDto);
    return await this.expertRepository.save(expert);
  }

  async findAllExperts(query: any): Promise<{ data: Expert[]; total: number }> {
    const { page = 1, limit = 50, caseId, expertType, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (caseId) where.caseId = caseId;
    if (expertType) where.expertType = expertType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [data, total] = await this.expertRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { name: 'ASC' }
    });

    return { data, total };
  }

  async findOneExpert(id: string): Promise<Expert> {
    const expert = await this.expertRepository.findOne({ where: { id } });
    if (!expert) throw new NotFoundException(`Expert ${id} not found`);
    return expert;
  }

  async removeExpert(id: string): Promise<void> {
    const expert = await this.findOneExpert(id);
    await this.expertRepository.remove(expert);
  }

  // Strategy methods
  async getStrategy(caseId: string): Promise<CaseStrategy> {
    let strategy = await this.strategyRepository.findOne({ where: { caseId } });
    if (!strategy) {
      strategy = this.strategyRepository.create({ caseId });
      strategy = await this.strategyRepository.save(strategy);
    }
    return strategy;
  }

  async updateStrategy(caseId: string, updateDto: UpdateStrategyDto): Promise<CaseStrategy> {
    const strategy = await this.getStrategy(caseId);
    Object.assign(strategy, updateDto);
    return await this.strategyRepository.save(strategy);
  }
}
