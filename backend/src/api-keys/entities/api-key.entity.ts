import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ApiKeyScope {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
}

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  keyPrefix: string;

  @Column()
  keyHash: string;

  @Column({ type: 'simple-array' })
  scopes: ApiKeyScope[];

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: 1000 })
  rateLimit: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ default: 0 })
  requestCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
