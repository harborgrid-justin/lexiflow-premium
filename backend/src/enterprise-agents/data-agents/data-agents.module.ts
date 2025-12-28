/**
 * Enterprise Data Handling Agents Module
 *
 * Specialized multi-agent system for enterprise data management,
 * validation, synchronization, and quality assurance.
 *
 * @module DataAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Data Handling Agents
import { DataValidationAgent } from './agents/data-validation.agent';
import { DataTransformationAgent } from './agents/data-transformation.agent';
import { DataMigrationAgent } from './agents/data-migration.agent';
import { DataQualityAgent } from './agents/data-quality.agent';
import { DataIndexingAgent } from './agents/data-indexing.agent';
import { DataReplicationAgent } from './agents/data-replication.agent';
import { DataArchivalAgent } from './agents/data-archival.agent';
import { DataRecoveryAgent } from './agents/data-recovery.agent';
import { DataIntegrityAgent } from './agents/data-integrity.agent';
import { DataOptimizationAgent } from './agents/data-optimization.agent';

// Coordination
import { DataCoordinatorAgent } from './coordinator/data-coordinator.agent';
import { DataScratchpadManager } from './scratchpad/data-scratchpad.manager';
import { DataAgentRegistry } from './registry/data-agent-registry';
import { DataEventBus } from './events/data-event-bus';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 50,
    }),
  ],
  providers: [
    // Infrastructure
    DataAgentRegistry,
    DataEventBus,
    DataScratchpadManager,

    // Coordinator
    DataCoordinatorAgent,

    // Data Handling Agents
    DataValidationAgent,
    DataTransformationAgent,
    DataMigrationAgent,
    DataQualityAgent,
    DataIndexingAgent,
    DataReplicationAgent,
    DataArchivalAgent,
    DataRecoveryAgent,
    DataIntegrityAgent,
    DataOptimizationAgent,
  ],
  exports: [
    DataCoordinatorAgent,
    DataScratchpadManager,
    DataAgentRegistry,
    DataEventBus,
  ],
})
export class DataAgentsModule {}
