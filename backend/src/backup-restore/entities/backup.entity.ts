import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('schema_backups')
export class SchemaBackup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'jsonb' })
  schema: any;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'bigint' })
  sizeBytes!: number;

  @Column({ type: 'boolean', default: false })
  includesData!: boolean;

  @Column({ nullable: true })
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date;
}
