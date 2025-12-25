import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Case } from '../../cases/entities/case.entity';

@Entity('citations')
export class Citation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  citation!: string;

  @Column()
  court!: string;

  @Column()
  year!: number;

  @Column({ nullable: true })
  title!: string;

  @Column({ name: 'case_id', nullable: true })
  caseId!: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'document_id', nullable: true })
  documentId!: string;

  @Column({ default: 'Valid' })
  status!: string;

  @Column({ type: 'json', nullable: true })
  shepards: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
