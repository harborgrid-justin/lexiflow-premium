import { Entity, Column, Index, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { User } from './user.entity';

@Entity('user_profiles')
@Index(['userId'], { unique: true })
@Index(['barNumber'], { unique: true })
export class UserProfile extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'bar_number', type: 'varchar', length: 100, nullable: true, unique: true })
  barNumber!: string;

  @Column({ type: 'jsonb', nullable: true })
  jurisdictions!: string[];

  @Column({ name: 'bar_admission_date', type: 'date', nullable: true })
  barAdmissionDate!: Date;

  @Column({ name: 'practice_areas', type: 'jsonb', nullable: true })
  practiceAreas!: string[];

  @Column({ type: 'jsonb', nullable: true })
  skills!: string[];

  @Column({ type: 'text', nullable: true })
  bio!: string;

  @Column({ name: 'linkedin_url', type: 'varchar', length: 500, nullable: true })
  linkedinUrl!: string;

  @Column({ name: 'website_url', type: 'varchar', length: 500, nullable: true })
  websiteUrl!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  university!: string;

  @Column({ name: 'law_school', type: 'varchar', length: 255, nullable: true })
  lawSchool!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  degree!: string;

  @Column({ name: 'graduation_year', type: 'integer', nullable: true })
  graduationYear!: number;

  @Column({ type: 'jsonb', nullable: true })
  certifications: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  languages: Record<string, any>[];

  @Column({ name: 'years_of_experience', type: 'integer', default: 0 })
  yearsOfExperience!: number;

  @Column({ name: 'previous_firms', type: 'jsonb', nullable: true })
  previousFirms: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  publications: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  awards: Record<string, any>[];

  @Column({ name: 'professional_memberships', type: 'jsonb', nullable: true })
  professionalMemberships: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  references: Record<string, any>[];

  @Column({ name: 'default_hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  defaultHourlyRate!: number;

  @Column({ name: 'target_billable_hours', type: 'integer', nullable: true })
  targetBillableHours!: number;

  @Column({ name: 'total_billable_hours', type: 'integer', default: 0 })
  totalBillableHours!: number;

  @Column({ name: 'cases_handled', type: 'integer', default: 0 })
  casesHandled!: number;

  @Column({ name: 'active_cases', type: 'integer', default: 0 })
  activeCases!: number;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 255, nullable: true })
  emergencyContactName!: string;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 50, nullable: true })
  emergencyContactPhone!: string;

  @Column({ name: 'emergency_contact_relationship', type: 'varchar', length: 100, nullable: true })
  emergencyContactRelationship!: string;

  @Column({ type: 'text', nullable: true })
  specializations!: string;

  @Column({ name: 'notable_achievements', type: 'text', nullable: true })
  notableAchievements!: string;
}
