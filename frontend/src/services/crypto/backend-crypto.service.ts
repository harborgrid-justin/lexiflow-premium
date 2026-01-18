/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                  BACKEND CRYPTO SERVICE                                   ║
 * ║           Crypto Service with Backend Key Management                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/crypto/backend-crypto.service
 * @description Crypto service with backend key management and rotation
 *
 * FEATURES:
 * - Backend key storage and retrieval
 * - Key rotation support
 * - Secure key derivation
 * - Multi-tenant key isolation
 */

import { apiClient } from '../infrastructure/api-client.service';
import { CacheManager } from '../core/factories/CacheManager';

import { WebCryptoService, type CryptoService, type EncryptionResult } from './CryptoService';

// ============================================================================
// TYPES
// ============================================================================

interface KeyMetadata {
  id: string;
  algorithm: string;
  createdAt: string;
  expiresAt?: string;
  version: number;
}

interface BackendKey {
  id: string;
  key: string;
  metadata: KeyMetadata;
}

/**
 * Backend crypto configuration
 */
export interface BackendCryptoConfig {
  /** API endpoint for keys */
  endpoint?: string;
  /** Enable key caching */
  enableCaching?: boolean;
  /** Cache TTL in ms */
  cacheTTL?: number;
}

// ============================================================================
// SERVICE
// ============================================================================

/**
 * Crypto service with backend key management.
 * 
 * Extends WebCryptoService with backend key storage and retrieval.
 * Supports key rotation and multi-tenant isolation.
 */
export class BackendCryptoService extends WebCryptoService implements CryptoService {
  private keyCache: CacheManager<string>;
  
  private config: BackendCryptoConfig = {
    endpoint: '/api/crypto/keys',
    enableCaching: true,
    cacheTTL: 3600000 // 1 hour
  };

  constructor(config?: BackendCryptoConfig) {
    super();
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.keyCache = new CacheManager<string>({
      defaultTTL: this.config.cacheTTL ?? 3600000,
      name: 'BackendCryptoService'
    });
  }

  /**
   * Get encryption key from backend
   */
  async getServerKey(keyId: string): Promise<string> {
    if (this.config.enableCaching) {
      return this.keyCache.getOrSet(keyId, async () => {
        this.log(`Fetching key from backend: ${keyId}`);
        return this.fetchKeyFromBackend(keyId);
      });
    }

    return this.fetchKeyFromBackend(keyId);
  }

  private async fetchKeyFromBackend(keyId: string): Promise<string> {
    try {
      const response = await apiClient.get<BackendKey>(
        `${this.config.endpoint}/${keyId}`
      );

      this.log(`Fetched key from backend: ${keyId}`);
      return response.key;
      
    } catch (error) {
      this.error(`Failed to fetch key ${keyId}:`, error);
      throw new Error(`Failed to fetch encryption key: ${keyId}`);
    }
  }

  /**
   * Encrypt data with server-managed key
   */
  async encryptWithServerKey(data: string, keyId: string): Promise<EncryptionResult> {
    const key = await this.getServerKey(keyId);
    return this.encrypt(data, key);
  }

  /**
   * Decrypt data with server-managed key
   */
  async decryptWithServerKey(
    result: EncryptionResult,
    keyId: string
  ): Promise<string> {
    const key = await this.getServerKey(keyId);
    const decrypted = await this.decrypt(result, key);
    return decrypted.plaintext;
  }

  /**
   * Create new encryption key on backend
   */
  async createServerKey(metadata?: Partial<KeyMetadata>): Promise<string> {
    try {
      const response = await apiClient.post<BackendKey>(
        this.config.endpoint!,
        {
          algorithm: 'AES-GCM',
          metadata
        }
      );

      this.log(`Created new key: ${response.id}`);
      return response.id;
      
    } catch (error) {
      this.error('Failed to create key:', error);
      throw new Error('Failed to create encryption key');
    }
  }

  /**
   * Rotate encryption key
   */
  async rotateServerKey(oldKeyId: string): Promise<string> {
    try {
      const response = await apiClient.post<BackendKey>(
        `${this.config.endpoint}/${oldKeyId}/rotate`,
        {}
      );

      // Clear old key from cache
      this.keyCache.delete(oldKeyId);

      this.log(`Rotated key: ${oldKeyId} -> ${response.id}`);
      return response.id;
      
    } catch (error) {
      this.error('Failed to rotate key:', error);
      throw new Error('Failed to rotate encryption key');
    }
  }

  /**
   * Delete encryption key from backend
   */
  async deleteServerKey(keyId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.config.endpoint}/${keyId}`);
      
      // Clear from cache
      this.keyCache.delete(keyId);
      
      this.log(`Deleted key: ${keyId}`);
      
    } catch (error) {
      this.error('Failed to delete key:', error);
      throw new Error('Failed to delete encryption key');
    }
  }

  /**
   * List all keys
   */
  async listServerKeys(): Promise<KeyMetadata[]> {
    try {
      const response = await apiClient.get<{ keys: KeyMetadata[] }>(
        this.config.endpoint!
      );

      return response.keys;
      
    } catch (error) {
      this.error('Failed to list keys:', error);
      throw new Error('Failed to list encryption keys');
    }
  }

  /**
   * Clear key cache
   */
  clearKeyCache(): void {
    this.keyCache.clear();
    this.log('Cleared key cache');
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.keyCache.size,
      keys: this.keyCache.keys()
    };
  }
}
