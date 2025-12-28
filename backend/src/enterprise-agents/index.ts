/**
 * Enterprise Agents Module - Public API
 *
 * Exports all components of the enterprise multi-agent system
 * for use throughout the application.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

export * from './interfaces/agent.interfaces';

export * from './core/base-agent';

export * from './events/agent-event-bus';

export * from './registry/agent-registry';

export * from './agents/core-data-sync.agent';
export * from './agents/security-compliance.agent';
export * from './agents/analytics-processing.agent';
export * from './agents/document-processing.agent';
export * from './agents/workflow-orchestration.agent';
export * from './agents/notification-dispatch.agent';
export * from './agents/cache-management.agent';
export * from './agents/audit-logging.agent';
export * from './agents/integration-bridge.agent';
export * from './agents/health-monitoring.agent';

export * from './coordinator/coordinator.agent';

export * from './scratchpad/scratchpad-manager.agent';

export * from './enterprise-agents.module';
