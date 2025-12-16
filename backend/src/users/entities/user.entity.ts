import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PARTNER = 'partner',
  SENIOR_ASSOCIATE = 'senior_associate',
  ASSOCIATE = 'associate',
  JUNIOR_ASSOCIATE = 'junior_associate',
  ATTORNEY = 'attorney',
  PARALEGAL = 'paralegal',
  LEGAL_ASSISTANT = 'legal_assistant',
  CLERK = 'clerk',
  INTERN = 'intern',
  ACCOUNTANT = 'accountant',
  BILLING_SPECIALIST = 'billing_specialist',
  IT_ADMIN = 'it_admin',
  STAFF = 'staff',
  USER = 'user',
  CLIENT = 'client'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

@Entity('users')
@Unique(['email'])
@Index(['role', 'status'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STAFF
  })
  @Index()
  role: UserRole;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  @Index()
  status: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  // Note: barNumber not in current DB schema - would need migration to add

  @Column({ type: 'text', array: true, default: '{}' })
  permissions: string[];

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'isVerified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'twoFactorSecret', type: 'varchar', length: 255, nullable: true })
  totpSecret: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
