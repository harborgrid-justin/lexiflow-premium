import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('trial_exhibits')
@Index(['caseId'])
@Index(['exhibitNumber'])
@Index(['status'])
@Index(['exhibitType'])
export class TrialExhibit extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 100 })
  exhibitNumber: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({
    type: 'enum',
    enum: [
      'document',
      'photograph',
      'video',
      'audio',
      'physical_object',
      'diagram',
      'chart',
      'report',
      'other',
    ],
  })
  exhibitType: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: [
      'prepared',
      'marked',
      'offered',
      'admitted',
      'refused',
      'withdrawn',
      'stipulated',
    ],
    default: 'prepared',
  })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  offeredBy: string;

  @Column({ type: 'date', nullable: true })
  dateOffered: Date;

  @Column({ type: 'date', nullable: true })
  dateAdmitted: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  admittedBy: string;

  @Column({ type: 'text', nullable: true })
  purposeOfExhibit: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batesNumber: string;

  @Column({ type: 'uuid', nullable: true })
  evidenceItemId: string;

  @Column({ type: 'uuid', nullable: true })
  documentId: string;

  @Column({ type: 'boolean', default: false })
  isStipulated: boolean;

  @Column({ type: 'date', nullable: true })
  stipulationDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  stipulatingParties: string[];

  @Column({ type: 'text', nullable: true })
  objections: string;

  @Column({ type: 'text', nullable: true })
  courtRuling: string;

  @Column({ type: 'text', nullable: true })
  foundationWitness: string;

  @Column({ type: 'uuid', nullable: true })
  foundationWitnessId: string;

  @Column({ type: 'text', nullable: true })
  foundationTestimony: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authenticatedBy: string;

  @Column({ type: 'date', nullable: true })
  authenticationDate: Date;

  @Column({ type: 'boolean', default: false })
  isRedacted: boolean;

  @Column({ type: 'text', nullable: true })
  redactionDetails: string;

  @Column({ type: 'boolean', default: false })
  isSealed: boolean;

  @Column({ type: 'boolean', default: false })
  isConfidential: boolean;

  @Column({ type: 'integer', nullable: true })
  pageCount: number;

  @Column({ type: 'jsonb', nullable: true })
  relatedExhibits: string[];

  @Column({ type: 'jsonb', nullable: true })
  citedInDocuments: string[];

  @Column({ type: 'text', nullable: true })
  physicalLocation: string;

  @Column({ type: 'text', nullable: true })
  displayNotes: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
