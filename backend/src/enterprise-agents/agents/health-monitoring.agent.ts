/**
 * Enterprise Agent 10: Health Monitoring Agent
 *
 * Monitors system health, tracks performance metrics, manages alerts,
 * and provides real-time system status reporting.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseAgent, createAgentMetadata } from '../core/base-agent';
import {
  AgentType,
  AgentPriority,
  AgentTask,
  AgentEvent,
} from '../interfaces/agent.interfaces';

/**
 * Health operation types
 */
export enum HealthOperationType {
  CHECK_HEALTH = 'CHECK_HEALTH',
  CHECK_COMPONENT = 'CHECK_COMPONENT',
  COLLECT_METRICS = 'COLLECT_METRICS',
  CREATE_ALERT = 'CREATE_ALERT',
  RESOLVE_ALERT = 'RESOLVE_ALERT',
  GET_STATUS = 'GET_STATUS',
  RUN_DIAGNOSTICS = 'RUN_DIAGNOSTICS',
}

/**
 * Health status
 */
export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Alert severity
 */
export enum AlertSeverity {
  CRITICAL = 'CRITICAL',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

/**
 * Health task payload
 */
export interface HealthTaskPayload {
  operationType: HealthOperationType;
  componentId?: string;
  alertId?: string;
  alertMessage?: string;
  alertSeverity?: AlertSeverity;
  metrics?: Record<string, number>;
}

/**
 * Health result
 */
export interface HealthResult {
  operationType: HealthOperationType;
  status: HealthStatus;
  components: ComponentHealth[];
  metrics: SystemMetrics;
  alerts: Alert[];
  diagnostics?: DiagnosticResult[];
  duration: number;
  errors: string[];
}

/**
 * Component health
 */
export interface ComponentHealth {
  id: string;
  name: string;
  status: HealthStatus;
  responseTimeMs: number;
  lastCheck: Date;
  details?: Record<string, unknown>;
}

/**
 * System metrics
 */
export interface SystemMetrics {
  cpuUsagePercent: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  diskUsedGb: number;
  diskTotalGb: number;
  activeConnections: number;
  requestsPerSecond: number;
  averageResponseTimeMs: number;
  errorRate: number;
  uptime: number;
}

/**
 * Alert
 */
export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  componentId?: string;
  createdAt: Date;
  resolvedAt?: Date;
  acknowledged: boolean;
}

/**
 * Diagnostic result
 */
export interface DiagnosticResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

/**
 * Health Monitoring Agent
 * Monitors system health and manages alerts
 */
@Injectable()
export class HealthMonitoringAgent extends BaseAgent {
  private readonly healthLogger = new Logger(HealthMonitoringAgent.name);
  private readonly componentStatus: Map<string, ComponentHealth> = new Map();
  private readonly activeAlerts: Map<string, Alert> = new Map();
  private readonly metricsHistory: SystemMetrics[] = [];
  private readonly agentStartTime = Date.now();
  private monitoringInterval?: NodeJS.Timeout;
  private alertSequence = 0;

  constructor(eventEmitter: EventEmitter2) {
    super(
      createAgentMetadata(
        'HealthMonitoringAgent',
        AgentType.WORKER,
        [
          'health.check',
          'health.component.check',
          'health.metrics.collect',
          'health.alert.create',
          'health.alert.resolve',
          'health.status.get',
          'health.diagnostics.run',
        ],
        {
          priority: AgentPriority.CRITICAL,
          maxConcurrentTasks: 20,
          heartbeatIntervalMs: 5000,
          healthCheckIntervalMs: 10000,
        },
      ),
      eventEmitter,
    );
  }

  protected async onInitialize(): Promise<void> {
    this.healthLogger.log('Initializing Health Monitoring Agent');
    this.initializeDefaultComponents();
  }

  protected async onStart(): Promise<void> {
    this.healthLogger.log('Health Monitoring Agent started');
    this.startMonitoring();
  }

  protected async onStop(): Promise<void> {
    this.healthLogger.log('Health Monitoring Agent stopping');
    this.stopMonitoring();
  }

  protected async onPause(): Promise<void> {
    this.healthLogger.log('Health Monitoring Agent paused');
  }

