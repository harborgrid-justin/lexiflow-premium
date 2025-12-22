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
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'jurisdictionId' })
  jurisdictionId!: string;

  @ManyToOne(() => Jurisdiction, jurisdiction => jurisdiction.rules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jurisdictionId' })
  jurisdiction!: Jurisdiction;

  @Column({ type: 'varchar', length: 100, name: 'code' })
  code!: string; // e.g., "FRCP 26", "Evidence Rule 401"

  @Column({ type: 'varchar', length: 500, name: 'name' })
  name!: string;

  @Column({ type: 'enum', enum: RuleType, name: 'type' })
  type!: RuleType;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description!: string;

  @Column({ type: 'text', nullable: true, name: 'fullText' })
  fullText!: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'url' })
  url!: string;

  @Column({ type: 'simple-json', nullable: true, name: 'citations' })
  citations!: string[];

  @Column({ type: 'date', nullable: true, name: 'effectiveDate' })
  effectiveDate!: Date;

  @Column({ type: 'boolean', default: true, name: 'isActive' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date;
}
