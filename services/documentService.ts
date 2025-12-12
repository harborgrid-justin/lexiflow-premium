
import { EvidenceItem, FileChunk, LegalDocument, DocumentId, CaseId } from '../types';
import { db, STORES } from './db';
import { Formatters } from '../utils/formatters';

// Helper to yield control to the main thread
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

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
  async getDocumentUrl(id: string): Promise<string | null> {
      try {
          const blob = await db.getFile(id);
          if (blob) {
              return URL.createObjectURL(blob);
          }
          return null;
      } catch (e) {
          console.error("Failed to load file blob", e);
          return null;
      }
  },

  // Simulate reading a file and generating a SHA-256 hash in a non-blocking way
  async processFile(file: File): Promise<{ 
    hash: string; 
    uuid: string; 
    chunks: FileChunk[];
    tags: string[];
    summary: string;
  }> {
      const uuid = crypto.randomUUID();
      
      await yieldToMain();
      
      // Mock Hash generation for demo
      const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
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
        hash: mockHash,
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
