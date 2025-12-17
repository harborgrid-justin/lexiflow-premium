import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('sync_conflicts')
export class SyncConflict {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column('jsonb')
  localVersion: Record<string, any>;

  @Column('jsonb')
  remoteVersion: Record<string, any>;

  @Column()
  conflictType: string; // 'update', 'delete', 'concurrent'

  @Column({ default: false })
  resolved: boolean;

  @Column({ nullable: true })
  resolution: string; // 'local', 'remote', 'merge'

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
