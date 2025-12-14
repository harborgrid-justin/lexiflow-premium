import { Entity, Column, Index, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserProfile } from './user-profile.entity';
import { Session } from './session.entity';
import { CaseTeamMember } from '../case-teams/entities/case-team.entity';
import { TimeEntry } from '../billing/time-entries/entities/time-entry.entity';
import { Expense as FirmExpense } from '../billing/expenses/entities/expense.entity';
import { Document as LegalDocument } from '../documents/entities/document.entity';
import { AuditLog } from './audit-log.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['role'])
@Index(['department'])
@Index(['isActive'])
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: [
      'super_admin',
      'admin',
      'partner',
      'senior_associate',
      'associate',
      'junior_associate',
      'paralegal',
      'legal_assistant',
      'clerk',
      'intern',
      'accountant',
      'billing_specialist',
      'it_admin',
      'user',
    ],
  })
  role: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  extension: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mobilePhone: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  verificationToken: string;

  @Column({ type: 'timestamp', nullable: true })
  verificationTokenExpiry: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpiry: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastLoginIp: string;

  @Column({ type: 'integer', default: 0 })
  loginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twoFactorSecret: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  permissions: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  employeeId: string;

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ type: 'uuid', nullable: true })
  managerId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  officeLocation: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timeZone: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile;

  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions: Session[];

  @OneToMany(() => CaseTeamMember, (member) => member.user)
  caseTeamMemberships: CaseTeamMember[];

  @OneToMany(() => TimeEntry, (entry) => entry.user)
  timeEntries: TimeEntry[];

  @OneToMany(() => FirmExpense, (expense) => expense.user)
  expenses: FirmExpense[];

  @OneToMany(() => LegalDocument, (document) => document.creator)
  documents: LegalDocument[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[];
}
