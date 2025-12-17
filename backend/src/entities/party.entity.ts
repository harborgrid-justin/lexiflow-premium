import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from '../cases/entities/case.entity';

export enum PartyRole {
  PLAINTIFF = 'plaintiff',
  DEFENDANT = 'defendant',
  PETITIONER = 'petitioner',
  RESPONDENT = 'respondent',
  APPELLANT = 'appellant',
  APPELLEE = 'appellee',
  THIRD_PARTY = 'third_party',
  INTERVENOR = 'intervenor',
  WITNESS = 'witness',
  EXPERT = 'expert',
}

export enum PartyType {
  INDIVIDUAL = 'individual',
  CORPORATION = 'corporation',
  GOVERNMENT = 'government',
  ORGANIZATION = 'organization',
  OTHER = 'other',
}

@Entity('parties')
@Index(['caseId'])
@Index(['type'])
@Index(['role'])
export class Party extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: PartyRole,
  })
  role: PartyRole;

  @Column({
    type: 'enum',
    enum: PartyType,
  })
  type: PartyType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  primaryContactName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  primaryContactEmail: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  primaryContactPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attorneyName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  attorneyBarNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attorneyFirm: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  attorneyPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attorneyEmail: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.parties, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caseId' })
  case: Case;
}
