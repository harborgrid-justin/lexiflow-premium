import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Document } from '@documents/entities/document.entity';
import { DocumentVersion } from '@document-versions/entities/document-version.entity';

/**
 * DocumentLoader - DataLoader for batching and caching document queries
 * Prevents N+1 query problems when loading documents
 */
@Injectable({ scope: Scope.REQUEST })
export class DocumentLoader {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentVersion)
    private versionRepository: Repository<DocumentVersion>,
  ) {}

  /**
   * Batch load documents by IDs
   */
  public readonly batchDocuments = new DataLoader(async (documentIds: readonly string[]) => {
    const documents = await this.documentRepository.find({
      where: { id: In([...documentIds]) },
    });
    const documentMap = new Map(documents.map(d => [d.id, d]));
    return documentIds.map(id => documentMap.get(id) || null);
  });

  /**
   * Batch load documents by case IDs
   */
  public readonly batchDocumentsByCaseId = new DataLoader(async (caseIds: readonly string[]) => {
    const documents = await this.documentRepository.find({
      where: { caseId: In([...caseIds]) },
    });
    const documentsByCaseId = new Map();
    caseIds.forEach(id => documentsByCaseId.set(id, []));
    documents.forEach(doc => {
      const list = documentsByCaseId.get(doc.caseId) || [];
      list.push(doc);
      documentsByCaseId.set(doc.caseId, list);
    });
    return caseIds.map(id => documentsByCaseId.get(id) || []);
  });

  /**
   * Batch load document versions by document IDs
   */
  public readonly batchVersionsByDocumentId = new DataLoader(async (documentIds: readonly string[]) => {
    const versions = await this.versionRepository.find({
      where: { documentId: In([...documentIds]) },
    });
    const versionsByDocId = new Map();
    documentIds.forEach(id => versionsByDocId.set(id, []));
    versions.forEach(version => {
      const list = versionsByDocId.get(version.documentId) || [];
      list.push(version);
      versionsByDocId.set(version.documentId, list);
    });
    return documentIds.map(id => versionsByDocId.get(id) || []);
  });

  /**
   * Batch load clauses by document IDs
   * Note: Clauses would need a separate entity/table for full implementation
   */
  public readonly batchClausesByDocumentId = new DataLoader(async (documentIds: readonly string[]) => {
    // Clauses may be stored in JSONB or separate table
    // For now, return empty arrays as clauses entity is not defined
    return documentIds.map(() => []);
  });

  /**
   * Batch load created by users for documents
   * Note: This would typically use the UserLoader to avoid circular dependencies
   */
  public readonly batchCreatedByForDocuments = new DataLoader(async (documentIds: readonly string[]) => {
    const documents = await this.documentRepository.find({
      where: { id: In([...documentIds]) },
      select: ['id', 'createdBy'],
    });
    const createdByMap = new Map(documents.map(d => [d.id, d.createdBy]));
    return documentIds.map(id => createdByMap.get(id) || null);
  });
}
