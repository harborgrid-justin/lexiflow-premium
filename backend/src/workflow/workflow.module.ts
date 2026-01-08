import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { WorkflowTemplate } from './entities/workflow-template.entity';
import {
  Workflow,
  WorkflowStep,
  WorkflowExecution,
  ApprovalChain,
  AutomationRule,
  WebhookEndpoint,
} from './entities';

// Controllers
import { WorkflowInstancesController } from './workflow-instances.controller';
import { WorkflowController } from './workflow.controller';

// Services
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowService } from './workflow.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowBuilderService } from './workflow-builder.service';
import { ApprovalChainService } from './approval-chain.service';
import { TaskAutomationService } from './task-automation.service';
import { NotificationRulesService } from './notification-rules.service';
import { IntegrationWebhooksService } from './integration-webhooks.service';
import { WorkflowTemplatesService } from './workflow-templates.service';

/**
 * Workflow Module
 * Enterprise workflow automation and orchestration
 *
 * Features:
 * - Visual workflow builder with drag-drop interface
 * - Multi-step process automation with conditional logic
 * - Approval chains (sequential, parallel, unanimous, majority)
 * - Task automation with triggers and actions
 * - Webhook integrations for external systems
 * - Pre-built legal workflow templates
 * - Real-time execution monitoring
 * - Notification rules and alerts
 *
 * Common Legal Workflows:
 * - New matter intake
 * - Document approval
 * - Invoice approval
 * - Conflict checks
 * - Contract review
 * - Client onboarding
 * - Litigation filing
 * - Discovery response
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Legacy entities
      WorkflowTemplate,
      WorkflowInstance,
      // New workflow automation entities
      Workflow,
      WorkflowStep,
      WorkflowExecution,
      ApprovalChain,
      AutomationRule,
      WebhookEndpoint,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [WorkflowController, WorkflowInstancesController],
  providers: [
    // Legacy services
    WorkflowService,
    WorkflowInstancesService,
    // New workflow automation services
    WorkflowEngineService,
    WorkflowBuilderService,
    ApprovalChainService,
    TaskAutomationService,
    NotificationRulesService,
    IntegrationWebhooksService,
    WorkflowTemplatesService,
  ],
  exports: [
    // Legacy services
    WorkflowService,
    WorkflowInstancesService,
    // New workflow automation services
    WorkflowEngineService,
    WorkflowBuilderService,
    ApprovalChainService,
    TaskAutomationService,
    NotificationRulesService,
    IntegrationWebhooksService,
    WorkflowTemplatesService,
  ],
})
export class WorkflowModule {}
