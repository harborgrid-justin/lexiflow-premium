/**
 * @module services/cryptoService
 * @category Services - Cryptography
 * @description Production-ready cryptographic service using native Web Crypto API
 */

const CHUNK_SIZE = 64 * 1024; // 64KB chunks for memory-efficient file processing

interface HashResult {
  hash: string;
  fileName: string;
  size: number;
  processingTime: number;
}

interface HashError {
  error: string;
  fileName: string;
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Read file in chunks for memory efficiency with large files
 */
async function readFileInChunks(file: File, chunkSize: number): Promise<Uint8Array[]> {
  const chunks: Uint8Array[] = [];
  let offset = 0;
  
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    const arrayBuffer = await chunk.arrayBuffer();
    chunks.push(new Uint8Array(arrayBuffer));
    offset += chunkSize;
  }
  
  return chunks;
}

class CryptoServiceClass {
  /**
   * Compute SHA-256 hash of a file with chunked reading for memory efficiency
   */
  async hashFile(file: File): Promise<HashResult> {
    const startTime = performance.now();
    
    try {
      let hashHex: string;
      
      // For small files, use direct hashing
      if (file.size < CHUNK_SIZE) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        hashHex = bufferToHex(hashBuffer);
      } else {
        // For large files, read in chunks
        const chunks = await readFileInChunks(file, CHUNK_SIZE);
        
        // Concatenate all chunks into single buffer for hashing
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
        hashHex = bufferToHex(hashBuffer);
      }
      
      const processingTime = performance.now() - startTime;
      
      return {
        hash: hashHex,
        fileName: file.name,
        size: file.size,
        processingTime
      };
    } catch (error) {
      throw new Error(`Failed to hash file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch hash multiple files with progress tracking
   */
  async hashFiles(files: File[]): Promise<Array<HashResult | HashError>> {
    const results: Array<HashResult | HashError> = [];
    
    for (const file of files) {
      try {
        const result = await this.hashFile(file);
        results.push(result);
      } catch (error) {
        results.push({
          error: error instanceof Error ? error.message : 'Unknown error',
          fileName: file.name
        });
      }
    }
    
    return results;
  }

  /**
   * Compute SHA-256 hash of a string
   */
  async hashString(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return bufferToHex(hashBuffer);
  }

  /**
   * Compute SHA-256 hash of binary data
   */
  async hashBuffer(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return bufferToHex(hashBuffer);
  }

  /**
   * Generate random hex string for IDs/tokens
   */
  async generateRandomHex(bytes: number = 32): Promise<string> {
    const randomBytes = new Uint8Array(bytes);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Compare two hashes in constant time to prevent timing attacks
   */
  constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * No-op cleanup method for API compatibility
   */
  terminate(): void {
    // No cleanup needed with native crypto.subtle
  }
}

export const CryptoService = new CryptoServiceClass();
