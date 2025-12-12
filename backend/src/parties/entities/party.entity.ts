import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';
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
  OTHER = 'Other',
}

export enum PartyRole {
  PRIMARY = 'Primary',
  CO_PARTY = 'Co-Party',
  INTERESTED_PARTY = 'Interested Party',
  GUARDIAN = 'Guardian',
  REPRESENTATIVE = 'Representative',
}

@Entity('parties')
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
    enum: PartyType,
  })
  type: PartyType;

  @Column({
    type: 'enum',
    enum: PartyRole,
    default: PartyRole.PRIMARY,
  })
  role: PartyRole;

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

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  counsel?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
