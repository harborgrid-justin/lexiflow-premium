import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowTriggerService } from './workflow-trigger.service';
import { WorkflowConditionsService } from './workflow-conditions.service';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { WorkflowStep } from './entities/workflow-step.entity';

/**
 * Workflow Engine Module
 * Provides BPMN-style workflow execution capabilities
 */
@Module({
  imports: [TypeOrmModule.forFeature([WorkflowInstance, WorkflowStep])],
  providers: [
    WorkflowEngineService,
    WorkflowTriggerService,
    WorkflowConditionsService,
  ],
  exports: [
    WorkflowEngineService,
    WorkflowTriggerService,
    WorkflowConditionsService,
  ],
})
export class WorkflowEngineModule {}
