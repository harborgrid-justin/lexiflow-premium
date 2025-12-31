import { Entity, Column, Index, Unique, OneToOne, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@common/base/base.entity';
import { UserProfile } from './user-profile.entity';
import { Session } from '@auth/entities/session.entity';
import { TimeEntry } from '@billing/time-entries/entities/time-entry.entity';
import { CaseTeamMember } from '@case-teams/entities/case-team.entity';
import { UserRole } from '@common/enums/role.enum';

export { UserRole };

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

@Entity('users')
@Unique(['email'])
@Index(['role', 'status'])
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index()
  email!: string;

  @Exclude({ toPlainOnly: true })
  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STAFF
  })
  @Index()
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  @Index()
  status!: UserStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department!: string;

  @Column({ type: 'text', array: true, default: '{}' })
  permissions!: string[];

  @Column({ type: 'jsonb', nullable: true })
  preferences!: Record<string, unknown>;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl!: string;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt!: Date;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ name: 'two_factor_enabled', type: 'boolean', default: false })
  twoFactorEnabled!: boolean;

  @Exclude({ toPlainOnly: true })
  @Column({ name: 'totp_secret', type: 'varchar', length: 255, nullable: true })
  totpSecret!: string;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile!: UserProfile;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.user)
  timeEntries!: TimeEntry[];

  @OneToMany(() => CaseTeamMember, (caseTeamMember) => caseTeamMember.user)
  caseTeamMemberships!: CaseTeamMember[];
}
