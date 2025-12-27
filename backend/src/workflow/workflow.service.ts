import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { WorkflowTemplate } from './entities/workflow-template.entity';
import { CreateWorkflowTemplateDto, WorkflowCategory } from './dto/create-workflow-template.dto';
import { UpdateWorkflowTemplateDto } from './dto/update-workflow-template.dto';
import { calculateOffset, calculateTotalPages } from '../common/utils/math.utils';
import { validateSortField, validateSortOrder, sanitizeSearchQuery } from '../common/utils/query-validation.util';

@Injectable()
export class WorkflowService implements OnModuleDestroy {
  // Map camelCase fields to database column names
  private readonly columnMap: Record<string, string> = {
    usageCount: 'usage_count',
    isActive: 'is_active',
    createdBy: 'created_by',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  };
  
  // Memory optimization: Cache for frequently accessed templates
  private readonly templateCache = new Map<string, WorkflowTemplate>();
  private readonly MAX_CACHE_SIZE = 100;

  constructor(
    @InjectRepository(WorkflowTemplate)
    private readonly workflowRepository: Repository<WorkflowTemplate>,
  ) {}

  onModuleDestroy() {
    this.templateCache.clear();
  }

  /**
   * Enforce LRU eviction on template cache
   */
  private enforceCacheLRU(): void {
    if (this.templateCache.size > this.MAX_CACHE_SIZE) {
      const toRemove = Math.floor(this.MAX_CACHE_SIZE * 0.1);
      const iterator = this.templateCache.keys();
      for (let i = 0; i < toRemove; i++) {
        const key = iterator.next().value;
        if (key !== undefined) {
          this.templateCache.delete(key);
        }
      }
    }
  }

  async create(createDto: CreateWorkflowTemplateDto): Promise<WorkflowTemplate> {
    // Sort stages by order
    createDto.stages.sort((a, b) => a.order - b.order);

    const workflow = this.workflowRepository.create(createDto);
    return await this.workflowRepository.save(workflow);
  }

  async findAll(filters: {
    category?: WorkflowCategory;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, isActive, search, sortBy, sortOrder, page = 1, limit = 50 } = filters;
    
    const queryBuilder = this.workflowRepository.createQueryBuilder('workflow');

    if (category) queryBuilder.andWhere('workflow.category = :category', { category });
    if (isActive !== undefined) queryBuilder.andWhere('workflow.is_active = :isActive', { isActive });
    
    const sanitizedSearch = sanitizeSearchQuery(search);
    if (sanitizedSearch) {
      queryBuilder.andWhere(
        '(workflow.name LIKE :search OR workflow.description LIKE :search)',
        { search: `%${sanitizedSearch}%` }
      );
    }

    const safeSortField = validateSortField('workflow', sortBy, 'usageCount');
    const safeSortOrder = validateSortOrder(sortOrder, 'DESC');

    // Map camelCase to snake_case for database column
    const dbColumnName = this.columnMap[safeSortField] || safeSortField;

    const [data, total] = await queryBuilder
      .orderBy(`workflow.${dbColumnName}`, safeSortOrder)
      .skip(calculateOffset(page, limit))
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: calculateTotalPages(total, limit),
    };
  }

  async findOne(id: string): Promise<WorkflowTemplate> {
    if (this.templateCache.has(id)) {
      return this.templateCache.get(id)!;
    }

    const workflow = await this.workflowRepository.findOne({ where: { id } });
    
    if (!workflow) {
      throw new NotFoundException(`Workflow template with ID ${id} not found`);
    }

    // Cache the result and enforce LRU limits
    this.templateCache.set(id, workflow);
    this.enforceCacheLRU();

    return workflow;
  }

  async update(id: string, updateDto: UpdateWorkflowTemplateDto): Promise<WorkflowTemplate> {
    const workflow = await this.findOne(id);

    if (updateDto.stages) {
      updateDto.stages.sort((a, b) => a.order - b.order);
    }

    Object.assign(workflow, updateDto);
    const saved = await this.workflowRepository.save(workflow);
    
    // Invalidate cache
    this.templateCache.delete(id);
    
    return saved;
  }

  async remove(id: string): Promise<void> {
    await this.workflowRepository.delete(id);
    this.templateCache.delete(id);
  }
    const workflow = await this.findOne(id);
    await this.workflowRepository.remove(workflow);
  }

  async instantiate(id: string, caseId: string) {
    const workflow = await this.findOne(id);

    // Increment usage count
    workflow.usageCount++;
    await this.workflowRepository.save(workflow);

    // Generate tasks from stages
    const tasks = workflow.stages.map((stage, _index) => ({
      title: stage.name,
      description: stage.description || '',
      caseId,
      status: 'To Do',
      priority: 'Medium',
      order: stage.order,
      dueDate: stage.durationDays 
        ? new Date(Date.now() + stage.durationDays * 24 * 60 * 60 * 1000).toISOString()
        : null,
      workflowTemplateId: workflow.id,
    }));

    return {
      tasks,
      caseId,
      templateId: workflow.id,
      templateName: workflow.name,
    };
  }
}
