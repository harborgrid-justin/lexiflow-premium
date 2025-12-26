import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('compliance_rules')
export class ComplianceRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column()
  category!: string;

  @Column()
  severity!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column('jsonb', { nullable: true })
  conditions: Record<string, unknown> | null = null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
