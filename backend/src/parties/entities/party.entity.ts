import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Case } from '../../cases/entities/case.entity';

export enum PartyType {
  PLAINTIFF = 'Plaintiff',
  DEFENDANT = 'Defendant',
  PETITIONER = 'Petitioner',
  RESPONDENT = 'Respondent',
  APPELLANT = 'Appellant',
  APPELLEE = 'Appellee',
  THIRD_PARTY = 'Third Party',
  WITNESS = 'Witness',
  EXPERT_WITNESS = 'Expert Witness',
  INDIVIDUAL = 'individual',
  CORPORATION = 'corporation',
  GOVERNMENT = 'government',
  ORGANIZATION = 'organization',
  OTHER = 'Other',
  OTHER_LOWER = 'other',
}

export enum PartyRole {
  PRIMARY = 'Primary',
  CO_PARTY = 'Co-Party',
  INTERESTED_PARTY = 'Interested Party',
  GUARDIAN = 'Guardian',
  REPRESENTATIVE = 'Representative',
  PLAINTIFF = 'plaintiff',
  DEFENDANT = 'defendant',
  PETITIONER = 'petitioner',
  RESPONDENT = 'respondent',
  APPELLANT = 'appellant',
  APPELLEE = 'appellee',
  THIRD_PARTY_LOWER = 'third_party',
  INTERVENOR = 'intervenor',
  WITNESS = 'witness',
  EXPERT = 'expert',
}

@Entity('parties')
@Index(['caseId'])
@Index(['type'])
@Index(['role'])
export class Party extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: PartyType,
  })
  type!: PartyType;

  @Column({
    type: 'enum',
    enum: PartyRole,
    default: PartyRole.PRIMARY,
  })
  role!: PartyRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  organization?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 20, nullable: true })
  zipCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  counsel?: string;

  @Column({ name: 'primary_contact_name', type: 'varchar', length: 255, nullable: true })
  primaryContactName?: string;

  @Column({ name: 'primary_contact_email', type: 'varchar', length: 255, nullable: true })
  primaryContactEmail?: string;

  @Column({ name: 'primary_contact_phone', type: 'varchar', length: 50, nullable: true })
  primaryContactPhone?: string;

  @Column({ name: 'attorney_name', type: 'varchar', length: 255, nullable: true })
  attorneyName?: string;

  @Column({ name: 'attorney_bar_number', type: 'varchar', length: 50, nullable: true })
  attorneyBarNumber?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
