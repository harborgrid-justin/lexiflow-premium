/**
 * Data Agent Registry
 *
 * Manages registration and discovery of data handling agents.
 *
 * @module DataAgentRegistry
 * @version 1.0.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { DataAgentType } from '../interfaces/data-agent.interfaces';

interface RegisteredAgent {
  id: string;
  type: DataAgentType;
  name: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'busy' | 'error';
  registeredAt: Date;
  lastHeartbeat: Date;
  taskCount: number;
}

@Injectable()
export class DataAgentRegistry {
  private readonly logger = new Logger(DataAgentRegistry.name);
  private readonly agents = new Map<string, RegisteredAgent>();

  register(
    id: string,
    type: DataAgentType,
    name: string,
    capabilities: string[],
  ): void {
    this.agents.set(id, {
      id,
      type,
      name,
      capabilities,
      status: 'idle',
      registeredAt: new Date(),
      lastHeartbeat: new Date(),
      taskCount: 0,
    });
    this.logger.log(`Registered data agent: ${name} (${type})`);
  }

  unregister(id: string): boolean {
    const agent = this.agents.get(id);
    if (agent) {
      this.agents.delete(id);
      this.logger.log(`Unregistered data agent: ${agent.name}`);
      return true;
    }
    return false;
  }

  updateStatus(id: string, status: RegisteredAgent['status']): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status = status;
      agent.lastHeartbeat = new Date();
    }
  }

  incrementTaskCount(id: string): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.taskCount++;
    }
  }

  getAgent(id: string): RegisteredAgent | undefined {
    return this.agents.get(id);
  }

  getAgentsByType(type: DataAgentType): RegisteredAgent[] {
    return Array.from(this.agents.values()).filter(a => a.type === type);
  }

  getAgentsByCapability(capability: string): RegisteredAgent[] {
    return Array.from(this.agents.values()).filter(a =>
      a.capabilities.includes(capability),
    );
  }

  getActiveAgents(): RegisteredAgent[] {
    return Array.from(this.agents.values()).filter(
      a => a.status === 'active' || a.status === 'idle',
    );
  }

  getAllAgents(): RegisteredAgent[] {
    return Array.from(this.agents.values());
  }

  getStats(): {
    total: number;
    active: number;
    idle: number;
    busy: number;
    error: number;
  } {
    const agents = Array.from(this.agents.values());
    return {
      total: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      idle: agents.filter(a => a.status === 'idle').length,
      busy: agents.filter(a => a.status === 'busy').length,
      error: agents.filter(a => a.status === 'error').length,
    };
  }
}
