/**
 * Enterprise Agent System - Core Interfaces
 *
 * Defines the foundational contracts for the multi-agent coordination system.
 * Implements the Orchestrator-Worker pattern with event-driven communication.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

/**
 * Agent lifecycle states
 */
export enum AgentState {
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  SHUTDOWN = 'SHUTDOWN',
}

/**
 * Agent priority levels for task scheduling
 */
export enum AgentPriority {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
  BACKGROUND = 5,
}

/**
 * Agent type classification
 */
export enum AgentType {
  WORKER = 'WORKER',
  COORDINATOR = 'COORDINATOR',
  SCRATCHPAD = 'SCRATCHPAD',
}

/**
 * Task execution status
 */
export enum TaskStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  RETRY = 'RETRY',
}

/**
 * Agent metadata interface
 */
export interface AgentMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly type: AgentType;
  readonly priority: AgentPriority;
  readonly capabilities: string[];
  readonly dependencies: string[];
  readonly maxConcurrentTasks: number;
  readonly heartbeatIntervalMs: number;
  readonly healthCheckIntervalMs: number;
}

/**
 * Agent health status
 */
export interface AgentHealth {
  agentId: string;
  state: AgentState;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  activeTaskCount: number;
  completedTaskCount: number;
  failedTaskCount: number;
  lastHeartbeat: Date;
  errorCount: number;
  lastError?: string;
  metrics: AgentMetrics;
}

/**
 * Agent performance metrics
 */
export interface AgentMetrics {
  totalTasksProcessed: number;
  averageProcessingTimeMs: number;
  successRate: number;
  throughputPerMinute: number;
  queueDepth: number;
  memoryPeakMb: number;
  cpuPeakPercent: number;
}

/**
 * Task definition interface
 */
export interface AgentTask<TPayload = unknown, TResult = unknown> {
  id: string;
  type: string;
  priority: AgentPriority;
  payload: TPayload;
  status: TaskStatus;
  assignedAgentId?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: TResult;
  error?: string;
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  metadata: Record<string, unknown>;
}

/**
 * Task result wrapper
 */
export interface TaskResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  processingTimeMs: number;
  metadata: Record<string, unknown>;
}

/**
 * Agent event types for inter-agent communication
 */
export enum AgentEventType {
  AGENT_REGISTERED = 'agent.registered',
  AGENT_UNREGISTERED = 'agent.unregistered',
  AGENT_STATE_CHANGED = 'agent.state.changed',
  AGENT_HEALTH_UPDATE = 'agent.health.update',
  AGENT_ERROR = 'agent.error',
  TASK_CREATED = 'task.created',
  TASK_ASSIGNED = 'task.assigned',
  TASK_STARTED = 'task.started',
  TASK_COMPLETED = 'task.completed',
  TASK_FAILED = 'task.failed',
  TASK_CANCELLED = 'task.cancelled',
  SCRATCHPAD_WRITE = 'scratchpad.write',
  SCRATCHPAD_READ = 'scratchpad.read',
  SCRATCHPAD_CLEAR = 'scratchpad.clear',
  COORDINATOR_COMMAND = 'coordinator.command',
  SYNC_REQUEST = 'sync.request',
  SYNC_COMPLETE = 'sync.complete',
}

/**
 * Agent event payload
 */
export interface AgentEvent<T = unknown> {
  id: string;
  type: AgentEventType;
  sourceAgentId: string;
  targetAgentId?: string;
  timestamp: Date;
  payload: T;
  correlationId?: string;
  priority: AgentPriority;
}

/**
 * Scratchpad entry for shared state
 */
export interface ScratchpadEntry<T = unknown> {
  key: string;
  value: T;
  agentId: string;
  timestamp: Date;
  expiresAt?: Date;
  version: number;
  metadata: Record<string, unknown>;
}

/**
 * Coordinator command types
 */
