import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Case } from '../../cases/entities/case.entity';

export enum ExhibitType {
  DOCUMENT = 'document',
  PHOTOGRAPH = 'photograph',
  VIDEO = 'video',
  AUDIO = 'audio',
  PHYSICAL_OBJECT = 'physical_object',
  DIAGRAM = 'diagram',
  CHART = 'chart',
  REPORT = 'report',
  OTHER = 'other',
}

export enum ExhibitStatus {
  PREPARED = 'prepared',
  MARKED = 'marked',
  OFFERED = 'offered',
  ADMITTED = 'admitted',
  REFUSED = 'refused',
  WITHDRAWN = 'withdrawn',
  STIPULATED = 'stipulated',
  DRAFT = 'draft',
}

@Entity('trial_exhibits')
@Index(['caseId'])
@Index(['exhibitNumber'])
@Index(['status'])
@Index(['exhibitType'])
export class TrialExhibit extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'exhibit_number', type: 'varchar', length: 100 })
  exhibitNumber!: string;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({
    name: 'exhibit_type',
    type: 'enum',
    enum: ExhibitType,
  })
  exhibitType!: ExhibitType;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: ExhibitStatus,
    default: ExhibitStatus.PREPARED,
  })
  status!: ExhibitStatus;

  @Column({ name: 'offered_by', type: 'varchar', length: 255, nullable: true })
  offeredBy!: string;

  @Column({ name: 'date_offered', type: 'date', nullable: true })
  dateOffered!: Date;

  @Column({ name: 'date_admitted', type: 'date', nullable: true })
  dateAdmitted!: Date;

  @Column({ name: 'admitted_by', type: 'varchar', length: 255, nullable: true })
  admittedBy!: string;

  @Column({ name: 'purpose_of_exhibit', type: 'text', nullable: true })
  purposeOfExhibit!: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true })
  filePath!: string;

  @Column({ name: 'bates_number', type: 'varchar', length: 100, nullable: true })
  batesNumber!: string;

  @Column({ name: 'evidence_item_id', type: 'uuid', nullable: true })
  evidenceItemId!: string;

  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string;

  @Column({ name: 'is_stipulated', type: 'boolean', default: false })
  isStipulated!: boolean;

  @Column({ name: 'stipulation_date', type: 'date', nullable: true })
  stipulationDate!: Date;

  @Column({ name: 'stipulating_parties', type: 'jsonb', nullable: true })
  stipulatingParties!: string[];

  @Column({ type: 'text', nullable: true })
  objections!: string;

  @Column({ name: 'court_ruling', type: 'text', nullable: true })
  courtRuling!: string;
  
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string;
}
