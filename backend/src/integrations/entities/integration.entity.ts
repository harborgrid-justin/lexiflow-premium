import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PENDING = 'pending',
}

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  type!: string;

  @Column({ nullable: true })
  provider?: string;

  @Column({ type: 'jsonb', nullable: true })
  config!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  credentials?: Record<string, unknown>;

  @Column({ 
    type: 'enum',
    enum: IntegrationStatus,
    default: IntegrationStatus.INACTIVE 
  })
  status!: IntegrationStatus;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ default: false })
  syncEnabled!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt?: Date;

  @Column({ nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
