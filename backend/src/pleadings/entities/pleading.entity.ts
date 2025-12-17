import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from '../../cases/entities/case.entity';

export enum PleadingType {
  COMPLAINT = 'complaint',
  ANSWER = 'answer',
  MOTION = 'motion',
  BRIEF = 'brief',
  MEMORANDUM = 'memorandum',
  REPLY = 'reply',
  OPPOSITION = 'opposition',
  PETITION = 'petition',
  RESPONSE = 'response',
}

export enum PleadingStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  FILED = 'filed',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('pleadings')
@Index(['caseId', 'type'])
@Index(['status'])
@Index(['filedDate'])
export class Pleading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PleadingType,
  })
  type: PleadingType;

  @Column({ type: 'uuid' })
  @Index()
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'uuid', nullable: true })
  documentId: string;

  @Column({
    type: 'enum',
    enum: PleadingStatus,
    default: PleadingStatus.DRAFT,
  })
  status: PleadingStatus;

  @Column({ type: 'timestamp', nullable: true })
  filedDate: Date;

  @Column({ nullable: true })
  filedBy: string;

  @Column({ nullable: true })
  courtName: string;

  @Column({ nullable: true })
  caseNumber: string;

  @Column({ nullable: true })
  docketNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  hearingDate: Date;

  @Column({ nullable: true })
  judge: string;

  @Column({ type: 'simple-array', nullable: true })
  parties: string[];

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
