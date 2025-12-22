import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('query_history')
export class QueryHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  query!: string;

  @Column()
  userId!: string;

  @Column({ type: 'int', nullable: true })
  executionTimeMs!: number;

  @Column({ type: 'int', nullable: true })
  rowsAffected!: number;

  @Column({ type: 'boolean', default: true })
  successful!: boolean;

  @Column({ type: 'text', nullable: true })
  error!: string;

  @CreateDateColumn()
  executedAt!: Date;
}
