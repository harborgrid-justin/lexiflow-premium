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
    metadata?: Record<string, unknown>;
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

  async searchSimilar(queryEmbedding: number[], resultLimit: number = 10) {
    // Use cosine similarity for vector search
    // Get all embeddings for comparison (in production, use pgvector for efficiency)
    const allEmbeddings = await this.embeddingRepository.find({
      take: 1000, // Limit for performance
    });

    // Calculate cosine similarity for each embedding
    const similarities = allEmbeddings.map((doc: VectorEmbedding) => {
      const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
      return { doc, similarity };
    });

    // Sort by similarity (highest first) and take top results
    const topResults = similarities
      .sort((a: {doc: VectorEmbedding; similarity: number}, b: {doc: VectorEmbedding; similarity: number}) =>
        b.similarity - a.similarity
      )
      .slice(0, resultLimit)
      .map(({ doc, similarity }) => ({
        ...doc,
        similarityScore: similarity,
      }));

    return {
      results: topResults,
      count: topResults.length,
    };
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have same length');
    }

    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
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
    configuration: Record<string, unknown>;
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
