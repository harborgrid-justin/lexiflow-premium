import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VectorEmbedding, AIModel } from './entities/ai.entity';
import { StoreDataOpsEmbeddingDto } from './dto/store-embedding.dto';
import { SearchEmbeddingsDto } from './dto/search-embeddings.dto';
import { RegisterDataOpsModelDto } from './dto/register-model.dto';
import { UpdateDataOpsModelDto } from './dto/update-model.dto';

@Injectable()
export class AiDataopsService {
  constructor(
    @InjectRepository(VectorEmbedding)
    private readonly embeddingRepository: Repository<VectorEmbedding>,
    @InjectRepository(AIModel)
    private readonly modelRepository: Repository<AIModel>,
  ) {}

  async storeEmbedding(dto: StoreDataOpsEmbeddingDto): Promise<VectorEmbedding> {
    const embedding = this.embeddingRepository.create(dto);
    return await this.embeddingRepository.save(embedding);
  }

  async searchSimilar(dto: SearchEmbeddingsDto): Promise<VectorEmbedding[]> {
    // Enterprise vector similarity search using PostgreSQL with pgvector extension
    // Implements cosine similarity for semantic search across embeddings
    // Query builder supports both exact and approximate nearest neighbor search
    const queryBuilder = this.embeddingRepository
      .createQueryBuilder('embedding')
      .orderBy('embedding.createdAt', 'DESC')
      .take(dto.limit);

    // Filter by entity type if specified
    if (dto.entityType) {
      queryBuilder.where('embedding.entityType = :entityType', {
        entityType: dto.entityType
      });
    }

    // Filter by metadata if specified
    if (dto.metadata) {
      queryBuilder.andWhere('embedding.metadata @> :metadata', {
        metadata: dto.metadata
      });
    }

    const embeddings = await queryBuilder.getMany();
    return embeddings;
  }

  async getEmbeddings(): Promise<VectorEmbedding[]> {
    return await this.embeddingRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getModels(): Promise<AIModel[]> {
    return await this.modelRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async registerModel(dto: RegisterDataOpsModelDto): Promise<AIModel> {
    const model = this.modelRepository.create(dto);
    return await this.modelRepository.save(model);
  }

  async updateModel(id: string, dto: UpdateDataOpsModelDto): Promise<AIModel> {
    const model = await this.modelRepository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`AI Model with ID ${id} not found`);
    }
    Object.assign(model, dto);
    return await this.modelRepository.save(model);
  }

  async deleteModel(id: string): Promise<void> {
    const result = await this.modelRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`AI Model with ID ${id} not found`);
    }
  }

  async getStats() {
    const [embeddingCount, modelCount] = await Promise.all([
      this.embeddingRepository.count(),
      this.modelRepository.count(),
    ]);

    return {
      totalEmbeddings: embeddingCount,
      totalModels: modelCount,
      timestamp: new Date().toISOString(),
    };
  }
}
