import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pleading_templates')
export class PleadingTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({ type: 'jsonb' })
  defaultSections: any[];

  @Column({ type: 'jsonb', nullable: true })
  variables: any[];

  @Column({ type: 'jsonb', nullable: true })
  formattingRules: any;

  @Column({ nullable: true })
  jurisdictionId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
