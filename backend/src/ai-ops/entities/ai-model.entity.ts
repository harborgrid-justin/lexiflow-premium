import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ai_models')
export class AIModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  type!: string; // 'embedding', 'classification', 'generation', etc.

  @Column()
  provider!: string; // 'openai', 'google', 'anthropic', etc.

  @Column()
  version!: string;

  @Column('jsonb')
  configuration!: Record<string, unknown>;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'bigint', default: 0 })
  usageCount!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsed!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
