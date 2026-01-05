import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkflowInstance } from "./entities/workflow-instance.entity";
import { WorkflowTemplate } from "./entities/workflow-template.entity";
import { WorkflowInstancesController } from "./workflow-instances.controller";
import { WorkflowInstancesService } from "./workflow-instances.service";
import { WorkflowController } from "./workflow.controller";
import { WorkflowService } from "./workflow.service";

/**
 * Workflow Module
 * Customizable workflow templates and automation
 * Features:
 * - Workflow template library
 * - Multi-step process automation
 * - Conditional logic and branching
 * - Task assignment and approval chains
 */
@Module({
  imports: [TypeOrmModule.forFeature([WorkflowTemplate, WorkflowInstance])],
  controllers: [WorkflowController, WorkflowInstancesController],
  providers: [WorkflowService, WorkflowInstancesService],
  exports: [WorkflowService, WorkflowInstancesService],
})
export class WorkflowModule {}
