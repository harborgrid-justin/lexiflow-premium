import { Injectable, Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import * as MasterConfig from '../config/master.config';
import { KnowledgeArticle } from './entities/knowledge-article.entity';
import { CreateKnowledgeArticleDto, UpdateKnowledgeArticleDto, QueryKnowledgeDto } from './dto';
import { EntityNotFoundException } from '../common/exceptions';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @InjectRepository(KnowledgeArticle)
    private readonly articleRepository: Repository<KnowledgeArticle>,
  ) {}

  async create(createDto: CreateKnowledgeArticleDto): Promise<KnowledgeArticle> {
    this.logger.log(`Creating knowledge article: ${createDto.title}`);

    const article = this.articleRepository.create(createDto);
    const saved = await this.articleRepository.save(article);

    this.logger.log(`Knowledge article created with ID: ${saved.id}`);
    return saved;
  }

  async findAll(query: QueryKnowledgeDto = {}): Promise<{ data: KnowledgeArticle[]; total: number }> {
    const { category, tags, status, search, page = 1, limit = 50 } = query;

    const queryBuilder = this.articleRepository.createQueryBuilder('article');

    if (category) {
      queryBuilder.andWhere('article.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('article.status = :status', { status });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('article.tags && :tags', { tags });
    }

    if (search) {
      queryBuilder.andWhere(
        '(article.title ILIKE :search OR article.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<KnowledgeArticle> {
    const article = await this.articleRepository.findOne({
      where: { id },
    });

    if (!article) {
      throw new EntityNotFoundException('KnowledgeArticle', id);
    }

    // Increment view count
    article.viewCount = (article.viewCount || 0) + 1;
    await this.articleRepository.save(article);

    return article;
  }

  async findByCategory(category: string): Promise<KnowledgeArticle[]> {
    return this.articleRepository.find({
      where: { category },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTags(tags: string[]): Promise<KnowledgeArticle[]> {
    const queryBuilder = this.articleRepository.createQueryBuilder('article');
    queryBuilder.where('article.tags && :tags', { tags });
    queryBuilder.orderBy('article.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async search(searchTerm: string): Promise<KnowledgeArticle[]> {
    const queryBuilder = this.articleRepository.createQueryBuilder('article');

    queryBuilder.where(
      '(article.title ILIKE :search OR article.content ILIKE :search OR :search = ANY(article.tags))',
      { search: `%${searchTerm}%` },
    );

    queryBuilder.orderBy('article.createdAt', 'DESC').limit(50);

    return queryBuilder.getMany();
  }

  async update(id: string, updateDto: UpdateKnowledgeArticleDto): Promise<KnowledgeArticle> {
    this.logger.log(`Updating knowledge article: ${id}`);

    const article = await this.findOne(id);
    Object.assign(article, updateDto);

    const updated = await this.articleRepository.save(article);

    this.logger.log(`Knowledge article updated: ${id}`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing knowledge article: ${id}`);

    const article = await this.findOne(id);
    await this.articleRepository.remove(article);

    this.logger.log(`Knowledge article removed: ${id}`);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.articleRepository
      .createQueryBuilder('article')
      .select('DISTINCT article.category', 'category')
      .where('article.category IS NOT NULL')
      .getRawMany();

    return result.map((r) => r.category);
  }

  async getAllTags(): Promise<string[]> {
    const result = await this.articleRepository
      .createQueryBuilder('article')
      .select('UNNEST(article.tags)', 'tag')
      .distinct(true)
      .getRawMany();

    return result.map((r) => r.tag);
  }

  async getPopular(limit: number = MasterConfig.SEARCH_PREVIEW_LIMIT): Promise<KnowledgeArticle[]> {
    return this.articleRepository.find({
      order: { viewCount: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  async getRecent(limit: number = MasterConfig.SEARCH_PREVIEW_LIMIT): Promise<KnowledgeArticle[]> {
    return this.articleRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
