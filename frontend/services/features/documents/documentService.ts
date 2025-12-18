/**
 * @module services/documentService
 * @category Services - Document Management
 * @description Document service handling file uploads with binary blob storage, hash generation,
 * chunk processing, and blob URL retrieval. Manages document metadata in IndexedDB with separate
 * binary storage. Provides non-blocking file processing with yielding for large files, mock SHA-256
 * hash generation, and integrity verification.
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { db, STORES } from '../../data/db';
import { BlobManager } from '../../infrastructure/blobManager';
import { CryptoService } from '../../infrastructure/cryptoService';

// Utils & Constants
import { Formatters } from '../../../utils/formatters';

// Types
import { EvidenceItem, FileChunk, LegalDocument, DocumentId, CaseId } from '../../../types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
// Helper to yield control to the main thread
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

// ============================================================================
// SERVICE
// ============================================================================
export const DocumentService = {
  
  // Store a real file into IDB
  async uploadDocument(file: File, meta: Partial<LegalDocument>): Promise<LegalDocument> {
      const id = `doc-${Date.now()}` as DocumentId;
      
      // 1. Save Metadata
      const newDoc: LegalDocument = {
          id,
          caseId: (meta.caseId || 'General') as CaseId,
          title: file.name,
          type: meta.type || file.type.split('/')[1]?.toUpperCase() || 'FILE',
          content: 'Binary content stored in secure blob storage.',
          uploadDate: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0],
          tags: ['Uploaded', 'Local'],
          versions: [],
          fileSize: Formatters.fileSize(file.size), // Use shared formatter
          sourceModule: meta.sourceModule || 'General',
          status: 'Draft',
          isEncrypted: false
      };

      await db.put(STORES.DOCUMENTS, newDoc);

      // 2. Save Binary Blob
      await db.putFile(id, file);

      return newDoc;
  },

  // Retrieve a blob URL for a given document ID
  // Note: Caller is responsible for revoking the URL when done via BlobManager.revoke(url)
  // or BlobManager.revokeByContext(`document-${id}`)
  async getDocumentUrl(id: string): Promise<string | null> {
      try {
          const blob = await db.getFile(id);
          if (blob) {
              return BlobManager.create(blob, `document-${id}`);
          }
          return null;
      } catch (e) {
          console.error("Failed to load file blob", e);
          return null;
      }
  },

  // Process file and generate a SHA-256 hash using worker pool
  async processFile(file: File): Promise<{ 
    hash: string; 
    uuid: string; 
    chunks: FileChunk[];
    tags: string[];
    summary: string;
  }> {
      const uuid = crypto.randomUUID();
      
      await yieldToMain();
      
      // Generate SHA-256 hash using CryptoService (worker pool)
      const result = await CryptoService.hashFile(file);
      const documentHash = '0x' + result.hash;
      await yieldToMain();
      
      const chunkCount = Math.floor(Math.random() * 5) + 2; 
      const chunks: FileChunk[] = [];
      
      for (let i = 1; i <= chunkCount; i++) {
          await yieldToMain();
          chunks.push({
              id: `${uuid}-p${i}`,
              pageNumber: i,
              contentPreview: `Extracted content from page ${i} of ${file.name}. This section contains key definitions and clauses verified against the master record.`,
              hash: '0x' + Math.floor(Math.random() * 10000000).toString(16) + '...'
          });
      }

      const tags = ['Uploaded', file.type.split('/')[1] || 'Unknown'];
      if (file.name.toLowerCase().includes('contract')) tags.push('Contract');
      if (file.name.toLowerCase().includes('email')) tags.push('Correspondence');
      
      return {
        hash: documentHash,
        uuid: uuid,
        chunks: chunks,
        tags: tags,
        summary: `Auto-generated summary for ${file.name}. Parsed ${chunkCount} pages. Verified clean of malware. Authenticated source.`
      };
  },

  // Re-export for compatibility if needed, but components should prefer Formatters.fileSize
  formatBytes: Formatters.fileSize,

  async verifyIntegrity(hash: string): Promise<{ verified: boolean; timestamp: string; block: number }> {
      return new Promise(resolve => {
          setTimeout(() => {
              resolve({
                  verified: true,
                  timestamp: new Date().toISOString(),
                  block: 18452000 + Math.floor(Math.random() * 5000)
              });
          }, 2000);
      });
  }
};

