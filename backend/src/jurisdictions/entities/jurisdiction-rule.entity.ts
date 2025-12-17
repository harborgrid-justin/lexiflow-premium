import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Jurisdiction } from './jurisdiction.entity';

export enum RuleType {
  PROCEDURAL = 'Procedural',
  EVIDENTIARY = 'Evidentiary',
  CIVIL = 'Civil',
  CRIMINAL = 'Criminal',
  ADMINISTRATIVE = 'Administrative',
  LOCAL = 'Local',
  STANDING_ORDER = 'Standing Order',
  PRACTICE_GUIDE = 'Practice Guide'
}

@Entity('jurisdiction_rules')
export class JurisdictionRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  jurisdictionId: string;

  @ManyToOne(() => Jurisdiction, jurisdiction => jurisdiction.rules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jurisdictionId' })
  jurisdiction: Jurisdiction;

  @Column({ type: 'varchar', length: 100 })
  code: string; // e.g., "FRCP 26", "Evidence Rule 401"

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'enum', enum: RuleType })
  type: RuleType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  fullText: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url: string;

  @Column({ type: 'simple-json', nullable: true })
  citations: string[];

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
