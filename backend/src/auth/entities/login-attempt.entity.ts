import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('login_attempts')
@Index(['email', 'createdAt'])
@Index(['ipAddress', 'createdAt'])
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email!: string;

  @Column({ type: 'varchar', length: 45 })
  @Index()
  ipAddress!: string;

  @Column({ type: 'boolean' })
  success!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  failureReason!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userAgent!: string;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;
}
