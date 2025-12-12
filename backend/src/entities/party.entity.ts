import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';

@Entity('parties')
@Index(['caseId'])
@Index(['type'])
@Index(['role'])
export class Party extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: [
      'plaintiff',
      'defendant',
      'petitioner',
      'respondent',
      'appellant',
      'appellee',
      'third_party',
      'intervenor',
      'witness',
      'expert',
    ],
  })
  role: string;

  @Column({
    type: 'enum',
    enum: ['individual', 'corporation', 'government', 'organization', 'other'],
  })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attorney: string;

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
