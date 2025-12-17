import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pipeline } from './entities/pipeline.entity';
import { CreatePipelineDto, UpdatePipelineDto, PipelineStatus } from './dto/create-pipeline.dto';

@Injectable()
export class PipelinesService {
  constructor(
    @InjectRepository(Pipeline)
    private readonly pipelineRepository: Repository<Pipeline>,
  ) {}

  async create(createDto: CreatePipelineDto, userId?: string): Promise<Pipeline> {
    const pipeline = this.pipelineRepository.create({
      ...createDto,
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
    const { type, status, page = 1, limit = 50 } = filters || {};
    
    const queryBuilder = this.pipelineRepository.createQueryBuilder('pipeline');

    if (type) queryBuilder.andWhere('pipeline.type = :type', { type });
    if (status) queryBuilder.andWhere('pipeline.status = :status', { status });

    const [data, total] = await queryBuilder
      .orderBy('pipeline.updatedAt', 'DESC')
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

  async findOne(id: string): Promise<Pipeline> {
    const pipeline = await this.pipelineRepository.findOne({ where: { id } });
    
    if (!pipeline) {
      throw new NotFoundException(`Pipeline with ID ${id} not found`);
    }

    return pipeline;
  }

  async update(id: string, updateDto: UpdatePipelineDto): Promise<Pipeline> {
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
    pipeline.lastRun = new Date();
    pipeline.lastRunStatus = 'running';
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
    const active = await this.pipelineRepository.count({ where: { status: PipelineStatus.ACTIVE } });
    const failed = await this.pipelineRepository.count({ where: { status: PipelineStatus.FAILED } });
    
    const result = await this.pipelineRepository
      .createQueryBuilder('pipeline')
      .select('SUM(pipeline.recordsProcessed)', 'totalRecords')
      .getRawOne();

    return {
      total,
      active,
      failed,
      paused: total - active - failed,
      totalRecordsProcessed: parseInt(result?.totalRecords || '0'),
    };
  }
}
