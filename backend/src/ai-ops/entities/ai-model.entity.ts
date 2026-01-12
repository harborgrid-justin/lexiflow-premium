import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ai_models')
export class AIModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  type!: string; // 'embedding', 'classification', 'generation', etc.

  @Column({ nullable: true })
  provider!: string; // 'openai', 'google', 'anthropic', etc.

  @Column()
  version!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column('jsonb')
  configuration!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'inactive' | 'training';

  @Column({ type: 'jsonb', nullable: true })
  performance: Record<string, unknown> | null = null;

  @Column({ type: 'bigint', default: 0 })
  usageCount!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsed!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
