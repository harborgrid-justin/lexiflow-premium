import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharedDocument } from './entities/shared-document.entity';
import { PortalUser } from './entities/portal-user.entity';

@Injectable()
export class DocumentSharingService {
  constructor(
    @InjectRepository(SharedDocument)
    private readonly sharedDocumentRepository: Repository<SharedDocument>,
    @InjectRepository(PortalUser)
    private readonly portalUserRepository: Repository<PortalUser>,
  ) {}

  /**
   * Get all shared documents for a portal user
   */
  async getSharedDocuments(portalUserId: string, filters?: {
    status?: string;
    matterId?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ documents: SharedDocument[]; total: number }> {
    const query = this.sharedDocumentRepository
      .createQueryBuilder('doc')
      .where('doc.portal_user_id = :portalUserId', { portalUserId })
      .orderBy('doc.shared_at', 'DESC');

    // Filter out expired documents
    query.andWhere('(doc.expires_at IS NULL OR doc.expires_at > :now)', { now: new Date() });

    if (filters?.status) {
      query.andWhere('doc.status = :status', { status: filters.status });
    }

    if (filters?.matterId) {
      query.andWhere('doc.matter_id = :matterId', { matterId: filters.matterId });
    }

    if (filters?.category) {
      query.andWhere('doc.category = :category', { category: filters.category });
    }

    const total = await query.getCount();

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    if (filters?.offset) {
      query.offset(filters.offset);
    }

    const documents = await query.getMany();

    return { documents, total };
  }

  /**
   * Get a specific shared document by ID
   */
  async getDocument(documentId: string, portalUserId: string): Promise<SharedDocument> {
    const document = await this.sharedDocumentRepository.findOne({
      where: { id: documentId, portalUserId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if document is expired
    if (document.expiresAt && document.expiresAt < new Date()) {
      document.status = 'expired';
      await this.sharedDocumentRepository.save(document);
      throw new ForbiddenException('Document access has expired');
    }

    // Check if document is revoked
    if (document.status === 'revoked') {
      throw new ForbiddenException('Document access has been revoked');
    }

    return document;
  }

  /**
   * Share a document with a portal user
   */
  async shareDocument(
    portalUserId: string,
    data: {
      documentId: string;
      documentName: string;
      documentUrl: string;
      documentType?: string;
      fileSize?: number;
      mimeType?: string;
      permissions: Array<'view' | 'download' | 'print' | 'comment'>;
      expiresAt?: Date;
      matterId?: string;
      category?: string;
      description?: string;
      isSensitive?: boolean;
      requiresSignature?: boolean;
      watermarkEnabled?: boolean;
      downloadLimit?: number;
      sharedBy: string;
    },
  ): Promise<SharedDocument> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    const sharedDocument = this.sharedDocumentRepository.create({
      documentId: data.documentId,
      portalUserId,
      documentName: data.documentName,
      documentUrl: data.documentUrl,
      documentType: data.documentType,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      permissions: data.permissions,
      expiresAt: data.expiresAt,
      matterId: data.matterId,
      category: data.category,
      description: data.description,
      isSensitive: data.isSensitive || false,
      requiresSignature: data.requiresSignature || false,
      watermarkEnabled: data.watermarkEnabled || false,
      downloadLimit: data.downloadLimit,
      sharedBy: data.sharedBy,
      sharedAt: new Date(),
      status: 'active',
      accessCount: 0,
      downloadCount: 0,
      createdBy: data.sharedBy,
    });

    return await this.sharedDocumentRepository.save(sharedDocument);
  }

  /**
   * Access a document (track access)
   */
  async accessDocument(documentId: string, portalUserId: string): Promise<SharedDocument> {
    const document = await this.getDocument(documentId, portalUserId);

    // Check if user has view permission
    if (!document.permissions.includes('view')) {
      throw new ForbiddenException('You do not have permission to view this document');
    }

    document.lastAccessed = new Date();
    document.accessCount += 1;
    document.updatedBy = portalUserId;

    return await this.sharedDocumentRepository.save(document);
  }

  /**
   * Download a document (track download)
   */
  async downloadDocument(documentId: string, portalUserId: string): Promise<SharedDocument> {
    const document = await this.getDocument(documentId, portalUserId);

    // Check if user has download permission
    if (!document.permissions.includes('download')) {
      throw new ForbiddenException('You do not have permission to download this document');
    }

    // Check download limit
    if (document.downloadLimit && document.downloadCount >= document.downloadLimit) {
      throw new ForbiddenException('Download limit exceeded for this document');
    }

    document.downloadCount += 1;
    document.lastAccessed = new Date();
    document.updatedBy = portalUserId;

    return await this.sharedDocumentRepository.save(document);
  }

  /**
   * Revoke document access
   */
  async revokeDocument(
    documentId: string,
    revokedBy: string,
    reason?: string,
  ): Promise<SharedDocument> {
    const document = await this.sharedDocumentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.status = 'revoked';
    document.revokedAt = new Date();
    document.revokedBy = revokedBy;
    document.revocationReason = reason;
    document.updatedBy = revokedBy;

    return await this.sharedDocumentRepository.save(document);
  }

  /**
   * Sign a document
   */
  async signDocument(
    documentId: string,
    portalUserId: string,
    signatureData: Record<string, unknown>,
  ): Promise<SharedDocument> {
    const document = await this.getDocument(documentId, portalUserId);

    if (!document.requiresSignature) {
      throw new BadRequestException('This document does not require a signature');
    }

    document.signedAt = new Date();
    document.signatureData = signatureData;
    document.updatedBy = portalUserId;

    return await this.sharedDocumentRepository.save(document);
  }

  /**
   * Get documents by matter
   */
  async getDocumentsByMatter(portalUserId: string, matterId: string): Promise<SharedDocument[]> {
    return await this.sharedDocumentRepository.find({
      where: {
        portalUserId,
        matterId,
        status: 'active',
      },
      order: { sharedAt: 'DESC' },
    });
  }

  /**
   * Get documents by category
   */
  async getDocumentsByCategory(portalUserId: string, category: string): Promise<SharedDocument[]> {
    return await this.sharedDocumentRepository.find({
      where: {
        portalUserId,
        category,
        status: 'active',
      },
      order: { sharedAt: 'DESC' },
    });
  }

  /**
   * Get documents requiring signature
   */
  async getDocumentsRequiringSignature(portalUserId: string): Promise<SharedDocument[]> {
    return await this.sharedDocumentRepository
      .createQueryBuilder('doc')
      .where('doc.portal_user_id = :portalUserId', { portalUserId })
      .andWhere('doc.requires_signature = :requiresSignature', { requiresSignature: true })
      .andWhere('doc.signed_at IS NULL')
      .andWhere('doc.status = :status', { status: 'active' })
      .orderBy('doc.shared_at', 'DESC')
      .getMany();
  }

  /**
   * Search documents
   */
  async searchDocuments(
    portalUserId: string,
    searchTerm: string,
    filters?: {
      matterId?: string;
      category?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<SharedDocument[]> {
    const query = this.sharedDocumentRepository
      .createQueryBuilder('doc')
      .where('doc.portal_user_id = :portalUserId', { portalUserId })
      .andWhere('doc.status = :status', { status: 'active' })
      .andWhere(
        '(LOWER(doc.document_name) LIKE LOWER(:searchTerm) OR LOWER(doc.description) LIKE LOWER(:searchTerm))',
        { searchTerm: `%${searchTerm}%` },
      )
      .orderBy('doc.shared_at', 'DESC');

    if (filters?.matterId) {
      query.andWhere('doc.matter_id = :matterId', { matterId: filters.matterId });
    }

    if (filters?.category) {
      query.andWhere('doc.category = :category', { category: filters.category });
    }

    if (filters?.dateFrom) {
      query.andWhere('doc.shared_at >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      query.andWhere('doc.shared_at <= :dateTo', { dateTo: filters.dateTo });
    }

    return await query.getMany();
  }

  /**
   * Get document statistics for a portal user
   */
  async getDocumentStatistics(portalUserId: string): Promise<{
    total: number;
    byCategoryCount: Record<string, number>;
    pendingSignatures: number;
    totalDownloads: number;
    recentlyShared: number;
  }> {
    const documents = await this.sharedDocumentRepository.find({
      where: { portalUserId, status: 'active' },
    });

    const byCategoryCount: Record<string, number> = {};
    let totalDownloads = 0;
    let pendingSignatures = 0;

    documents.forEach((doc) => {
      if (doc.category) {
        byCategoryCount[doc.category] = (byCategoryCount[doc.category] || 0) + 1;
      }
      totalDownloads += doc.downloadCount;
      if (doc.requiresSignature && !doc.signedAt) {
        pendingSignatures += 1;
      }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyShared = documents.filter((doc) => doc.sharedAt >= thirtyDaysAgo).length;

    return {
      total: documents.length,
      byCategoryCount,
      pendingSignatures,
      totalDownloads,
      recentlyShared,
    };
  }
}
