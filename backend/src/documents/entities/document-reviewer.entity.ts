import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Document } from '@documents/entities/document.entity';
import { User } from '@users/entities/user.entity';

@Entity('document_reviewers')
export class DocumentReviewer {
  @PrimaryColumn({ type: 'uuid', name: 'document_id' })
  documentId!: string;

  @PrimaryColumn({ type: 'uuid', name: 'reviewer_id' })
  userId!: string;

  @ManyToOne(() => Document, (doc) => doc.reviewers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: Document;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  user!: User;
}
