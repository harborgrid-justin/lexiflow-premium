/**
 * Enterprise Agents Module
 *
 * Central NestJS module that orchestrates the multi-agent enterprise system.
 * Implements the Orchestrator-Worker pattern with event-driven communication.
 *
 * Architecture:
 * - 10 Worker Agents: Specialized domain handlers
 * - 1 Coordinator Agent: Central orchestrator
 * - 1 Scratchpad Manager: Shared state management
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';

import { AgentEventBus } from './events/agent-event-bus';
import { AgentRegistry } from './registry/agent-registry';

import { CoreDataSyncAgent } from './agents/core-data-sync.agent';
import { SecurityComplianceAgent } from './agents/security-compliance.agent';
import { AnalyticsProcessingAgent } from './agents/analytics-processing.agent';
import { DocumentProcessingAgent } from './agents/document-processing.agent';
import { WorkflowOrchestrationAgent } from './agents/workflow-orchestration.agent';
import { NotificationDispatchAgent } from './agents/notification-dispatch.agent';
import { CacheManagementAgent } from './agents/cache-management.agent';
import { AuditLoggingAgent } from './agents/audit-logging.agent';
import { IntegrationBridgeAgent } from './agents/integration-bridge.agent';
import { HealthMonitoringAgent } from './agents/health-monitoring.agent';

import { CoordinatorAgent } from './coordinator/coordinator.agent';
import { ScratchpadManagerAgent } from './scratchpad/scratchpad-manager.agent';

import { AgentState } from './interfaces/agent.interfaces';

/**
 * Enterprise Agent System Configuration
 */
const AGENT_SYSTEM_CONFIG = {
  maxAgents: 12,
  enableCoordinator: true,
  enableScratchpad: true,
  autoStartAgents: true,
  healthCheckIntervalMs: 60000,
  coordinationIntervalMs: 30000,
};

/**
 * Enterprise Agents Module
 */
