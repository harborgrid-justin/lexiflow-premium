/**
 * Enterprise Agent System - Agent Registry
 *
 * Central registry for managing agent lifecycle, discovery, and health monitoring.
 * Provides service discovery and load balancing capabilities.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IAgent,
  AgentMetadata,
  AgentState,
  AgentHealth,
  AgentRegistrationRequest,
  AgentRegistrationResponse,
  AgentType,
  AgentPriority,
} from '../interfaces/agent.interfaces';
import { AgentEventBus } from '../events/agent-event-bus';

/**
 * Registered agent entry
 */
interface RegisteredAgent {
  agent: IAgent;
  metadata: AgentMetadata;
  registeredAt: Date;
  lastHealthCheck: Date;
  health?: AgentHealth;
  enabled: boolean;
}

/**
 * Registry statistics
 */
export interface RegistryStats {
  totalAgents: number;
  activeAgents: number;
  pausedAgents: number;
  errorAgents: number;
  workerAgents: number;
  coordinatorAgents: number;
  scratchpadAgents: number;
  averageUptime: number;
  totalTasksProcessed: number;
}

/**
 * Enterprise Agent Registry
 * Manages agent lifecycle and provides service discovery
 */
@Injectable()
export class AgentRegistry implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AgentRegistry.name);
  private readonly agents: Map<string, RegisteredAgent> = new Map();
  private readonly capabilityIndex: Map<string, Set<string>> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;
  private readonly maxAgents: number;

  constructor(
    private readonly eventBus: AgentEventBus,
    private readonly configService: ConfigService,
  ) {
    this.maxAgents = this.configService.get<number>('AGENT_REGISTRY_MAX_AGENTS') ?? 12;
  }

  /**
   * Initialize registry on module start
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing Agent Registry');
    this.startHealthChecks();
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down Agent Registry');
    this.stopHealthChecks();
    await this.shutdownAllAgents();
  }

  /**
   * Register an agent
   */
  async register(
    agent: IAgent,
    request: AgentRegistrationRequest,
  ): Promise<AgentRegistrationResponse> {
    const { metadata } = request;

    if (this.agents.size >= this.maxAgents) {
      return {
        success: false,
        agentId: metadata.id,
        registeredAt: new Date(),
        config: {},
        error: `Maximum agent limit reached: ${this.maxAgents}`,
      };
    }

    if (this.agents.has(metadata.id)) {
      return {
        success: false,
        agentId: metadata.id,
        registeredAt: new Date(),
        config: {},
        error: `Agent already registered: ${metadata.id}`,
      };
    }

    try {
      await agent.initialize();

      const entry: RegisteredAgent = {
        agent,
        metadata,
        registeredAt: new Date(),
        lastHealthCheck: new Date(),
        enabled: true,
      };

      this.agents.set(metadata.id, entry);
      this.indexCapabilities(metadata);

      this.logger.log(`Agent registered: ${metadata.name} (${metadata.id})`);

      return {
        success: true,
        agentId: metadata.id,
        registeredAt: entry.registeredAt,
        config: this.getAgentConfig(metadata),
      };
    } catch (error) {
      this.logger.error(`Failed to register agent: ${metadata.name}`, (error as Error).stack);
      return {
        success: false,
        agentId: metadata.id,
        registeredAt: new Date(),
        config: {},
        error: (error as Error).message,
      };
    }
  }

  /**
   * Unregister an agent
   */
  async unregister(agentId: string): Promise<boolean> {
    const entry = this.agents.get(agentId);
    if (!entry) {
      return false;
    }

    try {
      await entry.agent.stop();
    } catch (error) {
      this.logger.warn(`Error stopping agent: ${agentId}`, (error as Error).message);
    }

    this.removeCapabilityIndex(entry.metadata);
    this.agents.delete(agentId);
    this.eventBus.unsubscribeAll(agentId);

    this.logger.log(`Agent unregistered: ${entry.metadata.name} (${agentId})`);

    return true;
  }

  /**
   * Get an agent by ID
   */
  getAgent(agentId: string): IAgent | null {
    return this.agents.get(agentId)?.agent ?? null;
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentMetadata[] {
    return Array.from(this.agents.values()).map(entry => entry.metadata);
  }

  /**
   * Get agents by type
   */
  getAgentsByType(type: AgentType): AgentMetadata[] {
    return Array.from(this.agents.values())
      .filter(entry => entry.metadata.type === type)
      .map(entry => entry.metadata);
  }

  /**
   * Get agents by capability
   */
  getAgentsByCapability(capability: string): AgentMetadata[] {
    const agentIds = this.capabilityIndex.get(capability);
    if (!agentIds) {
      return [];
    }

    return Array.from(agentIds)
      .map(id => this.agents.get(id)?.metadata)
      .filter((m): m is AgentMetadata => m !== undefined);
  }

  /**
   * Get agent health
   */
  async getAgentHealth(agentId: string): Promise<AgentHealth | null> {
    const entry = this.agents.get(agentId);
    if (!entry) {
      return null;
    }

    try {
      const health = await entry.agent.getHealth();
      entry.health = health;
      entry.lastHealthCheck = new Date();
      return health;
    } catch (error) {
      this.logger.error(`Failed to get health for agent: ${agentId}`, (error as Error).message);
      return null;
    }
  }

  /**
   * Get all agent health
   */
  async getAllAgentHealth(): Promise<Map<string, AgentHealth>> {
    const healthMap = new Map<string, AgentHealth>();

    await Promise.all(
      Array.from(this.agents.keys()).map(async agentId => {
        const health = await this.getAgentHealth(agentId);
        if (health) {
          healthMap.set(agentId, health);
        }
      }),
    );

    return healthMap;
  }

  /**
   * Start an agent
   */
  async startAgent(agentId: string): Promise<boolean> {
    const entry = this.agents.get(agentId);
    if (!entry) {
      return false;
    }

    try {
      await entry.agent.start();
      entry.enabled = true;
      this.logger.log(`Agent started: ${entry.metadata.name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to start agent: ${agentId}`, (error as Error).stack);
      return false;
    }
  }

  /**
   * Stop an agent
   */
  async stopAgent(agentId: string): Promise<boolean> {
    const entry = this.agents.get(agentId);
    if (!entry) {
      return false;
    }

    try {
      await entry.agent.stop();
      entry.enabled = false;
      this.logger.log(`Agent stopped: ${entry.metadata.name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to stop agent: ${agentId}`, (error as Error).stack);
      return false;
    }
  }

  /**
   * Pause an agent
   */
  async pauseAgent(agentId: string): Promise<boolean> {
    const entry = this.agents.get(agentId);
    if (!entry) {
      return false;
    }

    try {
      await entry.agent.pause();
      this.logger.log(`Agent paused: ${entry.metadata.name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to pause agent: ${agentId}`, (error as Error).message);
      return false;
    }
  }

  /**
   * Resume an agent
   */
  async resumeAgent(agentId: string): Promise<boolean> {
    const entry = this.agents.get(agentId);
    if (!entry) {
      return false;
    }

    try {
      await entry.agent.resume();
      this.logger.log(`Agent resumed: ${entry.metadata.name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to resume agent: ${agentId}`, (error as Error).message);
      return false;
    }
  }

  /**
   * Get registry statistics
   */
  getStats(): RegistryStats {
    let activeAgents = 0;
    let pausedAgents = 0;
    let errorAgents = 0;
    let workerAgents = 0;
    let coordinatorAgents = 0;
    let scratchpadAgents = 0;
    let totalUptime = 0;
    let totalTasksProcessed = 0;

    for (const entry of this.agents.values()) {
      const state = entry.agent.getState();

      if (state === AgentState.PROCESSING) activeAgents++;
      if (state === AgentState.PAUSED) pausedAgents++;
      if (state === AgentState.ERROR) errorAgents++;

      if (entry.metadata.type === AgentType.WORKER) workerAgents++;
      if (entry.metadata.type === AgentType.COORDINATOR) coordinatorAgents++;
      if (entry.metadata.type === AgentType.SCRATCHPAD) scratchpadAgents++;

      if (entry.health) {
        totalUptime += entry.health.uptime;
        totalTasksProcessed += entry.health.completedTaskCount;
      }
    }

    return {
      totalAgents: this.agents.size,
      activeAgents,
      pausedAgents,
      errorAgents,
      workerAgents,
      coordinatorAgents,
      scratchpadAgents,
      averageUptime: this.agents.size > 0 ? totalUptime / this.agents.size : 0,
      totalTasksProcessed,
    };
  }

  /**
   * Find best agent for a capability
   */
  findBestAgentForCapability(capability: string): IAgent | null {
    const agentIds = this.capabilityIndex.get(capability);
    if (!agentIds || agentIds.size === 0) {
      return null;
    }

    let bestAgent: RegisteredAgent | null = null;
    let lowestLoad = Infinity;

    for (const agentId of agentIds) {
      const entry = this.agents.get(agentId);
      if (!entry || !entry.enabled || entry.agent.getState() !== AgentState.PROCESSING) {
        continue;
      }

      const load = entry.health?.activeTaskCount ?? 0;
      if (load < lowestLoad) {
        lowestLoad = load;
        bestAgent = entry;
      }
    }

    return bestAgent?.agent ?? null;
  }

  /**
   * Index agent capabilities
   */
  private indexCapabilities(metadata: AgentMetadata): void {
    for (const capability of metadata.capabilities) {
      let agentSet = this.capabilityIndex.get(capability);
      if (!agentSet) {
        agentSet = new Set();
        this.capabilityIndex.set(capability, agentSet);
      }
      agentSet.add(metadata.id);
    }
  }

  /**
   * Remove agent from capability index
   */
  private removeCapabilityIndex(metadata: AgentMetadata): void {
    for (const capability of metadata.capabilities) {
      const agentSet = this.capabilityIndex.get(capability);
      if (agentSet) {
        agentSet.delete(metadata.id);
        if (agentSet.size === 0) {
          this.capabilityIndex.delete(capability);
        }
      }
    }
  }

  /**
   * Get agent configuration
   */
  private getAgentConfig(metadata: AgentMetadata): Record<string, unknown> {
    return {
      heartbeatIntervalMs: this.configService.get<number>('AGENT_HEARTBEAT_INTERVAL_MS') ?? 30000,
      healthCheckIntervalMs: this.configService.get<number>('AGENT_HEALTH_CHECK_INTERVAL_MS') ?? 60000,
      maxConcurrentTasks: this.configService.get<number>('AGENT_MAX_CONCURRENT_TASKS') ?? 10,
      taskTimeoutMs: this.configService.get<number>('AGENT_TASK_TIMEOUT_MS') ?? 300000,
    };
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    const interval = this.configService.get<number>('AGENT_HEALTH_CHECK_INTERVAL_MS') ?? 60000;
    this.healthCheckInterval = setInterval(
      () => this.performHealthChecks(),
      interval,
    );
  }

  /**
   * Stop periodic health checks
   */
  private stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Perform health checks on all agents
   */
  private async performHealthChecks(): Promise<void> {
    this.logger.debug('Performing agent health checks');

    for (const [agentId, entry] of this.agents) {
      try {
        const health = await entry.agent.getHealth();
        entry.health = health;
        entry.lastHealthCheck = new Date();

        if (health.state === AgentState.ERROR) {
          this.logger.warn(`Agent in error state: ${entry.metadata.name}`);
        }
      } catch (error) {
        this.logger.error(`Health check failed for agent: ${agentId}`, (error as Error).message);
      }
    }
  }

  /**
   * Shutdown all agents
   */
  private async shutdownAllAgents(): Promise<void> {
    this.logger.log('Shutting down all agents');

    await Promise.all(
      Array.from(this.agents.values()).map(async entry => {
        try {
          await entry.agent.stop();
        } catch (error) {
          this.logger.error(
            `Error stopping agent: ${entry.metadata.name}`,
            (error as Error).message,
          );
        }
      }),
    );

    this.agents.clear();
    this.capabilityIndex.clear();
  }
}
