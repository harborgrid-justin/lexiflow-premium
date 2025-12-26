import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('schema_snapshots')
export class Snapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ type: 'jsonb' })
  schema: Record<string, unknown> = {};

  @Column({ type: 'bigint' })
  sizeBytes!: number;

  @Column({ type: 'jsonb', nullable: true })
  tables!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  createdBy!: string;
}
