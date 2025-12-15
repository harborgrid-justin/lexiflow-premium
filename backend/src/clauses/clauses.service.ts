import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Clause, ClauseCategory } from './entities/clause.entity';
import { CreateClauseDto } from './dto/create-clause.dto';
import { UpdateClauseDto } from './dto/update-clause.dto';

@Injectable()
export class ClausesService {
  private readonly logger = new Logger(ClausesService.name);

  constructor(
    @InjectRepository(Clause)
    private clauseRepository: Repository<Clause>,
  ) {}

  /**
   * Create a new clause
   */
  async create(
    createClauseDto: CreateClauseDto,
    userId?: string,
  ): Promise<Clause> {
    try {
      const clause = this.clauseRepository.create({
        ...createClauseDto,
        createdBy: userId,
      });

      const savedClause = await this.clauseRepository.save(clause);
      this.logger.log(`Clause created: ${savedClause.id}`);

      return savedClause;
    } catch (error) {
      this.logger.error('Failed to create clause', error);
      throw error;
    }
  }

  /**
   * Find all clauses with optional filtering
   */
  async findAll(
    category?: ClauseCategory,
    search?: string,
    tag?: string,
    isActive?: boolean,
  ): Promise<Clause[]> {
    const query = this.clauseRepository.createQueryBuilder('clause');

    if (category) {
      query.andWhere('clause.category = :category', { category });
    }

    if (search) {
      query.andWhere(
        '(clause.title ILIKE :search OR clause.content ILIKE :search OR clause.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (tag) {
      query.andWhere(':tag = ANY(clause.tags)', { tag });
    }

    if (isActive !== undefined) {
      query.andWhere('clause.isActive = :isActive', { isActive });
    }

    query.orderBy('clause.usageCount', 'DESC');
    query.addOrderBy('clause.createdAt', 'DESC');

    return await query.getMany();
  }

  /**
   * Find a clause by ID
   */
  async findOne(id: string): Promise<Clause> {
    const clause = await this.clauseRepository.findOne({ where: { id } });

    if (!clause) {
      throw new NotFoundException(`Clause with ID ${id} not found`);
    }

    return clause;
  }

  /**
   * Update a clause
   */
  async update(
    id: string,
    updateClauseDto: UpdateClauseDto,
    userId?: string,
  ): Promise<Clause> {
    const clause = await this.findOne(id);

    Object.assign(clause, updateClauseDto);
    clause.updatedBy = userId;

    const updatedClause = await this.clauseRepository.save(clause);
    this.logger.log(`Clause updated: ${id}`);

    return updatedClause;
  }

  /**
   * Delete a clause
   */
  async remove(id: string): Promise<void> {
    const clause = await this.findOne(id);

    await this.clauseRepository.remove(clause);
    this.logger.log(`Clause deleted: ${id}`);
  }

  /**
   * Increment usage count when clause is used
   */
  async incrementUsage(id: string): Promise<Clause> {
    const clause = await this.findOne(id);

    clause.usageCount += 1;
    clause.lastUsedAt = new Date();

    const updated = await this.clauseRepository.save(clause);
    this.logger.log(`Clause usage incremented: ${id}`);
    return updated;
  }

  /**
   * Get most used clauses
   */
  async getMostUsed(limit: number = 10): Promise<Clause[]> {
    return await this.clauseRepository.find({
      where: { isActive: true },
      order: { usageCount: 'DESC' },
      take: limit,
    });
  }

  /**
   * Search clauses by content
   */
  async searchByContent(searchTerm: string): Promise<Clause[]> {
    return await this.clauseRepository.find({
      where: {
        content: Like(`%${searchTerm}%`),
        isActive: true,
      },
      order: { usageCount: 'DESC' },
    });
  }

  /**
   * Get clauses by category
   */
  async findByCategory(category: ClauseCategory): Promise<Clause[]> {
    return await this.clauseRepository.find({
      where: { category, isActive: true },
      order: { usageCount: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Duplicate a clause
   */
  async duplicate(id: string, userId?: string): Promise<Clause> {
    const original = await this.findOne(id);

    const duplicated = this.clauseRepository.create({
      title: `${original.title} (Copy)`,
      content: original.content,
      description: original.description,
      category: original.category,
      tags: original.tags,
      isActive: original.isActive,
      metadata: original.metadata,
      usageCount: 0,
      createdBy: userId,
    });

    const savedClause = await this.clauseRepository.save(duplicated);
    this.logger.log(`Clause duplicated: ${id} -> ${savedClause.id}`);

    return savedClause;
  }

  async findByTag(tag: string): Promise<Clause[]> {
    const query = this.clauseRepository.createQueryBuilder('clause');
    query.where(':tag = ANY(clause.tags)', { tag });
    query.andWhere('clause.isActive = :isActive', { isActive: true });
    return await query.getMany();
  }

  async search(params: { query: string; page: number; limit: number }): Promise<{ data: Clause[]; total: number }> {
    const query = this.clauseRepository.createQueryBuilder('clause');
    query.where('(clause.title ILIKE :search OR clause.content ILIKE :search)', { search: `%${params.query}%` });
    query.orderBy('clause.usageCount', 'DESC');
    query.skip((params.page - 1) * params.limit);
    query.take(params.limit);
    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async getCategories(): Promise<string[]> {
    const query = this.clauseRepository.createQueryBuilder('clause');
    query.select('clause.category', 'category');
    query.distinct(true);
    const results = await query.getRawMany();
    return results.map(r => r.category);
  }
}
