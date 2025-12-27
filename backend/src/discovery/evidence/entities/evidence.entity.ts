import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';

export enum EvidenceType {
  DOCUMENT = 'Document',
  PHYSICAL = 'Physical',
  TESTIMONIAL = 'Testimonial',
  DIGITAL = 'Digital',
  DEMONSTRATIVE = 'Demonstrative',
  REAL = 'Real',
}

export enum AdmissibilityStatus {
  ADMITTED = 'Admitted',
  PENDING = 'Pending',
  OBJECTED = 'Objected',
  EXCLUDED = 'Excluded',
  CONDITIONALLY_ADMITTED = 'Conditionally Admitted',
}

export enum AuthenticationMethod {
  SELF_AUTHENTICATED = 'Self-Authenticated',
  STIPULATION = 'Stipulation',
  TESTIMONY = 'Testimony',
  PENDING = 'Pending',
}

export enum HearsayStatus {
  NOT_HEARSAY = 'Not Hearsay',
  EXCEPTION_APPLIES = 'Exception Applies',
  OBJECTIONABLE = 'Objectionable',
  UNANALYZED = 'Unanalyzed',
}

@Entity('evidence')
@Index(['caseId'])
@Index(['type'])
@Index(['admissibility'])
export class Evidence extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column()
  title!: string;

  @Column({
    type: 'varchar',
    default: EvidenceType.DOCUMENT,
  })
  type!: EvidenceType;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'collection_date', type: 'date', nullable: true })
  collectionDate!: string;

  @Column({ name: 'collected_by', nullable: true })
  collectedBy!: string;

  @Column({ nullable: true })
  custodian!: string;

  @Column({ nullable: true })
  location!: string;

  @Column({
    type: 'varchar',
    default: AdmissibilityStatus.PENDING,
  })
  admissibility!: AdmissibilityStatus;

  @Column({ type: 'simple-array', nullable: true })
  tags!: string[];

  @Column({ name: 'blockchain_hash', nullable: true })
  blockchainHash!: string;

  @Column({ name: 'tracking_uuid', type: 'uuid', nullable: true })
  trackingUuid!: string;

  @Column({ name: 'chain_of_custody', type: 'json', nullable: true })
  chainOfCustody!: {
    id: string;
    date: string;
    action: string;
    actor: string;
    notes?: string;
    hash?: string;
  }[];

  @Column({ name: 'file_size', nullable: true })
  fileSize!: string;

  @Column({ name: 'file_type', nullable: true })
  fileType!: string;

  @Column({ name: 'linked_rules', type: 'simple-array', nullable: true })
  linkedRules!: string[];

  @Column({ nullable: true, default: 'Active' })
  status!: string;

  @Column({
    name: 'authentication_method',
    type: 'varchar',
    nullable: true,
    default: AuthenticationMethod.PENDING,
  })
  authenticationMethod!: AuthenticationMethod;

  @Column({
    name: 'hearsay_status',
    type: 'varchar',
    nullable: true,
    default: HearsayStatus.UNANALYZED,
  })
  hearsayStatus!: HearsayStatus;

  @Column({ name: 'is_original', default: true })
  isOriginal!: boolean;

  @Column({ name: 'relevance_score', type: 'float', nullable: true })
  relevanceScore!: number;

  @Column({ name: 'expert_id', nullable: true })
  expertId!: string;
}
