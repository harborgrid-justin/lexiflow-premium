import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { PortalUser } from './portal-user.entity';

@Entity('shared_documents')
@Index(['documentId'])
@Index(['portalUserId'])
@Index(['expiresAt'])
@Index(['status'])
@Index(['sharedAt'])
export class SharedDocument extends BaseEntity {
  @Column({ name: 'document_id', type: 'uuid' })
  documentId!: string;

  @Column({ name: 'portal_user_id', type: 'uuid' })
  portalUserId!: string;

  @Column({ name: 'document_name', type: 'varchar', length: 500 })
  documentName!: string;

  @Column({ name: 'document_url', type: 'text' })
  documentUrl!: string;

  @Column({ name: 'document_type', type: 'varchar', length: 100, nullable: true })
  documentType!: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize!: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType!: string;

  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  permissions!: Array<'view' | 'download' | 'print' | 'comment'>;

  @Column({ name: 'expires_at', type: 'timestamp with time zone', nullable: true })
  expiresAt!: Date;

  @Column({ name: 'shared_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  sharedAt!: Date;

  @Column({ name: 'shared_by', type: 'uuid', nullable: true })
  sharedBy!: string;

  @Column({ name: 'last_accessed', type: 'timestamp with time zone', nullable: true })
  lastAccessed!: Date;

  @Column({ name: 'access_count', type: 'integer', default: 0 })
  accessCount!: number;

  @Column({ name: 'download_count', type: 'integer', default: 0 })
  downloadCount!: number;

  @Column({
    type: 'enum',
    enum: ['active', 'expired', 'revoked', 'pending'],
    default: 'active',
  })
  status!: string;

  @Column({ name: 'revoked_at', type: 'timestamp with time zone', nullable: true })
  revokedAt!: Date;

  @Column({ name: 'revoked_by', type: 'uuid', nullable: true })
  revokedBy!: string;

  @Column({ name: 'revocation_reason', type: 'text', nullable: true })
  revocationReason!: string;

  @Column({ name: 'matter_id', type: 'uuid', nullable: true })
  matterId!: string;

  @Column({ name: 'category', type: 'varchar', length: 100, nullable: true })
  category!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'is_sensitive', type: 'boolean', default: false })
  isSensitive!: boolean;

  @Column({ name: 'requires_signature', type: 'boolean', default: false })
  requiresSignature!: boolean;

  @Column({ name: 'signed_at', type: 'timestamp with time zone', nullable: true })
  signedAt!: Date;

  @Column({ name: 'signature_data', type: 'jsonb', nullable: true })
  signatureData!: Record<string, unknown>;

  @Column({ name: 'watermark_enabled', type: 'boolean', default: false })
  watermarkEnabled!: boolean;

  @Column({ name: 'download_limit', type: 'integer', nullable: true })
  downloadLimit!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  // Relations
  @ManyToOne(() => PortalUser, (user) => user.sharedDocuments, { nullable: false })
  @JoinColumn({ name: 'portal_user_id' })
  portalUser!: PortalUser;
}
