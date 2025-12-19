/**
 * @module services/chainService
 * @category Services - Security
 * @description Blockchain-style audit log chaining service with cryptographic integrity verification.
 * Uses SHA-256 hashing with prevHash linkage to create tamper-evident log chains. Provides entry
 * creation with hash generation, full chain verification re-calculating all hashes, integrity
 * reporting with broken block detection, and JSON ledger export for external auditing.
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Types
import { AuditLogEntry, UUID } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface ChainedLogEntry extends AuditLogEntry {
  hash: string;
  prevHash: string;
}

export interface IntegrityReport {
    isValid: boolean;
    totalBlocks: number;
    brokenIndex: number;
    verifiedAt: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const generateHash = async (data: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const ChainService = {
  generateHash,

  /**
   * Creates a new cryptographically chained entry.
   */
  createEntry: async (entry: Omit<AuditLogEntry, 'id'>, prevHash: string): Promise<ChainedLogEntry> => {
    const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as UUID;
    // The data string includes the previous hash, locking the chain.
    const dataString = `${id}:${entry.timestamp}:${entry.user}:${entry.action}:${entry.resource}:${prevHash}`;
    const hash = await generateHash(dataString);
    
    return {
      ...entry,
      id,
      prevHash,
      hash
    };
  },

  /**
   * Verifies the integrity of the entire chain re-calculating hashes.
   */
  verifyChain: async (chain: ChainedLogEntry[]): Promise<IntegrityReport> => {
    // Genesis block assumption
    const genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < chain.length; i++) {
      const current = chain[i];
      
      // Skip verification if block lacks hash (legacy data)
      if (!current.hash) {
          return { isValid: false, brokenIndex: i, totalBlocks: chain.length, verifiedAt: new Date().toISOString() };
      }

      const expectedPrevHash = i === 0 ? genesisHash : chain[i - 1].hash;

      // 1. Verify Linkage (Pointer Check)
      if (current.prevHash !== expectedPrevHash) {
        console.error(`Chain Broken at index ${i}: prevHash mismatch`);
        return { isValid: false, brokenIndex: i, totalBlocks: chain.length, verifiedAt: new Date().toISOString() };
      }

      // 2. Verify Content Integrity (Hash Check)
      const dataString = `${current.id}:${current.timestamp}:${current.user}:${current.action}:${current.resource}:${current.prevHash}`;
      const calculatedHash = await generateHash(dataString);

      if (calculatedHash !== current.hash) {
         console.error(`Chain Broken at index ${i}: Data tampered`);
         return { isValid: false, brokenIndex: i, totalBlocks: chain.length, verifiedAt: new Date().toISOString() };
      }
    }
    
    return { isValid: true, brokenIndex: -1, totalBlocks: chain.length, verifiedAt: new Date().toISOString() };
  },

  /**
   * Exports the ledger as a JSON file for external auditing.
   */
  exportLedger: (chain: ChainedLogEntry[]) => {
      const dataStr = JSON.stringify(chain, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `lexiflow_ledger_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  }
};
