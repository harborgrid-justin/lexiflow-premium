import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PARTNER = 'partner',
  ATTORNEY = 'attorney',
  PARALEGAL = 'paralegal',
  STAFF = 'staff',
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

  @Column({ type: 'varchar', length: 255 })
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

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING
  })
  @Index()
  status: UserStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barNumber: string;

  @Column({ type: 'text', array: true, default: '{}' })
  permissions: string[];

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: true })
  twoFactorEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
