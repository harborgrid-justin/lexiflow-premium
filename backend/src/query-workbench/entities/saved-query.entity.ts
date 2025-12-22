import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('saved_queries')
export class SavedQuery {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  query!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column()
  userId!: string;

  @Column({ type: 'jsonb', nullable: true })
  tags!: string[];

  @Column({ type: 'boolean', default: false })
  isShared!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
