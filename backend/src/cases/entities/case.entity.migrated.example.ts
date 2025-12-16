/**
 * EXAMPLE: Migrated Case Entity using @lexiflow/shared-types
 *
 * This file demonstrates how to migrate a TypeORM entity to use shared types:
 * 1. Import enums from @lexiflow/shared-types instead of local definitions
 * 2. Implement the shared Case interface (or extend it)
 * 3. Keep TypeORM decorators and relationships
 * 4. Date fields remain as Date objects (TypeORM), serialized to ISO strings automatically
 */

import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Client } from '../../entities/client.entity';
import { EvidenceItem } from '../../entities/evidence-item.entity';
import { ConflictCheck } from '../../entities/conflict-check.entity';
import { Party } from '../../entities/party.entity';

// Import shared enums from shared-types package
import { CaseType, CaseStatus } from '@lexiflow/shared-types';

@Entity('cases')
export class Case extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  caseNumber: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Use shared enum from @lexiflow/shared-types
  @Column({
    type: 'enum',
    enum: CaseType,
    default: CaseType.CIVIL,
  })
  type: CaseType;

  // Use shared enum from @lexiflow/shared-types
  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.OPEN,
  })
  status: CaseStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  practiceArea?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jurisdiction?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  court?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  judge?: string;

  @Column({ type: 'date', nullable: true })
  filingDate?: Date;

  @Column({ type: 'date', nullable: true })
  trialDate?: Date;

  @Column({ type: 'date', nullable: true })
  closeDate?: Date;

  @Column({ type: 'uuid', nullable: true })
  assignedTeamId?: string;

  @Column({ type: 'uuid', nullable: true })
  leadAttorneyId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, (client) => client.cases)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @OneToMany(() => EvidenceItem, (evidenceItem) => evidenceItem.case)
  evidenceItems: EvidenceItem[];

  @OneToMany(() => ConflictCheck, (conflictCheck) => conflictCheck.case)
  conflictChecks: ConflictCheck[];

  @OneToMany(() => Party, (party) => party.case)
  parties: Party[];
}

/**
 * MIGRATION NOTES:
 *
 * Benefits of using shared types:
 * 1. Single source of truth for enums (CaseType, CaseStatus)
 * 2. Frontend and backend always use the same enum values
 * 3. Type safety across the entire application
 * 4. Easier to add new enum values (update once, use everywhere)
 *
 * Steps to migrate existing entities:
 * 1. Remove local enum definitions (e.g., export enum CaseType { ... })
 * 2. Import enums from '@lexiflow/shared-types'
 * 3. Update @Column decorators to use imported enums
 * 4. Test to ensure enum values in database match shared enum values
 *
 * TypeORM Compatibility:
 * - Date fields remain as Date objects in entities
 * - class-transformer automatically converts Date to ISO string in API responses
 * - Shared types define dates as strings (for JSON serialization)
 * - This is the expected pattern and works seamlessly
 */
