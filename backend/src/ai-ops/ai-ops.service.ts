import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VectorEmbedding } from '../ai-dataops/entities/ai.entity';
import { AIModel } from './entities/ai-model.entity';

@Injectable()
export class AiOpsService {
  constructor(
    @InjectRepository(VectorEmbedding)
    private readonly embeddingRepository: Repository<VectorEmbedding>,
    @InjectRepository(AIModel)
    private readonly modelRepository: Repository<AIModel>,
  ) {}

  async storeEmbedding(data: {
    entityType: string;
    entityId: string;
    embedding: number[];
    model: string;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<VectorEmbedding> {
    const embedding = this.embeddingRepository.create(data);
    return await this.embeddingRepository.save(embedding);
  }

  async getEmbeddings(filters?: {
    entityType?: string;
    entityId?: string;
    page?: number;
    limit?: number;
  }) {
    const { entityType, entityId, page = 1, limit = 50 } = filters || {};

    const queryBuilder = this.embeddingRepository.createQueryBuilder('embedding');

    if (entityType) {
      queryBuilder.where('embedding.entityType = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('embedding.entityId = :entityId', { entityId });
    }

    const [data, total] = await queryBuilder
      .orderBy('embedding.createdAt', 'DESC')
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

  async searchSimilar(embedding: number[], limit: number = 10) {
    // In production, use pgvector or similar for efficient similarity search
    // For now, return mock results
    return {
      results: [],
      message: 'Vector similarity search requires pgvector extension',
    };
  }

  async getModels() {
    return await this.modelRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async registerModel(data: {
    name: string;
    type: string;
    provider: string;
    version: string;
    configuration: Record<string, any>;
  }): Promise<AIModel> {
    const model = this.modelRepository.create(data);
    return await this.modelRepository.save(model);
  }

  async updateModel(id: string, data: Partial<AIModel>): Promise<AIModel> {
    const model = await this.modelRepository.findOne({ where: { id } });
    
    if (!model) {
      throw new NotFoundException(`Model with ID ${id} not found`);
    }

    Object.assign(model, data);
    return await this.modelRepository.save(model);
  }

  async deleteModel(id: string): Promise<void> {
    const model = await this.modelRepository.findOne({ where: { id } });
    
    if (!model) {
      throw new NotFoundException(`Model with ID ${id} not found`);
    }

    await this.modelRepository.remove(model);
  }

  async getStats() {
    const totalEmbeddings = await this.embeddingRepository.count();
    const totalModels = await this.modelRepository.count();
    const activeModels = await this.modelRepository.count({ where: { active: true } });

    const result = await this.modelRepository
      .createQueryBuilder('model')
      .select('SUM(model.usageCount)', 'totalUsage')
      .getRawOne();

    return {
      totalEmbeddings,
      totalModels,
      activeModels,
      totalUsage: parseInt(result?.totalUsage || '0'),
    };
  }
}
