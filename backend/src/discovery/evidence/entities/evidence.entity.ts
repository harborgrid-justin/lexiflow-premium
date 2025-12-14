import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

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
export class Evidence extends BaseEntity {
  @Column()
  caseId: string;

  @Column()
  title: string;

  @Column({
    type: 'varchar',
    default: EvidenceType.DOCUMENT,
  })
  type: EvidenceType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  collectionDate: string;

  @Column({ nullable: true })
  collectedBy: string;

  @Column({ nullable: true })
  custodian: string;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'varchar',
    default: AdmissibilityStatus.PENDING,
  })
  admissibility: AdmissibilityStatus;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  blockchainHash: string;

  @Column({ type: 'uuid', nullable: true })
  trackingUuid: string;

  @Column({ type: 'json', nullable: true })
  chainOfCustody: {
    id: string;
    date: string;
    action: string;
    actor: string;
    notes?: string;
    hash?: string;
  }[];

  @Column({ nullable: true })
  fileSize: string;

  @Column({ nullable: true })
  fileType: string;

  @Column({ type: 'simple-array', nullable: true })
  linkedRules: string[];

  @Column({ nullable: true, default: 'Active' })
  status: string;

  @Column({
    type: 'varchar',
    nullable: true,
    default: AuthenticationMethod.PENDING,
  })
  authenticationMethod: AuthenticationMethod;

  @Column({
    type: 'varchar',
    nullable: true,
    default: HearsayStatus.UNANALYZED,
  })
  hearsayStatus: HearsayStatus;

  @Column({ default: true })
  isOriginal: boolean;

  @Column({ type: 'float', nullable: true })
  relevanceScore: number;

  @Column({ nullable: true })
  expertId: string;
}
