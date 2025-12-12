import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('version_changes')
@Index(['documentId', 'timestamp'])
@Index(['changeType'])
export class VersionChange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  documentId: string;

  @Column({ type: 'int' })
  fromVersion: number;

  @Column({ type: 'int' })
  toVersion: number;

  @Column()
  changeType: string;

  @Column({ type: 'jsonb', nullable: true })
  changeDetails: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  changedBy: string;

  @CreateDateColumn()
  timestamp: Date;
}
