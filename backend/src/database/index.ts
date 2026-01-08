/**
 * Database Utilities Export
 *
 * Centralized exports for all database-related utilities including:
 * - Constraint decorators
 * - Index analysis and recommendations
 * - Migration helpers
 * - Performance monitoring
 * - Advanced query building
 * - Database validators
 * - Enterprise entities
 */

// Enterprise Entities
export {
  EnterpriseOrganization,
  SSOConfiguration,
  ComplianceRecord,
  LegalResearchQuery,
  BillingTransaction,
  ENTERPRISE_ENTITIES,
  ENTITY_METADATA,
  getEntitiesInMigrationOrder,
} from './entities';

// Constraint Decorators
export {
  PositiveNumber,
  NonNegativeNumber,
  NumberRange,
  EmailFormat,
  NonEmptyString,
  StringLength,
  DateAfter,
  DateBefore,
  FutureDate,
  PastDate,
  EnumValues,
  MutuallyExclusive,
  AtLeastOneRequired,
  ConditionalRequired,
  Percentage,
  JsonNotEmpty,
  CaseInsensitiveUnique,
  CompositeUnique,
  PartialUnique,
  CurrencyAmount,
  PhoneNumberFormat,
  UrlFormat,
  Alphanumeric,
  IpAddressFormat,
} from './constraints.decorator';

// Index Analyzer Service
export {
  IndexAnalyzerService,
  type IndexRecommendation,
  type IndexAnalysis,
  type MissingIndexInfo,
  type DuplicateIndexInfo,
} from './index-analyzer.service';

// Migration Helpers
export {
  ColumnTypes,
  createBaseTable,
  addForeignKey,
  createIndex,
  createUniqueConstraint,
  createCheckConstraint,
  createEnum,
  dropEnum,
  enableUuidExtension,
  enablePgTrgmExtension,
  createFullTextIndex,
  createUpdatedAtTrigger,
  dropUpdatedAtTrigger,
  createAuditTrigger,
  dropAuditTrigger,
  createView,
  dropView,
  addTableComment,
  addColumnComment,
  batchInsert,
} from './migration.helper';

// Performance Monitor Service
export {
  DatabasePerformanceMonitor,
  type QueryStats,
  type SlowQuery,
  type PoolStats,
  type TableStats,
  type IndexStats,
} from './performance-monitor.service';

// Query Builder Utilities
export {
  AdvancedQueryBuilder,
  QueryBuilderFactory,
  createAdvancedQueryBuilder,
  FilterOperator,
  type FilterCondition,
  type SortConfig,
  type JoinConfig,
  type PaginationConfig,
} from './query-builder.util';

// Database Validators
export {
  ExistsValidator,
  Exists,
  IsUniqueValidator,
  IsUnique,
  IsCompositeUniqueValidator,
  IsCompositeUnique,
  NotDeletedValidator,
  NotDeleted,
  RelationCountValidator,
  RelationCount,
  MatchesDbEnumValidator,
  MatchesDbEnum,
} from './validators';
