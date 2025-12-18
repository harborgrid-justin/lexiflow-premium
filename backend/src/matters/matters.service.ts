import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Matter } from './entities/matter.entity';
import { CreateMatterDto } from './dto/create-matter.dto';
import { UpdateMatterDto } from './dto/update-matter.dto';
import { MatterResponseDto } from './dto/matter-response.dto';

@Injectable()
export class MattersService {
  constructor(
    @InjectRepository(Matter)
    private mattersRepository: Repository<Matter>,
  ) {}

  /**
   * Generate unique matter number in format: MAT-YYYY-NNNN
   */
  private async generateMatterNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MAT-${year}-`;
    
    // Get the last matter number for this year
    const lastMatter = await this.mattersRepository
      .createQueryBuilder('matter')
      .where('matter.matterNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('matter.matterNumber', 'DESC')
      .getOne();

    if (!lastMatter) {
      return `${prefix}0001`;
    }

    const lastNumber = parseInt(lastMatter.matterNumber.split('-')[2], 10);
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    
    return `${prefix}${newNumber}`;
  }

  async create(createMatterDto: CreateMatterDto): Promise<MatterResponseDto> {
    // Generate unique matter number
    const matterNumber = await this.generateMatterNumber();

    // Map userId to createdBy (entity expects createdBy, DTO uses userId)
    // Use system UUID (00000000-0000-0000-0000-000000000000) as default
    const { userId, ...dtoWithoutUserId } = createMatterDto;
    const SYSTEM_USER_UUID = '00000000-0000-0000-0000-000000000000';
    
    const matter = this.mattersRepository.create({
      ...dtoWithoutUserId,
      matterNumber,
      createdBy: userId || SYSTEM_USER_UUID,
    });

    const savedMatter = await this.mattersRepository.save(matter);
    return new MatterResponseDto(savedMatter);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 50,
    filters?: {
      status?: string;
      matterType?: string;
      priority?: string;
      clientId?: string;
      leadAttorneyId?: string;
      search?: string;
    },
  ): Promise<{ matters: MatterResponseDto[]; total: number }> {
    const queryBuilder = this.mattersRepository.createQueryBuilder('matter');

    // Apply filters
    if (filters?.status) {
      queryBuilder.andWhere('matter.status = :status', { status: filters.status });
    }
    if (filters?.matterType) {
      queryBuilder.andWhere('matter.matterType = :matterType', { matterType: filters.matterType });
    }
    if (filters?.priority) {
      queryBuilder.andWhere('matter.priority = :priority', { priority: filters.priority });
    }
    if (filters?.clientId) {
      queryBuilder.andWhere('matter.clientId = :clientId', { clientId: filters.clientId });
    }
    if (filters?.leadAttorneyId) {
      queryBuilder.andWhere('matter.leadAttorneyId = :leadAttorneyId', { 
        leadAttorneyId: filters.leadAttorneyId 
      });
    }
    if (filters?.search) {
      queryBuilder.andWhere(
        '(matter.title ILIKE :search OR matter.matterNumber ILIKE :search OR matter.clientName ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Note: No isArchived filter - not in current schema

    // Pagination
    queryBuilder
      .orderBy('matter.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [matters, total] = await queryBuilder.getManyAndCount();

    return {
      matters: matters.map(matter => new MatterResponseDto(matter)),
      total,
    };
  }

  async findOne(id: string): Promise<MatterResponseDto> {
    const matter = await this.mattersRepository.findOne({ where: { id } });
    
    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    return new MatterResponseDto(matter);
  }

  async findByMatterNumber(matterNumber: string): Promise<MatterResponseDto> {
    const matter = await this.mattersRepository.findOne({ 
      where: { matterNumber } 
    });
    
    if (!matter) {
      throw new NotFoundException(`Matter with number ${matterNumber} not found`);
    }

    return new MatterResponseDto(matter);
  }

  async update(id: string, updateMatterDto: UpdateMatterDto): Promise<MatterResponseDto> {
    const matter = await this.mattersRepository.findOne({ where: { id } });
    
    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    // Update matter
    Object.assign(matter, updateMatterDto);
    const updatedMatter = await this.mattersRepository.save(matter);

    return new MatterResponseDto(updatedMatter);
  }

  async remove(id: string): Promise<void> {
    const matter = await this.mattersRepository.findOne({ where: { id } });
    
    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    await this.mattersRepository.remove(matter);
  }

  async archive(id: string): Promise<MatterResponseDto> {
    const matter = await this.mattersRepository.findOne({ where: { id } });
    
    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    // Note: isArchived field not in current schema - using soft delete instead
    await this.mattersRepository.softRemove(matter);

    return new MatterResponseDto(matter);
  }

  async restore(id: string): Promise<MatterResponseDto> {
    const matter = await this.mattersRepository.findOne({ where: { id }, withDeleted: true });
    
    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    // Note: Using soft delete recovery instead of isArchived field
    await this.mattersRepository.recover(matter);

    return new MatterResponseDto(matter);
  }

  async getStatistics(userId?: string): Promise<any> {
    const queryBuilder = this.mattersRepository.createQueryBuilder('matter');
    
    if (userId) {
      queryBuilder.where('matter.userId = :userId', { userId });
    }

    const [total, active, intake, pending, closed] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('matter.status = :status', { status: 'active' }).getCount(),
      queryBuilder.clone().andWhere('matter.status = :status', { status: 'intake' }).getCount(),
      queryBuilder.clone().andWhere('matter.status = :status', { status: 'pending' }).getCount(),
      queryBuilder.clone().andWhere('matter.status = :status', { status: 'closed' }).getCount(),
    ]);

    return {
      total,
      byStatus: {
        active,
        intake,
        pending,
        closed,
      },
    };
  }
}
