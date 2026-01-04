import { calculateOffset, calculateTotalPages } from "@common/utils/math.utils";
import {
  sanitizeSearchQuery,
  validateSortField,
  validateSortOrder,
} from "@common/utils/query-validation.util";
import { Injectable, NotFoundException, OnModuleDestroy } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateWorkflowTemplateDto } from "./dto/create-workflow-template.dto";
import { UpdateWorkflowTemplateDto } from "./dto/update-workflow-template.dto";
import { WorkflowTemplate } from "./entities/workflow-template.entity";
import {
  IPaginatedWorkflowResponse,
  IWorkflowInstantiationResult,
  IWorkflowQueryFilters,
  IWorkflowTask,
} from "./interfaces/workflow.interfaces";

/**
 * ╔=================================================================================================================╗
 * ║WORKFLOW SERVICE - AUTOMATED WORKFLOW & TASK MANAGEMENT                                                          ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  WorkflowDefinitionDto, ExecuteWorkflowDto, TaskDto                                                 ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: WorkflowExecution, TaskList, CompletionStatus                                                      ║

 * ║                                                                                                                 ║
 * ║  FEATURES: • Workflow templates                                                                     ║
 * ║            • Task automation                                                                     ║
 * ║            • Conditional logic                                                                     ║
 * ║            • Notifications║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class WorkflowService implements OnModuleDestroy {
  // Map camelCase fields to database column names
  // In TypeORM QueryBuilder, we should use property names, not column names
  private readonly columnMap: Record<string, string> = {
    usageCount: "usageCount",
    isActive: "isActive",
    createdBy: "createdBy",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  };

  // Memory optimization: Cache for frequently accessed templates
  private readonly templateCache = new Map<string, WorkflowTemplate>();
  private readonly MAX_CACHE_SIZE = 100;

  constructor(
    @InjectRepository(WorkflowTemplate)
    private readonly workflowRepository: Repository<WorkflowTemplate>
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

  async create(
    createDto: CreateWorkflowTemplateDto
  ): Promise<WorkflowTemplate> {
    // Sort stages by order
    createDto.stages.sort((a, b) => a.order - b.order);

    const workflow = this.workflowRepository.create(createDto);
    return await this.workflowRepository.save(workflow);
  }

  async findAll(
    filters: IWorkflowQueryFilters
  ): Promise<IPaginatedWorkflowResponse<WorkflowTemplate>> {
    const {
      category,
      isActive,
      search,
      sortBy,
      sortOrder,
      page = 1,
      limit = 50,
    } = filters;

    const queryBuilder = this.workflowRepository.createQueryBuilder("workflow");

    if (category)
      queryBuilder.andWhere("workflow.category = :category", { category });
    if (isActive !== undefined)
      queryBuilder.andWhere("workflow.is_active = :isActive", { isActive });

    const sanitizedSearch = sanitizeSearchQuery(search);
    if (sanitizedSearch) {
      queryBuilder.andWhere(
        "(workflow.name LIKE :search OR workflow.description LIKE :search)",
        { search: `%${sanitizedSearch}%` }
      );
    }

    const safeSortField = validateSortField("workflow", sortBy, "usageCount");
    const safeSortOrder = validateSortOrder(sortOrder, "DESC");

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
    const cachedTemplate = this.templateCache.get(id);
    if (cachedTemplate) {
      return cachedTemplate;
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

  async update(
    id: string,
    updateDto: UpdateWorkflowTemplateDto
  ): Promise<WorkflowTemplate> {
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
    const workflow = await this.findOne(id);
    if (workflow) {
      await this.workflowRepository.remove(workflow);
    }
    this.templateCache.delete(id);
  }

  async instantiate(
    id: string,
    caseId: string
  ): Promise<IWorkflowInstantiationResult> {
    const workflow = await this.findOne(id);

    // Increment usage count
    workflow.usageCount++;
    await this.workflowRepository.save(workflow);

    // Generate tasks from stages
    const tasks: IWorkflowTask[] = workflow.stages.map((stage) => ({
      title: stage.name,
      description: stage.description || "",
      caseId,
      status: "To Do",
      priority: "Medium",
      order: stage.order,
      dueDate: stage.durationDays
        ? new Date(
            Date.now() + stage.durationDays * 24 * 60 * 60 * 1000
          ).toISOString()
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