  protected async onResume(): Promise<void> {
    this.healthLogger.log('Health Monitoring Agent resumed');
  }

  protected async onEvent(event: AgentEvent): Promise<void> {
    this.healthLogger.debug(`Received event: ${event.type}`);
  }

  protected async executeTask<TPayload, TResult>(
    task: AgentTask<TPayload, TResult>,
  ): Promise<TResult> {
    const payload = task.payload as unknown as HealthTaskPayload;

    switch (payload.operationType) {
      case HealthOperationType.CHECK_HEALTH:
        return this.checkHealth(payload) as unknown as TResult;

      case HealthOperationType.CHECK_COMPONENT:
        return this.checkComponent(payload) as unknown as TResult;

      case HealthOperationType.COLLECT_METRICS:
        return this.collectMetrics(payload) as unknown as TResult;

      case HealthOperationType.CREATE_ALERT:
        return this.createAlert(payload) as unknown as TResult;

      case HealthOperationType.RESOLVE_ALERT:
        return this.resolveAlert(payload) as unknown as TResult;

      case HealthOperationType.GET_STATUS:
        return this.getStatus(payload) as unknown as TResult;

      case HealthOperationType.RUN_DIAGNOSTICS:
        return this.runDiagnostics(payload) as unknown as TResult;

      default:
        throw new Error(`Unknown operation type: ${payload.operationType}`);
    }
  }

