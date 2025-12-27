import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ETLPipeline, PipelineStatus as EntityPipelineStatus } from '@etl-pipelines/entities/pipeline.entity';
import { CreatePipelineDto, UpdatePipelineDto, PipelineStatus } from './dto/create-pipeline.dto';

@Injectable()
export class PipelinesService {
  constructor(
    @InjectRepository(ETLPipeline)
    private readonly pipelineRepository: Repository<ETLPipeline>,
  ) {}

  async create(createDto: CreatePipelineDto, userId?: string): Promise<ETLPipeline> {
    const pipeline = this.pipelineRepository.create({
      name: createDto.name,
      description: createDto.description,
      status: createDto.status as any, // Map from DTO enum to entity enum
      config: {
        source: { type: createDto.sourceConnector, config: {} },
        transformations: [],
        destination: { type: createDto.targetConnector, config: {} },
        schedule: createDto.schedule,
      },
      createdBy: userId || 'system',
    });
    return await this.pipelineRepository.save(pipeline);
  }

  async findAll(filters?: {
    type?: string;
    status?: PipelineStatus;
    page?: number;
    limit?: number;
  }) {
    const { status, page = 1, limit = 50 } = filters || {};
    
    const queryBuilder = this.pipelineRepository.createQueryBuilder('pipeline');

    // Note: type field doesn't exist in entity, removed filter
    if (status) queryBuilder.andWhere('pipeline.status = :status', { status });

    const [data, total] = await queryBuilder
      .orderBy('pipeline.updated_at', 'DESC')
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

  async findOne(id: string): Promise<ETLPipeline> {
    const pipeline = await this.pipelineRepository.findOne({ where: { id } });
    
    if (!pipeline) {
      throw new NotFoundException(`Pipeline with ID ${id} not found`);
    }

    return pipeline;
  }

  async update(id: string, updateDto: UpdatePipelineDto): Promise<ETLPipeline> {
    const pipeline = await this.findOne(id);
    Object.assign(pipeline, updateDto);
    return await this.pipelineRepository.save(pipeline);
  }

  async remove(id: string): Promise<void> {
    const pipeline = await this.findOne(id);
    await this.pipelineRepository.remove(pipeline);
  }

  async execute(id: string): Promise<{ jobId: string; status: string }> {
    const pipeline = await this.findOne(id);
    
    // Update last run time
    pipeline.lastRunAt = new Date();
    pipeline.runsTotal += 1;
    await this.pipelineRepository.save(pipeline);

    // In production, this would trigger actual pipeline execution
    const jobId = `job-${Date.now()}`;
    
    return {
      jobId,
      status: 'started',
    };
  }

  async getStats() {
    const total = await this.pipelineRepository.count();
    const active = await this.pipelineRepository.count({ where: { status: EntityPipelineStatus.ACTIVE } });
    const failed = await this.pipelineRepository.count({ where: { status: EntityPipelineStatus.ERROR } });
    const paused = await this.pipelineRepository.count({ where: { status: EntityPipelineStatus.PAUSED } });

    return {
      total,
      active,
      failed,
      paused,
    };
  }
}
