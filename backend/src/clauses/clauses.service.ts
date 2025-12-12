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
  async incrementUsage(id: string): Promise<void> {
    const clause = await this.findOne(id);

    clause.usageCount += 1;
    clause.lastUsedAt = new Date();

    await this.clauseRepository.save(clause);
    this.logger.log(`Clause usage incremented: ${id}`);
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
   * Interpolate variables in clause content
   */
  interpolateClause(clause: Clause, variables: Record<string, any>): string {
    let interpolatedContent = clause.content;

    // Simple variable interpolation using {{variableName}} syntax
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      interpolatedContent = interpolatedContent.replace(regex, String(value));
    });

    // Check for default variables
    if (clause.variables) {
      Object.entries(clause.variables).forEach(([key, defaultValue]) => {
        if (!(key in variables)) {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          interpolatedContent = interpolatedContent.replace(regex, String(defaultValue));
        }
      });
    }

    return interpolatedContent;
  }

  /**
   * Get clause with interpolated content
   */
  async getInterpolatedClause(
    id: string,
    variables: Record<string, any>,
  ): Promise<{ clause: Clause; interpolatedContent: string }> {
    const clause = await this.findOne(id);
    const interpolatedContent = this.interpolateClause(clause, variables);

    // Increment usage count
    await this.incrementUsage(id);

    return {
      clause,
      interpolatedContent,
    };
  }

  /**
   * Extract variables from clause content
   */
  extractVariables(content: string): string[] {
    const variableRegex = /{{\\s*([a-zA-Z_][a-zA-Z0-9_]*)\\s*}}/g;
    const variables = new Set<string>();
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  /**
   * Validate clause variables
   */
  async validateClauseVariables(
    id: string,
    variables: Record<string, any>,
  ): Promise<{
    valid: boolean;
    missingVariables: string[];
    extraVariables: string[];
  }> {
    const clause = await this.findOne(id);
    const requiredVariables = this.extractVariables(clause.content);
    const providedVariables = Object.keys(variables);

    const missingVariables = requiredVariables.filter(
      (v) => !providedVariables.includes(v) && !(clause.variables && v in clause.variables),
    );
    const extraVariables = providedVariables.filter(
      (v) => !requiredVariables.includes(v),
    );

    return {
      valid: missingVariables.length === 0,
      missingVariables,
      extraVariables,
    };
  }

  /**
   * Batch interpolate multiple clauses
   */
  async batchInterpolate(
    clauseIds: string[],
    variables: Record<string, any>,
  ): Promise<Array<{ clauseId: string; interpolatedContent: string }>> {
    const results = [];

    for (const clauseId of clauseIds) {
      try {
        const { clause, interpolatedContent } = await this.getInterpolatedClause(
          clauseId,
          variables,
        );
        results.push({
          clauseId: clause.id,
          interpolatedContent,
        });
      } catch (error) {
        this.logger.warn(`Failed to interpolate clause ${clauseId}`, error);
      }
    }

    return results;
  }

  /**
   * Preview clause with variables
   */
  async previewClause(
    id: string,
    variables: Record<string, any>,
  ): Promise<{
    original: string;
    interpolated: string;
    variables: string[];
    missingVariables: string[];
  }> {
    const clause = await this.findOne(id);
    const interpolatedContent = this.interpolateClause(clause, variables);
    const requiredVariables = this.extractVariables(clause.content);
    const providedVariables = Object.keys(variables);
    const missingVariables = requiredVariables.filter(
      (v) => !providedVariables.includes(v) && !(clause.variables && v in clause.variables),
    );

    return {
      original: clause.content,
      interpolated: interpolatedContent,
      variables: requiredVariables,
      missingVariables,
    };
  }
}
