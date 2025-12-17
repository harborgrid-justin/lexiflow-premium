import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('vector_embeddings')
export class VectorEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityType: string; // 'document', 'case', 'citation', etc.

  @Column()
  entityId: string;

  @Column('float', { array: true })
  embedding: number[];

  @Column()
  model: string; // 'openai-ada-002', 'gemini-embedding', etc.

  @Column('text')
  content: string; // The original text that was embedded

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
