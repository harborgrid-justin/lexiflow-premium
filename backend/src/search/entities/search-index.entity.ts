import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Case } from '../../cases/entities/case.entity';

@Entity('search_index')
@Index(['entityType', 'entityId'])
@Index('search_content_idx', { synchronize: false }) // Full-text search index
export class SearchIndex {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  entityType: string; // 'case', 'document', 'client', 'pleading', etc.

  @Column({ type: 'uuid' })
  @Index()
  entityId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'uuid', nullable: true })
  @Index()
  caseId: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  clientId: string;

  @CreateDateColumn()
  @Index()
  indexedAt: Date;
}
