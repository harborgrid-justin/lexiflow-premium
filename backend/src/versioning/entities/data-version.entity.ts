import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('data_versions')
export class DataVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column()
  version: number;

  @Column('jsonb')
  data: Record<string, any>;

  @Column({ nullable: true })
  branch: string;

  @Column({ nullable: true })
  tag: string;

  @Column('text', { nullable: true })
  commitMessage: string;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
