import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { WorkflowTemplate } from './entities/workflow-template.entity';
import { CreateWorkflowTemplateDto, WorkflowCategory } from './dto/create-workflow-template.dto';
import { UpdateWorkflowTemplateDto } from './dto/update-workflow-template.dto';
import { calculateOffset, calculateTotalPages } from '../common/utils/math.utils';
import { validateSortField, validateSortOrder, sanitizeSearchQuery } from '../common/utils/query-validation.util';

@Injectable()
export class WorkflowService {
  // Map camelCase fields to database column names
  private readonly columnMap: Record<string, string> = {
    usageCount: 'usage_count',
    isActive: 'is_active',
    createdBy: 'created_by',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  };

  constructor(
    @InjectRepository(WorkflowTemplate)
    private readonly workflowRepository: Repository<WorkflowTemplate>,
  ) {}

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
    const workflow = await this.workflowRepository.findOne({ where: { id } });
    
    if (!workflow) {
      throw new NotFoundException(`Workflow template with ID ${id} not found`);
    }

    return workflow;
  }

  async update(id: string, updateDto: UpdateWorkflowTemplateDto): Promise<WorkflowTemplate> {
    const workflow = await this.findOne(id);

    if (updateDto.stages) {
      updateDto.stages.sort((a, b) => a.order - b.order);
    }

    Object.assign(workflow, updateDto);
    return await this.workflowRepository.save(workflow);
  }

  async remove(id: string): Promise<void> {
    const workflow = await this.findOne(id);
    await this.workflowRepository.remove(workflow);
  }

  async instantiate(id: string, caseId: string) {
    const workflow = await this.findOne(id);

    // Increment usage count
    workflow.usageCount++;
    await this.workflowRepository.save(workflow);

    // Generate tasks from stages
    const tasks = workflow.stages.map((stage, index) => ({
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
