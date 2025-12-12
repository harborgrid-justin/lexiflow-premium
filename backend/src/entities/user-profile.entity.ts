import { Entity, Column, Index, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('user_profiles')
@Index(['userId'], { unique: true })
@Index(['barNumber'], { unique: true })
export class UserProfile extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  barNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  jurisdictions: string[];

  @Column({ type: 'date', nullable: true })
  barAdmissionDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  practiceAreas: string[];

  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkedinUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  websiteUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  university: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lawSchool: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  degree: string;

  @Column({ type: 'integer', nullable: true })
  graduationYear: number;

  @Column({ type: 'jsonb', nullable: true })
  certifications: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  languages: Record<string, any>[];

  @Column({ type: 'integer', default: 0 })
  yearsOfExperience: number;

  @Column({ type: 'jsonb', nullable: true })
  previousFirms: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  publications: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  awards: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  professionalMemberships: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  references: Record<string, any>[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  defaultHourlyRate: number;

  @Column({ type: 'integer', nullable: true })
  targetBillableHours: number;

  @Column({ type: 'integer', default: 0 })
  totalBillableHours: number;

  @Column({ type: 'integer', default: 0 })
  casesHandled: number;

  @Column({ type: 'integer', default: 0 })
  activeCases: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emergencyContactName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  emergencyContactPhone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emergencyContactRelationship: string;

  @Column({ type: 'text', nullable: true })
  specializations: string;

  @Column({ type: 'text', nullable: true })
  notableAchievements: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
