import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow, WorkflowStep, WorkflowTriggerType, WorkflowStatus, StepType } from './entities';

export interface WorkflowDefinition {
  name: string;
  description?: string;
  tenantId: string;
  trigger: WorkflowTriggerType;
  triggerConfig?: Record<string, any>;
  category?: string;
  tags?: string[];
  steps: StepDefinition[];
  metadata?: Record<string, any>;
}

export interface StepDefinition {
  name: string;
  description?: string;
  type: StepType;
  order: number;
  config: Record<string, any>;
  conditions?: any[];
  required?: boolean;
  allowSkip?: boolean;
  timeoutSeconds?: number;
  retryCount?: number;
  assignedTo?: string;
  assignedRole?: string;
  estimatedDurationHours?: number;
  dependencies?: string[];
}

/**
 * WorkflowBuilderService
 * Service for creating and managing custom workflow definitions
 */
@Injectable()
export class WorkflowBuilderService {
  private readonly logger = new Logger(WorkflowBuilderService.name);

  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepo: Repository<Workflow>,
    @InjectRepository(WorkflowStep)
    private readonly stepRepo: Repository<WorkflowStep>,
  ) {}

  /**
   * Create a new workflow from definition
   */
  async createWorkflow(definition: WorkflowDefinition): Promise<Workflow> {
    this.logger.log(`Creating workflow: ${definition.name}`);

    // Validate workflow definition
    this.validateWorkflowDefinition(definition);

    // Create workflow entity
    const workflow = this.workflowRepo.create({
      name: definition.name,
      description: definition.description,
      tenantId: definition.tenantId,
      trigger: definition.trigger,
      triggerConfig: definition.triggerConfig,
      category: definition.category,
      tags: definition.tags,
      status: WorkflowStatus.DRAFT,
      active: false,
      metadata: definition.metadata,
    });

    const savedWorkflow = await this.workflowRepo.save(workflow);

    // Create workflow steps
    const steps = definition.steps.map((step) =>
      this.stepRepo.create({
        workflowId: savedWorkflow.id,
        name: step.name,
        description: step.description,
        type: step.type,
        order: step.order,
        config: step.config,
        conditions: step.conditions,
        required: step.required !== false,
        allowSkip: step.allowSkip || false,
        timeoutSeconds: step.timeoutSeconds,
        retryCount: step.retryCount || 0,
        assignedTo: step.assignedTo,
        assignedRole: step.assignedRole,
        estimatedDurationHours: step.estimatedDurationHours,
        dependencies: step.dependencies,
      }),
    );

    await this.stepRepo.save(steps);

    this.logger.log(`Workflow ${savedWorkflow.id} created with ${steps.length} steps`);

    return savedWorkflow;
  }

  /**
   * Update existing workflow
   */
  async updateWorkflow(workflowId: string, updates: Partial<WorkflowDefinition>): Promise<Workflow> {
    this.logger.log(`Updating workflow: ${workflowId}`);

    const workflow = await this.workflowRepo.findOne({ where: { id: workflowId } });

    if (!workflow) {
      throw new BadRequestException(`Workflow ${workflowId} not found`);
    }

    // Update workflow properties
    if (updates.name) workflow.name = updates.name;
    if (updates.description !== undefined) workflow.description = updates.description;
    if (updates.trigger) workflow.trigger = updates.trigger;
    if (updates.triggerConfig) workflow.triggerConfig = updates.triggerConfig;
    if (updates.category) workflow.category = updates.category;
    if (updates.tags) workflow.tags = updates.tags;
    if (updates.metadata) workflow.metadata = updates.metadata;

    await this.workflowRepo.save(workflow);

    // Update steps if provided
    if (updates.steps) {
      // Delete existing steps
      await this.stepRepo.delete({ workflowId });

      // Create new steps
      const steps = updates.steps.map((step) =>
        this.stepRepo.create({
          workflowId,
          ...step,
          required: step.required !== false,
        }),
      );

      await this.stepRepo.save(steps);
    }

    return workflow;
  }

  /**
   * Add step to workflow
   */
  async addStep(workflowId: string, stepDef: StepDefinition): Promise<WorkflowStep> {
    const workflow = await this.workflowRepo.findOne({ where: { id: workflowId } });

    if (!workflow) {
      throw new BadRequestException(`Workflow ${workflowId} not found`);
    }

    const step = this.stepRepo.create({
      workflowId,
      ...stepDef,
      required: stepDef.required !== false,
    });

    return this.stepRepo.save(step);
  }

  /**
   * Update step
   */
  async updateStep(stepId: string, updates: Partial<StepDefinition>): Promise<WorkflowStep> {
    const step = await this.stepRepo.findOne({ where: { id: stepId } });

    if (!step) {
      throw new BadRequestException(`Step ${stepId} not found`);
    }

    Object.assign(step, updates);
    return this.stepRepo.save(step);
  }

  /**
   * Remove step from workflow
   */
  async removeStep(stepId: string): Promise<void> {
    await this.stepRepo.delete(stepId);
  }

  /**
   * Reorder steps
   */
  async reorderSteps(workflowId: string, stepOrders: Array<{ stepId: string; order: number }>): Promise<void> {
    for (const { stepId, order } of stepOrders) {
      await this.stepRepo.update(stepId, { order });
    }
  }

  /**
   * Clone workflow
   */
  async cloneWorkflow(workflowId: string, newName: string, tenantId: string): Promise<Workflow> {
    const original = await this.workflowRepo.findOne({
      where: { id: workflowId },
      relations: ['steps'],
    });

    if (!original) {
      throw new BadRequestException(`Workflow ${workflowId} not found`);
    }

    const steps = await this.stepRepo.find({
      where: { workflowId },
      order: { order: 'ASC' },
    });

    // Create new workflow
    const cloned = this.workflowRepo.create({
      name: newName,
      description: `Cloned from ${original.name}`,
      tenantId,
      trigger: original.trigger,
      triggerConfig: original.triggerConfig,
      category: original.category,
      tags: original.tags,
      status: WorkflowStatus.DRAFT,
      active: false,
      metadata: { ...original.metadata, clonedFrom: workflowId },
    });

    const savedWorkflow = await this.workflowRepo.save(cloned);

    // Clone steps
    const clonedSteps = steps.map((step) =>
      this.stepRepo.create({
        workflowId: savedWorkflow.id,
        name: step.name,
        description: step.description,
        type: step.type,
        order: step.order,
        config: step.config,
        conditions: step.conditions,
        required: step.required,
        allowSkip: step.allowSkip,
        timeoutSeconds: step.timeoutSeconds,
        retryCount: step.retryCount,
        assignedTo: step.assignedTo,
        assignedRole: step.assignedRole,
        estimatedDurationHours: step.estimatedDurationHours,
      }),
    );

    await this.stepRepo.save(clonedSteps);

    return savedWorkflow;
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(workflowId: string): Promise<void> {
    const workflow = await this.workflowRepo.findOne({ where: { id: workflowId } });

    if (!workflow) {
      throw new BadRequestException(`Workflow ${workflowId} not found`);
    }

    // Validate workflow is complete
    const steps = await this.stepRepo.find({ where: { workflowId } });
    if (steps.length === 0) {
      throw new BadRequestException('Workflow must have at least one step');
    }

    workflow.status = WorkflowStatus.ACTIVE;
    workflow.active = true;
    await this.workflowRepo.save(workflow);

    this.logger.log(`Workflow ${workflowId} activated`);
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow(workflowId: string): Promise<void> {
    await this.workflowRepo.update(workflowId, {
      status: WorkflowStatus.INACTIVE,
      active: false,
    });

    this.logger.log(`Workflow ${workflowId} deactivated`);
  }

  /**
   * Archive workflow
   */
  async archiveWorkflow(workflowId: string): Promise<void> {
    await this.workflowRepo.update(workflowId, {
      status: WorkflowStatus.ARCHIVED,
      active: false,
    });

    this.logger.log(`Workflow ${workflowId} archived`);
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.stepRepo.delete({ workflowId });
    await this.workflowRepo.delete(workflowId);

    this.logger.log(`Workflow ${workflowId} deleted`);
  }

  /**
   * Get workflow with steps
   */
  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    return this.workflowRepo.findOne({
      where: { id: workflowId },
      relations: ['steps'],
    });
  }

  /**
   * List workflows for tenant
   */
  async listWorkflows(
    tenantId: string,
    filters?: {
      status?: WorkflowStatus;
      category?: string;
      active?: boolean;
      search?: string;
    },
  ): Promise<Workflow[]> {
    const query = this.workflowRepo.createQueryBuilder('workflow').where('workflow.tenantId = :tenantId', { tenantId });

    if (filters?.status) {
      query.andWhere('workflow.status = :status', { status: filters.status });
    }

    if (filters?.category) {
      query.andWhere('workflow.category = :category', { category: filters.category });
    }

    if (filters?.active !== undefined) {
      query.andWhere('workflow.active = :active', { active: filters.active });
    }

    if (filters?.search) {
      query.andWhere('(workflow.name ILIKE :search OR workflow.description ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    return query.orderBy('workflow.createdAt', 'DESC').getMany();
  }

  /**
   * Validate workflow definition
   */
  private validateWorkflowDefinition(definition: WorkflowDefinition): void {
    if (!definition.name || definition.name.trim().length === 0) {
      throw new BadRequestException('Workflow name is required');
    }

    if (!definition.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    if (!definition.trigger) {
      throw new BadRequestException('Workflow trigger is required');
    }

    if (!definition.steps || definition.steps.length === 0) {
      throw new BadRequestException('Workflow must have at least one step');
    }

    // Validate step orders are sequential
    const orders = definition.steps.map((s) => s.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i) {
        throw new BadRequestException('Step orders must be sequential starting from 0');
      }
    }

    // Validate step types
    const validTypes = Object.values(StepType);
    for (const step of definition.steps) {
      if (!validTypes.includes(step.type)) {
        throw new BadRequestException(`Invalid step type: ${step.type}`);
      }
    }
  }

  /**
   * Export workflow as JSON
   */
  async exportWorkflow(workflowId: string): Promise<WorkflowDefinition> {
    const workflow = await this.workflowRepo.findOne({ where: { id: workflowId } });

    if (!workflow) {
      throw new BadRequestException(`Workflow ${workflowId} not found`);
    }

    const steps = await this.stepRepo.find({
      where: { workflowId },
      order: { order: 'ASC' },
    });

    return {
      name: workflow.name,
      description: workflow.description,
      tenantId: workflow.tenantId,
      trigger: workflow.trigger,
      triggerConfig: workflow.triggerConfig,
      category: workflow.category,
      tags: workflow.tags,
      steps: steps.map((s) => ({
        name: s.name,
        description: s.description,
        type: s.type,
        order: s.order,
        config: s.config,
        conditions: s.conditions,
        required: s.required,
        allowSkip: s.allowSkip,
        timeoutSeconds: s.timeoutSeconds,
        retryCount: s.retryCount,
        assignedTo: s.assignedTo,
        assignedRole: s.assignedRole,
        estimatedDurationHours: s.estimatedDurationHours,
        dependencies: s.dependencies,
      })),
      metadata: workflow.metadata,
    };
  }

  /**
   * Import workflow from JSON
   */
  async importWorkflow(definition: WorkflowDefinition): Promise<Workflow> {
    return this.createWorkflow(definition);
  }
}
