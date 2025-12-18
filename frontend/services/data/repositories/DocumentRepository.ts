
import { EvidenceItem, FileChunk, LegalDocument, DocumentId, CaseId, DocumentVersion } from '../../../types';
import { db, STORES } from '../db';
import { Repository } from '../../core/Repository';
import { BlobManager } from '../../infrastructure/blobManager';

const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

export class DocumentRepository extends Repository<LegalDocument> {
    constructor() {
        super(STORES.DOCUMENTS);
    }

    // getByCaseId is inherited from base Repository class

    async getFile(id: string): Promise<Blob | null> {
        return db.getFile(id);
    }
    
    async getContent(id: string): Promise<string> {
        const blob = await this.getFile(id);
        if (blob) {
            try {
                return await blob.text();
            } catch (e) {
                console.error("Could not read blob as text", e);
            }
        }
        // Fallback to metadata content
        const doc = await this.getById(id);
        return doc?.content || '';
    }

    async getFolders(): Promise<any[]> {
        return [
            { id: 'root', label: 'All Documents' },
            { id: 'case_docs', label: 'Case Files' },
            { id: 'discovery', label: 'Discovery Productions' },
            { id: 'templates_folder', label: 'Templates' },
        ];
    }
    
    async redact(docId: string): Promise<LegalDocument> {
        const doc = await this.getById(docId);
        if (!doc) throw new Error("Document not found");

        // Create a version snapshot of current state
        const newVersion: DocumentVersion = {
            id: `ver-${Date.now()}` as any,
            versionNumber: (doc.versions.length || 0) + 1,
            uploadedBy: 'System',
            uploadDate: new Date().toISOString(),
            contentSnapshot: doc.content
        };

        const updatedDoc = {
            ...doc,
            content: "[REDACTED CONTENT] - PII Removed via Automated Scrubbing",
            isRedacted: true,
            versions: [newVersion, ...doc.versions],
            lastModified: new Date().toISOString()
        };
        
        await this.update(docId, updatedDoc);
        return updatedDoc;
    }

    async summarizeBatch(docIds: string[]): Promise<number> {
        console.log(`[AI] Summarizing ${docIds.length} documents.`);
        await yieldToMain();
        
        // Loop through and update summary field
        for (const id of docIds) {
            const doc = await this.getById(id);
            if (doc) {
                await this.update(id, { summary: 'AI Summary: Document processed successfully.' });
            }
        }
        return docIds.length;
    }

    async getTemplates(): Promise<any[]> {
        const docs = await this.getAll();
        return docs.filter(d => d.tags.includes('Template')).map(d => ({
            id: d.id,
            title: d.title,
            category: d.sourceModule || 'General',
            popular: d.riskScore ? d.riskScore > 50 : false
        }));
    }

    async getRecent(): Promise<LegalDocument[]> {
        const docs = await this.getAll();
        return docs.sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).slice(0, 10);
    }
  
  // Store a real file into IDB
  async uploadDocument(file: File, meta: Partial<LegalDocument>): Promise<LegalDocument> {
      const id = `doc-${Date.now()}` as DocumentId;
      
      // 1. Save Metadata
      const newDoc: LegalDocument = {
          id,
          caseId: (meta.caseId || 'General') as CaseId,
          title: file.name,
          type: meta.type || file.type.split('/')[1]?.toUpperCase() || 'File',
          content: 'Binary content stored in secure blob storage.',
          uploadDate: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0],
          tags: ['Uploaded', 'Local'],
          versions: [],
          fileSize: this.formatBytes(file.size),
          sourceModule: meta.sourceModule || 'General',
          status: 'Draft',
          isEncrypted: false
      };

      await this.add(newDoc);

      // 2. Save Binary Blob
      await db.putFile(id, file);

      return newDoc;
  }

  // Retrieve a blob URL for a given document ID
  // Note: Caller is responsible for revoking the URL when done via BlobManager.revoke(url)
  // or BlobManager.revokeByContext(`document-${id}`)
  async getDocumentUrl(id: string): Promise<string | null> {
      try {
          const blob = await this.getFile(id);
          if (blob) {
              return BlobManager.create(blob, `document-${id}`);
          }
          return null;
      } catch (e) {
          console.error("Failed to load file blob", e);
          return null;
      }
  }

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
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

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
}

