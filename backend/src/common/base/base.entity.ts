import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export abstract class BaseEntity {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  updatedAt: Date;

  @ApiProperty({ example: null, nullable: true })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  deletedAt?: Date;

  @ApiProperty({ example: 'user-123', nullable: true })
  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @ApiProperty({ example: 'user-456', nullable: true })
  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string;
}
