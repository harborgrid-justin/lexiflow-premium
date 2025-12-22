import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('backup_snapshots')
export class BackupSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  type: string; // 'full', 'incremental', 'differential'

  @Column('bigint')
  size: number; // in bytes

  @Column()
  location: string; // S3 path or file path

  @Column({ default: 'completed' })
  status: string; // 'pending', 'in_progress', 'completed', 'failed'

  @Column('jsonb', { nullable: true })
  metadata!: Record<string, any>;

  @Column({ nullable: true })
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date;
}