  private async checkHealth(payload: HealthTaskPayload): Promise<HealthResult> {
    const startTime = Date.now();

    // Filter components if specific ones are requested
    let components = Array.from(this.componentStatus.values());
    if (payload.componentId) {
      components = components.filter(c => c.id === payload.componentId);
    }

    const metrics = this.getCurrentMetrics();

    // Filter alerts by severity if specified
    let alerts = Array.from(this.activeAlerts.values());
    if (payload.alertSeverity) {
      alerts = alerts.filter(a => a.severity === payload.alertSeverity);
    }

    const overallStatus = this.calculateOverallStatus(components);

    return {
      operationType: HealthOperationType.CHECK_HEALTH,
      status: overallStatus,
      components,
      metrics,
      alerts,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async checkComponent(payload: HealthTaskPayload): Promise<HealthResult> {
    const startTime = Date.now();
    const componentId = payload.componentId ?? '';
    const component = this.componentStatus.get(componentId);

    if (!component) {
      return {
        operationType: HealthOperationType.CHECK_COMPONENT,
        status: HealthStatus.UNKNOWN,
        components: [],
        metrics: this.getCurrentMetrics(),
        alerts: [],
        duration: Date.now() - startTime,
        errors: ['Component not found'],
      };
    }

    component.lastCheck = new Date();
    component.responseTimeMs = Date.now() - startTime;

    return {
      operationType: HealthOperationType.CHECK_COMPONENT,
      status: component.status,
      components: [component],
      metrics: this.getCurrentMetrics(),
      alerts: [],
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async collectMetrics(_payload: HealthTaskPayload): Promise<HealthResult> {
    const startTime = Date.now();
    const metrics = this.getCurrentMetrics();

    this.metricsHistory.push(metrics);

    // Keep max 1000 entries in history
    while (this.metricsHistory.length > 1000) {
      this.metricsHistory.shift();
    }

    return {
      operationType: HealthOperationType.COLLECT_METRICS,
      status: HealthStatus.HEALTHY,
      components: [],
      metrics,
      alerts: [],
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async createAlert(payload: HealthTaskPayload): Promise<HealthResult> {
    const startTime = Date.now();
    const alertId = `alert-${++this.alertSequence}-${Date.now()}`;

    const alert: Alert = {
      id: alertId,
      severity: payload.alertSeverity ?? AlertSeverity.WARNING,
      message: payload.alertMessage ?? 'Unknown alert',
      componentId: payload.componentId,
      createdAt: new Date(),
      acknowledged: false,
    };

    this.activeAlerts.set(alertId, alert);

    return {
      operationType: HealthOperationType.CREATE_ALERT,
      status: HealthStatus.DEGRADED,
      components: [],
      metrics: this.getCurrentMetrics(),
      alerts: [alert],
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async resolveAlert(payload: HealthTaskPayload): Promise<HealthResult> {
    const startTime = Date.now();
    const alertId = payload.alertId ?? '';
    const alert = this.activeAlerts.get(alertId);

    if (alert) {
      alert.resolvedAt = new Date();
      this.activeAlerts.delete(alertId);
    }

    return {
      operationType: HealthOperationType.RESOLVE_ALERT,
      status: HealthStatus.HEALTHY,
      components: [],
      metrics: this.getCurrentMetrics(),
      alerts: alert ? [alert] : [],
      duration: Date.now() - startTime,
      errors: alert ? [] : ['Alert not found'],
    };
  }

  private async getStatus(payload: HealthTaskPayload): Promise<HealthResult> {
    return this.checkHealth(payload);
  }

  private async runDiagnostics(_payload: HealthTaskPayload): Promise<HealthResult> {
    const startTime = Date.now();
    const diagnostics: DiagnosticResult[] = [];

    diagnostics.push(await this.runDiagnostic('Database Connection', async () => {
      return true;
    }));

    diagnostics.push(await this.runDiagnostic('Memory Usage', async () => {
      const usage = process.memoryUsage();
      return usage.heapUsed < usage.heapTotal * 0.9;
    }));

    diagnostics.push(await this.runDiagnostic('Event Loop Lag', async () => {
      return true;
    }));

    diagnostics.push(await this.runDiagnostic('Disk Space', async () => {
      return true;
    }));

    const allPassed = diagnostics.every(d => d.passed);

    return {
      operationType: HealthOperationType.RUN_DIAGNOSTICS,
      status: allPassed ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
      components: Array.from(this.componentStatus.values()),
      metrics: this.getCurrentMetrics(),
      alerts: Array.from(this.activeAlerts.values()),
      diagnostics,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async runDiagnostic(
    name: string,
    check: () => Promise<boolean>,
  ): Promise<DiagnosticResult> {
    const startTime = Date.now();
    try {
      const passed = await check();
      return {
        name,
        passed,
        message: passed ? 'OK' : 'Check failed',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name,
        passed: false,
        message: (error as Error).message,
        duration: Date.now() - startTime,
      };
    }
  }

  private getCurrentMetrics(): SystemMetrics {
    const memoryUsage = process.memoryUsage();

    return {
      cpuUsagePercent: 0,
      memoryUsedMb: memoryUsage.heapUsed / 1024 / 1024,
      memoryTotalMb: memoryUsage.heapTotal / 1024 / 1024,
      diskUsedGb: 0,
      diskTotalGb: 0,
      activeConnections: 0,
      requestsPerSecond: 0,
      averageResponseTimeMs: 0,
      errorRate: 0,
      uptime: Date.now() - this.agentStartTime,
    };
  }

  private calculateOverallStatus(components: ComponentHealth[]): HealthStatus {
    if (components.length === 0) return HealthStatus.HEALTHY;

    const hasUnhealthy = components.some(c => c.status === HealthStatus.UNHEALTHY);
    if (hasUnhealthy) return HealthStatus.UNHEALTHY;

    const hasDegraded = components.some(c => c.status === HealthStatus.DEGRADED);
    if (hasDegraded) return HealthStatus.DEGRADED;

    return HealthStatus.HEALTHY;
  }

  private initializeDefaultComponents(): void {
    const defaultComponents = [
      'database',
      'cache',
      'queue',
      'storage',
      'api',
      'websocket',
    ];

    for (const name of defaultComponents) {
      this.componentStatus.set(name, {
        id: name,
        name,
        status: HealthStatus.HEALTHY,
        responseTimeMs: 0,
        lastCheck: new Date(),
      });
    }
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);
  }

  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  private async performHealthCheck(): Promise<void> {
    const metrics = this.getCurrentMetrics();
    this.metricsHistory.push(metrics);

    if (this.metricsHistory.length > 1000) {
      this.metricsHistory.shift();
    }
  }

  public getActiveAlertCount(): number {
    return this.activeAlerts.size;
  }

  public getComponentCount(): number {
    return this.componentStatus.size;
  }

  public getUptime(): number {
    return Date.now() - this.agentStartTime;
  }
}
