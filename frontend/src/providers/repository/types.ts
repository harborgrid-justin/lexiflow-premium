/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║               REPOSITORY INTERFACE CONTRACTS                              ║
 * ║                     Enterprise Data Access Layer                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * @module providers/repository/types
 * @description Stable repository interfaces that abstract transport details
 * 
 * PRINCIPLES APPLIED:
 * 2. Expose Stable Repository Interface
 * 3. Do Not Expose Transport Details
 * 9. Avoid Cross-Domain Dependencies
 * 11. Instrument Observability
 */

// ═══════════════════════════════════════════════════════════════════════════
//                         CORE REPOSITORY INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base repository interface - all domain repositories implement this
 * No HTTP details, no query params, no transport specifics
 */
export interface BaseRepository<T, TId = string> {
  /**
   * Retrieve all entities with optional filtering
   * @param filters Domain-specific filter criteria (NOT query params)
   */
  getAll(filters?: Record<string, unknown>): Promise<T[]>;

  /**
   * Retrieve entity by ID
   * @param id Entity identifier
   */
  getById(id: TId): Promise<T | null>;

  /**
   * Create new entity
   * @param data Entity data (validated at domain level)
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Update existing entity
   * @param id Entity identifier
   * @param data Partial update data
   */
  update(id: TId, data: Partial<T>): Promise<T>;

  /**
   * Delete entity
   * @param id Entity identifier
   */
  delete(id: TId): Promise<void>;
}

/**
 * Extended repository with batch operations
 */
export interface BatchRepository<T, TId = string> extends BaseRepository<T, TId> {
  /**
   * Create multiple entities in one operation
   */
  createBatch(items: Partial<T>[]): Promise<T[]>;

  /**
   * Delete multiple entities by IDs
   */
  deleteBatch(ids: TId[]): Promise<void>;
}

/**
 * Repository with search capabilities
 */
export interface SearchableRepository<T, TId = string> extends BaseRepository<T, TId> {
  /**
   * Search entities using domain-specific criteria
   * @param query Domain search query (NOT SQL/HTTP query)
   * @param options
   */
  search(query: string, options?: SearchOptions): Promise<SearchResult<T>>;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
//                         DOMAIN REPOSITORIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Case management repository
 * Example of domain-specific operations (no HTTP/transport details)
 */
export interface CaseRepository<T = unknown> extends SearchableRepository<T> {
  /**
   * Get cases by status (domain operation, not SQL query)
   */
  getByStatus(status: string): Promise<T[]>;

  /**
   * Archive a case (business logic, not database operation)
   */
  archive(id: string): Promise<T>;
}

/**
 * Document repository with versioning
 */
export interface DocumentRepository<T = unknown> extends BaseRepository<T> {
  /**
   * Get document versions (domain concept)
   */
  getVersions(documentId: string): Promise<T[]>;

  /**
   * Upload document content (abstracted from HTTP multipart)
   */
  upload(file: File, metadata: Record<string, unknown>): Promise<T>;
}

/**
 * Compliance repository with audit trail
 */
export interface ComplianceRepository<T = unknown> extends BaseRepository<T> {
  /**
   * Check conflicts (business rule)
   */
  checkConflicts(clientId: string): Promise<ConflictResult>;

  /**
   * Run compliance scan (domain operation)
   */
  scan(entityId: string, entityType: string): Promise<ScanResult>;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }>;
}

export interface ScanResult {
  passed: boolean;
  issues: Array<{
    rule: string;
    message: string;
  }>;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//                         REPOSITORY REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Central repository registry
 * Pattern 8: Memoize repository instances for referential stability
 */
export interface RepositoryRegistry {
  /**
   * Core domain repositories
   */
  cases: CaseRepository;
  documents: DocumentRepository;
  compliance: ComplianceRepository;
  
  /**
   * Discovery & Evidence
   */
  evidence: BaseRepository<unknown>;
  discovery: BaseRepository<unknown>;
  
  /**
   * Litigation & Trial
   */
  pleadings: BaseRepository<unknown>;
  depositions: BaseRepository<unknown>;
  hearings: BaseRepository<unknown>;
  
  /**
   * Firm Operations
   */
  billing: BaseRepository<unknown>;
  timeEntries: BaseRepository<unknown>;
  clients: SearchableRepository<unknown>;
  
  /**
   * Analytics & Reporting
   */
  analytics: BaseRepository<unknown>;
  reports: BaseRepository<unknown>;
  
  /**
   * Add more as needed - each domain gets ONE repository
   * Pattern 9: Repositories should not depend on each other
   */
}

/**
 * Repository factory function signature
 * Used to create repository instances with dependency injection
 */
export type RepositoryFactory<T extends BaseRepository<unknown>> = (
  config: RepositoryConfig
) => T;

/**
 * Repository configuration (NOT transport config)
 * Pattern 7: Support multiple environments explicitly
 */
export interface RepositoryConfig {
  /**
   * Environment configuration
   */
  environment: 'development' | 'staging' | 'production';
  
  /**
   * API version (Pattern 14)
   */
  apiVersion: string;
  
  /**
   * Observability hooks (Pattern 11)
   */
  logger?: RepositoryLogger;
  tracer?: RepositoryTracer;
  metrics?: RepositoryMetrics;
  
  /**
   * Timeout configuration (Pattern 10)
   */
  timeout: number;
  
  /**
   * Retry configuration (Pattern 10)
   */
  retry: {
    maxAttempts: number;
    backoffMs: number;
    retryableErrors: string[];
  };
  
  /**
   * Authentication provider (Pattern 4)
   * Injected dependency, not exposed to consumers
   */
  authProvider?: AuthProvider;
}

// ═══════════════════════════════════════════════════════════════════════════
//                         SUPPORTING INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pattern 11: Observability interfaces
 */
export interface RepositoryLogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

export interface RepositoryTracer {
  startSpan(operation: string, metadata?: Record<string, unknown>): Span;
}

export interface Span {
  end(result?: { success: boolean; error?: Error }): void;
  addEvent(name: string, attributes?: Record<string, unknown>): void;
}

export interface RepositoryMetrics {
  recordOperation(
    repository: string,
    operation: string,
    durationMs: number,
    success: boolean
  ): void;
  recordError(repository: string, operation: string, error: Error): void;
}

/**
 * Pattern 4: Centralized authentication
 * Provider handles tokens, refresh, permissions internally
 */
export interface AuthProvider {
  getAccessToken(): Promise<string | null>;
  refreshToken(): Promise<void>;
  checkPermission(resource: string, action: string): Promise<boolean>;
}

/**
 * Pattern 15: Document data ownership
 */
export interface DataOwnership {
  /**
   * What data does this repository OWN?
   */
  owns: string[];
  
  /**
   * What data does it FETCH but not cache?
   */
  fetches: string[];
  
  /**
   * What data should NEVER be cached?
   */
  neverCache: string[];
  
  /**
   * Consistency guarantees
   */
  consistency: 'strong' | 'eventual' | 'none';
}
