import { calculateOffset, calculateTotalPages } from "@common/utils/math.utils";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  CreateWorkflowInstanceDto,
  UpdateWorkflowInstanceDto,
  WorkflowInstanceQueryDto,
} from "./dto/workflow-instance.dto";
import {
  WorkflowInstance,
  WorkflowInstanceStatus,
} from "./entities/workflow-instance.entity";
import { WorkflowTemplate } from "./entities/workflow-template.entity";

export interface PaginatedWorkflowInstances {
  data: WorkflowInstance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class WorkflowInstancesService {
  private readonly logger = new Logger(WorkflowInstancesService.name);

  constructor(
    @InjectRepository(WorkflowInstance)
    private readonly instanceRepository: Repository<WorkflowInstance>,
    @InjectRepository(WorkflowTemplate)
    private readonly templateRepository: Repository<WorkflowTemplate>
  ) {}

  async create(dto: CreateWorkflowInstanceDto): Promise<WorkflowInstance> {
    // Verify template exists
    const template = await this.templateRepository.findOne({
      where: { id: dto.templateId },
    });

    if (!template) {
      throw new NotFoundException(
        `Workflow template with ID ${dto.templateId} not found`
      );
    }

    const instance = this.instanceRepository.create({
      templateId: dto.templateId,
      caseId: dto.caseId,
      createdBy: dto.createdBy,
      status: WorkflowInstanceStatus.PENDING,
      currentStep: 0,
      stepData: {},
    });

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(
      `Created workflow instance ${saved.id} for template ${dto.templateId} and case ${dto.caseId}`
    );

    // Increment usage count on template
    await this.templateRepository.increment(
      { id: dto.templateId },
      "usageCount",
      1
    );

    return saved;
  }

  async findAll(
    query: WorkflowInstanceQueryDto
  ): Promise<PaginatedWorkflowInstances> {
    const { status, caseId, templateId, page = 1, limit = 50 } = query;

    const queryBuilder = this.instanceRepository
      .createQueryBuilder("instance")
      .leftJoinAndSelect("instance.template", "template");

    if (status) {
      queryBuilder.andWhere("instance.status = :status", { status });
    }

    if (caseId) {
      queryBuilder.andWhere("instance.case_id = :caseId", { caseId });
    }

    if (templateId) {
      queryBuilder.andWhere("instance.template_id = :templateId", {
        templateId,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy("instance.created_at", "DESC")
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

  async findOne(id: string): Promise<WorkflowInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id },
      relations: ["template"],
    });

    if (!instance) {
      throw new NotFoundException(`Workflow instance with ID ${id} not found`);
    }

    return instance;
  }

  async update(
    id: string,
    dto: UpdateWorkflowInstanceDto
  ): Promise<WorkflowInstance> {
    const instance = await this.findOne(id);
    Object.assign(instance, dto);
    return await this.instanceRepository.save(instance);
  }

  async pause(id: string): Promise<WorkflowInstance> {
    const instance = await this.findOne(id);

    if (instance.status !== WorkflowInstanceStatus.RUNNING) {
      throw new Error(
        `Cannot pause workflow in status ${instance.status}. Only RUNNING workflows can be paused.`
      );
    }

    instance.status = WorkflowInstanceStatus.PAUSED;
    instance.pausedAt = new Date();

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(`Paused workflow instance ${id}`);
    return saved;
  }

  async resume(id: string): Promise<WorkflowInstance> {
    const instance = await this.findOne(id);

    if (instance.status !== WorkflowInstanceStatus.PAUSED) {
      throw new Error(
        `Cannot resume workflow in status ${instance.status}. Only PAUSED workflows can be resumed.`
      );
    }

    instance.status = WorkflowInstanceStatus.RUNNING;
    instance.pausedAt = undefined;

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(`Resumed workflow instance ${id}`);
    return saved;
  }

  async cancel(id: string): Promise<WorkflowInstance> {
    const instance = await this.findOne(id);

    if (
      instance.status === WorkflowInstanceStatus.COMPLETED ||
      instance.status === WorkflowInstanceStatus.CANCELLED
    ) {
      throw new Error(
        `Cannot cancel workflow in status ${instance.status}. Already finalized.`
      );
    }

    instance.status = WorkflowInstanceStatus.CANCELLED;
    instance.cancelledAt = new Date();

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(`Cancelled workflow instance ${id}`);
    return saved;
  }

  async start(id: string): Promise<WorkflowInstance> {
    const instance = await this.findOne(id);

    if (instance.status !== WorkflowInstanceStatus.PENDING) {
      throw new Error(
        `Cannot start workflow in status ${instance.status}. Only PENDING workflows can be started.`
      );
    }

    instance.status = WorkflowInstanceStatus.RUNNING;
    instance.startedAt = new Date();

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(`Started workflow instance ${id}`);
    return saved;
  }

  async complete(id: string): Promise<WorkflowInstance> {
    const instance = await this.findOne(id);

    if (instance.status !== WorkflowInstanceStatus.RUNNING) {
      throw new Error(
        `Cannot complete workflow in status ${instance.status}. Only RUNNING workflows can be completed.`
      );
    }

    instance.status = WorkflowInstanceStatus.COMPLETED;
    instance.completedAt = new Date();

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(`Completed workflow instance ${id}`);
    return saved;
  }

  async advanceStep(
    id: string,
    stepData?: Record<string, unknown>
  ): Promise<WorkflowInstance> {
    const instance = await this.findOne(id);

    if (instance.status !== WorkflowInstanceStatus.RUNNING) {
      throw new Error(
        `Cannot advance step for workflow in status ${instance.status}. Workflow must be RUNNING.`
      );
    }

    instance.currentStep += 1;
    if (stepData) {
      instance.stepData = {
        ...instance.stepData,
        [`step_${instance.currentStep}`]: stepData,
      };
    }

    const saved = await this.instanceRepository.save(instance);
    this.logger.log(
      `Advanced workflow instance ${id} to step ${instance.currentStep}`
    );
    return saved;
  }

  async remove(id: string): Promise<void> {
    const instance = await this.findOne(id);
    await this.instanceRepository.remove(instance);
    this.logger.log(`Removed workflow instance ${id}`);
  }
}
