import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('backup_schedules')
export class BackupSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  cronExpression: string; // Cron schedule

  @Column()
  type: string; // 'full', 'incremental'

  @Column('simple-array', { nullable: true })
  databases: string[];

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: 7 })
  retentionDays: number;

  @Column({ type: 'timestamp', nullable: true })
  lastRun: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextRun: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
