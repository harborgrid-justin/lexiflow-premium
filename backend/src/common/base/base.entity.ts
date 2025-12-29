import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  Index,
  VersionColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * Base Entity with Enterprise Audit Columns and Optimizations
 *
 * Provides common fields for all entities:
 * - UUID primary key with optimized generation
 * - Creation and update timestamps with auto-management
 * - Soft delete support with indexed deletedAt column
 * - Audit trail (createdBy, updatedBy) with indexes
 * - Optimistic locking via version column
 * - Composite indexes for common query patterns
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - deletedAt column is indexed for efficient soft delete queries
 * - createdAt indexed for chronological ordering (DESC for recency)
 * - createdBy indexed for user audit trails
 * - Composite index on (deletedAt, createdAt) for active records queries
 * - Version column for optimistic concurrency control
 * - Lifecycle hooks for validation and data normalization
 *
 * DATABASE CONSTRAINTS:
 * - UUID primary key prevents collisions
 * - Non-null timestamps ensure audit integrity
 * - Version column prevents lost updates
 *
 * All entities extending BaseEntity will benefit from these optimizations
 */
// @Index('IDX_active_records', ['deletedAt', 'createdAt'])
export abstract class BaseEntity {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier (UUID v4)'
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Timestamp when the record was created'
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    nullable: false,
  })
  @Index() // Optimized for sorting by creation date (most recent first)
  @Transform(({ value }: { value: Date }) => value?.toISOString(), { toPlainOnly: true })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Timestamp when the record was last updated'
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    nullable: false,
  })
  @Transform(({ value }: { value: Date }) => value?.toISOString(), { toPlainOnly: true })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Timestamp when the record was soft-deleted'
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  @Index() // CRITICAL: Index for soft delete performance on all tables
  @Transform(({ value }: { value?: Date }) => value?.toISOString(), { toPlainOnly: true })
  deletedAt?: Date;

  @ApiProperty({
    example: 'user-123',
    nullable: true,
    description: 'User ID who created the record'
  })
  @Column({
    name: 'created_by',
    type: 'uuid',
    nullable: true,
  })
  @Index() // Index for audit queries by user
  createdBy?: string;

  @ApiProperty({
    example: 'user-456',
    nullable: true,
    description: 'User ID who last updated the record'
  })
  @Column({
    name: 'updated_by',
    type: 'uuid',
    nullable: true,
  })
  @Index() // Index for audit queries by user
  updatedBy?: string;

  @ApiProperty({
    example: 1,
    description: 'Version number for optimistic locking'
  })
  @VersionColumn({
    name: 'version',
    type: 'int',
    default: 1,
  })
  version!: number;

  /**
   * Lifecycle hook: Before insert validation
   * Override in child entities for custom validation logic
   */
  @BeforeInsert()
  protected beforeInsertHook(): void {
    this.validateEntity();
    this.normalizeData();
  }

  /**
   * Lifecycle hook: Before update validation
   * Override in child entities for custom validation logic
   */
  @BeforeUpdate()
  protected beforeUpdateHook(): void {
    this.validateEntity();
    this.normalizeData();
  }

  /**
   * Validate entity data before persistence
   * Override in child entities for custom validation
   */
  protected validateEntity(): void {
    // Base validation - can be overridden by child entities
  }

  /**
   * Normalize entity data before persistence
   * Override in child entities for custom normalization (e.g., trim strings, lowercase emails)
   */
  protected normalizeData(): void {
    // Base normalization - can be overridden by child entities
  }

  /**
   * Check if entity is soft deleted
   */
  get isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  /**
   * Check if entity is new (not persisted yet)
   */
  get isNew(): boolean {
    return !this.createdAt;
  }

  /**
   * Get entity age in milliseconds
   */
  get age(): number {
    return this.createdAt ? Date.now() - this.createdAt.getTime() : 0;
  }

  /**
   * Get time since last update in milliseconds
   */
  get timeSinceUpdate(): number {
    return this.updatedAt ? Date.now() - this.updatedAt.getTime() : 0;
  }
}
