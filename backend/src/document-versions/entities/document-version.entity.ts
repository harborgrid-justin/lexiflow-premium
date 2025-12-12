import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('document_versions')
@Index(['documentId', 'version'])
export class DocumentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  documentId: string;

  @Column({ type: 'int' })
  version: number;

  @Column()
  filename: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column()
  checksum: string;

  @Column({ type: 'text', nullable: true })
  changeDescription: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  fullTextContent: string;

  @Column({ type: 'int', nullable: true })
  pageCount: number;

  @Column({ type: 'int', nullable: true })
  wordCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;
}
