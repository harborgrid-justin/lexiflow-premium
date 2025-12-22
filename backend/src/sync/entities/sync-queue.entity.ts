import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CONFLICT = 'conflict',
}

@Entity('sync_queue')
export class SyncQueue {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  operation: string; // 'create', 'update', 'delete'

  @Column()
  entityType!: string;

  @Column()
  entityId!: string;

  @Column('jsonb')
  payload!: Record<string, any>;

  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  status!: SyncStatus;

  @Column({ default: 0 })
  retryCount!: number;

  @Column({ nullable: true })
  error!: string;

  @Column({ nullable: true })
  userId!: string;

  @Column({ type: 'timestamp', nullable: true })
  syncedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