export enum CoordinatorCommand {
  START_AGENT = 'START_AGENT',
  STOP_AGENT = 'STOP_AGENT',
  PAUSE_AGENT = 'PAUSE_AGENT',
  RESUME_AGENT = 'RESUME_AGENT',
  SCALE_UP = 'SCALE_UP',
  SCALE_DOWN = 'SCALE_DOWN',
  REDISTRIBUTE_TASKS = 'REDISTRIBUTE_TASKS',
  HEALTH_CHECK = 'HEALTH_CHECK',
  SYNC_STATE = 'SYNC_STATE',
  EMERGENCY_SHUTDOWN = 'EMERGENCY_SHUTDOWN',
}

/**
 * Coordinator command payload
 */
export interface CoordinatorCommandPayload {
  command: CoordinatorCommand;
  targetAgentIds?: string[];
  parameters: Record<string, unknown>;
  priority: AgentPriority;
  timeoutMs: number;
}

/**
 * Agent registration request
 */
export interface AgentRegistrationRequest {
  metadata: AgentMetadata;
  capabilities: string[];
  initialState?: AgentState;
}

/**
 * Agent registration response
 */
export interface AgentRegistrationResponse {
  success: boolean;
  agentId: string;
  registeredAt: Date;
  config: Record<string, unknown>;
  error?: string;
}

/**
 * Core agent interface - all agents must implement this
 */
export interface IAgent {
  readonly metadata: AgentMetadata;

  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;

  getState(): AgentState;
  getHealth(): Promise<AgentHealth>;

  processTask<TPayload, TResult>(task: AgentTask<TPayload, TResult>): Promise<TaskResult<TResult>>;

  handleEvent(event: AgentEvent): Promise<void>;
  emitEvent<T>(type: AgentEventType, payload: T, targetAgentId?: string): Promise<void>;

  onHeartbeat(): Promise<void>;
  onHealthCheck(): Promise<AgentHealth>;
}

/**
 * Coordinator agent interface
 */
export interface ICoordinatorAgent extends IAgent {
  registerAgent(request: AgentRegistrationRequest): Promise<AgentRegistrationResponse>;
  unregisterAgent(agentId: string): Promise<boolean>;

  getRegisteredAgents(): AgentMetadata[];
  getAgentHealth(agentId: string): Promise<AgentHealth | null>;
  getAllAgentHealth(): Promise<Map<string, AgentHealth>>;

  assignTask(task: AgentTask): Promise<string>;
  redistributeTasks(): Promise<void>;

  executeCommand(command: CoordinatorCommandPayload): Promise<TaskResult>;

  broadcastEvent<T>(type: AgentEventType, payload: T): Promise<void>;
}

/**
 * Scratchpad manager interface
 */
export interface IScratchpadManager extends IAgent {
  write<T>(key: string, value: T, ttlMs?: number): Promise<ScratchpadEntry<T>>;
  read<T>(key: string): Promise<ScratchpadEntry<T> | null>;
  delete(key: string): Promise<boolean>;
  clear(pattern?: string): Promise<number>;

  getKeys(pattern?: string): Promise<string[]>;
  getEntries(pattern?: string): Promise<ScratchpadEntry[]>;

  subscribe(key: string, callback: (entry: ScratchpadEntry) => void): () => void;

  getStats(): ScratchpadStats;
}

/**
 * Scratchpad statistics
 */
export interface ScratchpadStats {
  totalEntries: number;
  totalSizeBytes: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  expirationCount: number;
  averageEntryAgeMs: number;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  enabled: boolean;
  priority: AgentPriority;
  maxConcurrentTasks: number;
  taskTimeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
  heartbeatIntervalMs: number;
  healthCheckIntervalMs: number;
  memoryLimitMb: number;
  cpuLimitPercent: number;
}

/**
 * Enterprise agent system configuration
 */
export interface EnterpriseAgentSystemConfig {
  enabled: boolean;
  maxAgents: number;
  coordinatorConfig: AgentConfig;
  scratchpadConfig: AgentConfig & {
    maxEntrySizeBytes: number;
    maxTotalSizeBytes: number;
    defaultTtlMs: number;
  };
  workerConfigs: Map<string, AgentConfig>;
  eventBusConfig: {
    maxQueueSize: number;
    processingIntervalMs: number;
    retryOnFailure: boolean;
  };
}