@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
  ],
  providers: [
    AgentEventBus,
    AgentRegistry,

    {
      provide: CoreDataSyncAgent,
      useFactory: (eventEmitter: EventEmitter2, dataSource: DataSource) => {
        return new CoreDataSyncAgent(eventEmitter, dataSource);
      },
      inject: [EventEmitter2, DataSource],
    },

    {
      provide: SecurityComplianceAgent,
      useFactory: (eventEmitter: EventEmitter2) => {
        return new SecurityComplianceAgent(eventEmitter);
      },
      inject: [EventEmitter2],
    },

    {
      provide: AnalyticsProcessingAgent,
      useFactory: (eventEmitter: EventEmitter2) => {
        return new AnalyticsProcessingAgent(eventEmitter);
      },
      inject: [EventEmitter2],
    },

    {
      provide: DocumentProcessingAgent,
      useFactory: (eventEmitter: EventEmitter2) => {
        return new DocumentProcessingAgent(eventEmitter);
      },
      inject: [EventEmitter2],
    },

    {
      provide: WorkflowOrchestrationAgent,
      useFactory: (eventEmitter: EventEmitter2) => {
        return new WorkflowOrchestrationAgent(eventEmitter);
      },
      inject: [EventEmitter2],
    },

    {
      provide: NotificationDispatchAgent,
      useFactory: (eventEmitter: EventEmitter2) => {
        return new NotificationDispatchAgent(eventEmitter);
      },
      inject: [EventEmitter2],
    },

    {
      provide: CacheManagementAgent,
      useFactory: (eventEmitter: EventEmitter2) => {
        return new CacheManagementAgent(eventEmitter);
      },
      inject: [EventEmitter2],
    },

    {
      provide: AuditLoggingAgent,
      useFactory: (eventEmitter: EventEmitter2) => {
        return new AuditLoggingAgent(eventEmitter);
      },
      inject: [EventEmitter2],
    },

    {
      provide: IntegrationBridgeAgent,
      useFactory: (eventEmitter: EventEmitter2) => {
        return new IntegrationBridgeAgent(eventEmitter);
      },
      inject: [EventEmitter2],
    },

    {
      provide: HealthMonitoringAgent,
      useFactory: (eventEmitter: EventEmitter2) => {
        return new HealthMonitoringAgent(eventEmitter);
      },
      inject: [EventEmitter2],
    },

    {
      provide: CoordinatorAgent,
      useFactory: (
        eventEmitter: EventEmitter2,
        registry: AgentRegistry,
        eventBus: AgentEventBus,
      ) => {
        return new CoordinatorAgent(eventEmitter, registry, eventBus);
      },
      inject: [EventEmitter2, AgentRegistry, AgentEventBus],
    },

    {
      provide: ScratchpadManagerAgent,
      useFactory: (eventEmitter: EventEmitter2, eventBus: AgentEventBus) => {
        return new ScratchpadManagerAgent(eventEmitter, eventBus);
      },
      inject: [EventEmitter2, AgentEventBus],
    },
  ],
  exports: [
    AgentEventBus,
    AgentRegistry,
    CoreDataSyncAgent,
    SecurityComplianceAgent,
    AnalyticsProcessingAgent,
    DocumentProcessingAgent,
    WorkflowOrchestrationAgent,
    NotificationDispatchAgent,
    CacheManagementAgent,
    AuditLoggingAgent,
    IntegrationBridgeAgent,
    HealthMonitoringAgent,
    CoordinatorAgent,
    ScratchpadManagerAgent,
  ],
})
export class EnterpriseAgentsModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseAgentsModule.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly registry: AgentRegistry,
    private readonly eventBus: AgentEventBus,
    private readonly coreDataSyncAgent: CoreDataSyncAgent,
    private readonly securityComplianceAgent: SecurityComplianceAgent,
    private readonly analyticsProcessingAgent: AnalyticsProcessingAgent,
    private readonly documentProcessingAgent: DocumentProcessingAgent,
    private readonly workflowOrchestrationAgent: WorkflowOrchestrationAgent,
    private readonly notificationDispatchAgent: NotificationDispatchAgent,
    private readonly cacheManagementAgent: CacheManagementAgent,
    private readonly auditLoggingAgent: AuditLoggingAgent,
    private readonly integrationBridgeAgent: IntegrationBridgeAgent,
    private readonly healthMonitoringAgent: HealthMonitoringAgent,
    private readonly coordinatorAgent: CoordinatorAgent,
    private readonly scratchpadManagerAgent: ScratchpadManagerAgent,
  ) {}

  /**
   * Initialize all agents on module start
   */
  async onModuleInit(): Promise<void> {
    const enabled = this.configService.get<string>('ENTERPRISE_AGENTS_ENABLED') !== 'false';

    if (!enabled) {
      this.logger.log('Enterprise Agents System is disabled');
      return;
    }

    this.logger.log('Initializing Enterprise Agent System');
    this.logger.log('');
    this.logger.log('Enterprise Agent Architecture:');
    this.logger.log('  Pattern: Orchestrator-Worker with Event-Driven Communication');
    this.logger.log('  Agents: 10 Workers + 1 Coordinator + 1 Scratchpad Manager');
    this.logger.log('');

    await this.registerAllAgents();
    await this.startAllAgents();

    this.logSystemStatus();
  }

  /**
   * Register all agents with the registry
   */
  private async registerAllAgents(): Promise<void> {
    const agents = [
      { agent: this.coreDataSyncAgent, name: 'CoreDataSyncAgent' },
      { agent: this.securityComplianceAgent, name: 'SecurityComplianceAgent' },
      { agent: this.analyticsProcessingAgent, name: 'AnalyticsProcessingAgent' },
      { agent: this.documentProcessingAgent, name: 'DocumentProcessingAgent' },
      { agent: this.workflowOrchestrationAgent, name: 'WorkflowOrchestrationAgent' },
      { agent: this.notificationDispatchAgent, name: 'NotificationDispatchAgent' },
      { agent: this.cacheManagementAgent, name: 'CacheManagementAgent' },
      { agent: this.auditLoggingAgent, name: 'AuditLoggingAgent' },
      { agent: this.integrationBridgeAgent, name: 'IntegrationBridgeAgent' },
      { agent: this.healthMonitoringAgent, name: 'HealthMonitoringAgent' },
    ];

    for (const { agent, name } of agents) {
      try {
        const result = await this.registry.register(agent, {
          metadata: agent.metadata,
          capabilities: agent.metadata.capabilities,
        });

        if (result.success) {
          this.logger.log(`  Agent ${name} registered`);
        } else {
          this.logger.error(`  Agent ${name} registration failed: ${result.error}`);
        }
      } catch (error) {
        this.logger.error(`  Agent ${name} registration error: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Start all registered agents
   */
  private async startAllAgents(): Promise<void> {
    const agents = this.registry.getAllAgents();

    for (const metadata of agents) {
      try {
        const success = await this.registry.startAgent(metadata.id);
        if (success) {
          this.logger.log(`  Agent ${metadata.name} started`);
        }
      } catch (error) {
        this.logger.error(`  Agent ${metadata.name} start error: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Log system status
   */
  private logSystemStatus(): void {
    const stats = this.registry.getStats();
    const eventBusStats = this.eventBus.getStats();

    this.logger.log('');
    this.logger.log('Enterprise Agent System Status:');
    this.logger.log(`  Total Agents: ${stats.totalAgents}`);
    this.logger.log(`  Active Agents: ${stats.activeAgents}`);
    this.logger.log(`  Worker Agents: ${stats.workerAgents}`);
    this.logger.log(`  Coordinator Agents: ${stats.coordinatorAgents}`);
    this.logger.log(`  Scratchpad Agents: ${stats.scratchpadAgents}`);
    this.logger.log('');
    this.logger.log('Event Bus Status:');
    this.logger.log(`  Active Subscriptions: ${eventBusStats.activeSubscriptions}`);
    this.logger.log(`  Events Published: ${eventBusStats.totalEventsPublished}`);
    this.logger.log(`  Events Delivered: ${eventBusStats.totalEventsDelivered}`);
    this.logger.log('');
    this.logger.log('Enterprise Agent System initialized successfully');
  }
}
