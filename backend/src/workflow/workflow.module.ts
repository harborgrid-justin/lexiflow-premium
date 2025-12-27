import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { WorkflowTemplate } from './entities/workflow-template.entity';

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
  imports: [
    TypeOrmModule.forFeature([WorkflowTemplate]),
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService]
})
export class WorkflowModule {}
