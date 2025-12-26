import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  type!: string;

  @Column({ nullable: true })
  templateId!: string;

  @Column('simple-json', { nullable: true })
  parameters: Record<string, unknown> | null = null;

  @Column({ nullable: true })
  filePath!: string;

  @Column({ nullable: true })
  userId!: string;

  @Column({ default: 'pending' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
