import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('search_queries')
@Index(['userId', 'createdAt'])
@Index(['query', 'createdAt'])
export class SearchQuery {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId!: string;

  @Column({ type: 'text' })
  query!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  entityType!: string;

  @Column({ type: 'int', default: 0 })
  resultsCount!: number;

  @Column({ type: 'jsonb', nullable: true })
  filters!: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  responseTimeMs!: number;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;
}
