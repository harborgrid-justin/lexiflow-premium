import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pleading_templates')
export class PleadingTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  category!: string;

  @Column({ type: 'jsonb' })
  defaultSections!: Record<string, unknown>[];

  @Column({ type: 'jsonb', nullable: true })
  variables!: Record<string, unknown>[] | null;

  @Column({ type: 'jsonb', nullable: true })
  formattingRules: Record<string, unknown> | null = null;

  @Column({ nullable: true })
  jurisdictionId!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  usageCount!: number;

  @Column({ nullable: true })
  createdBy!: string;

  @Column({ nullable: true })
  updatedBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
