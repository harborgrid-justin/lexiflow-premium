
import { EvidenceItem, FileChunk } from '../types.ts';

export const DocumentService = {
  // Simulate reading a file and generating a SHA-256 hash
  async processFile(file: File): Promise<{ 
    hash: string; 
    uuid: string; 
    chunks: FileChunk[];
    tags: string[];
    summary: string;
  }> {
    return new Promise((resolve) => {
      // Simulate async processing time (Scanning, OCR, Hashing)
      setTimeout(() => {
        const uuid = crypto.randomUUID();
        const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        // Simulate splitting the document into pages/chunks
        const chunkCount = Math.floor(Math.random() * 5) + 2; // Ensure at least 2 chunks for demo
        const chunks: FileChunk[] = [];
        for (let i = 1; i <= chunkCount; i++) {
            chunks.push({
                id: `${uuid}-p${i}`,
                pageNumber: i,
                contentPreview: `Extracted content from page ${i} of ${file.name}. This section contains key definitions and clauses verified against the master record.`,
                hash: '0x' + Math.floor(Math.random() * 10000000).toString(16) + '...'
            });
        }

        // Auto-tagging based on file type
        const tags = ['Uploaded', file.type.split('/')[1] || 'Unknown'];
        if (file.name.toLowerCase().includes('contract')) tags.push('Contract');
        if (file.name.toLowerCase().includes('email')) tags.push('Correspondence');
        
        resolve({
          hash: mockHash,
          uuid: uuid,
          chunks: chunks,
          tags: tags,
          summary: `Auto-generated summary for ${file.name}. Parsed ${chunkCount} pages. Verified clean of malware. Authenticated source.`
        });
      }, 2500);
    });
  },

  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  },

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
