import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { JurisdictionRule } from './jurisdiction-rule.entity';

export enum JurisdictionSystem {
  FEDERAL = 'Federal',
  STATE = 'State',
  REGULATORY = 'Regulatory',
  INTERNATIONAL = 'International',
  ARBITRATION = 'Arbitration',
  LOCAL = 'Local'
}

export enum JurisdictionType {
  SUPREME_COURT = 'Supreme Court',
  CIRCUIT_COURT = 'Circuit Court',
  DISTRICT_COURT = 'District Court',
  APPELLATE_COURT = 'Appellate Court',
  TRIAL_COURT = 'Trial Court',
  SPECIALIZED_COURT = 'Specialized Court',
  REGULATORY_BODY = 'Regulatory Body',
  ARBITRATION_PROVIDER = 'Arbitration Provider',
  TREATY = 'Treaty'
}

@Entity('jurisdictions')
export class Jurisdiction {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @Column({ type: 'enum', enum: JurisdictionSystem, name: 'system' })
  system!: JurisdictionSystem;

  @Column({ type: 'enum', enum: JurisdictionType, name: 'type' })
  type!: JurisdictionType;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'region' })
  region!: string; // Circuit, State, Country, etc.

  @Column({ type: 'text', nullable: true, name: 'description' })
  description!: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'website' })
  website!: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'rules_url', select: false })
  rulesUrl?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'code' })
  code!: string; // e.g., "9th Cir.", "N.D. Cal"

  @Column({ type: 'simple-json', nullable: true, name: 'metadata' })
  metadata!: {
    iconColor?: string;
    parties?: number; // For treaties
    status?: string; // For treaties/regulatory
    fullName?: string; // For arbitration providers
    jurisdiction?: string; // For local courts
  };

  @OneToMany(() => JurisdictionRule, rule => rule.jurisdiction, { cascade: true })
  rules!: JurisdictionRule[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
