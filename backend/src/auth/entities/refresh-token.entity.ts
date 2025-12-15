import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';

@Entity('refresh_tokens')
@Index(['userId', 'expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'timestamp' })
  @Index()
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  @Index()
  revoked: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
