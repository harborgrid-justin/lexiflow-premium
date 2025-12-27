import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * Base Entity with Enterprise Audit Columns
 *
 * Provides common fields for all entities:
 * - UUID primary key
 * - Creation and update timestamps
 * - Soft delete support with indexed deletedAt column
 * - Audit trail (createdBy, updatedBy)
 *
 * PERFORMANCE: deletedAt column is indexed for efficient soft delete queries
 * All entities extending BaseEntity will benefit from this index
 */
export abstract class BaseEntity {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  @Index() // Index for sorting by creation date
  @Transform(({ value }: { value: Date }) => value?.toISOString(), { toPlainOnly: true })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  @Transform(({ value }: { value: Date }) => value?.toISOString(), { toPlainOnly: true })
  updatedAt!: Date;

  @ApiProperty({ example: null, nullable: true })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Index() // CRITICAL: Index for soft delete performance on all tables
  @Transform(({ value }: { value?: Date }) => value?.toISOString(), { toPlainOnly: true })
  deletedAt?: Date;

  @ApiProperty({ example: 'user-123', nullable: true })
  @Column({ name: 'created_by', nullable: true })
  @Index() // Index for audit queries by user
  createdBy?: string;

  @ApiProperty({ example: 'user-456', nullable: true })
  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string;
}
