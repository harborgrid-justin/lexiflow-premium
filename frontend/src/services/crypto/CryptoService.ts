/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                        CRYPTO SERVICE                                     ║
 * ║          Enterprise Browser Capability - Web Crypto API                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/crypto/CryptoService
 * @description Enterprise-compliant Web Crypto API service
 *
 * COMPLIANCE CHECKLIST:
 * [✓] Is this logic imperative? YES - wraps Web Crypto API
 * [✓] Does it touch browser or SDK APIs? YES - crypto.subtle
 * [✓] Is it stateless? YES - no domain state
 * [✓] Is it injectable? YES - implements IService
 * [✓] Does it avoid domain knowledge? YES - generic encryption/hashing
 * [✓] Does it avoid React imports? YES - no React dependencies
 */

import {
  BaseService,
  ServiceError,
  type ServiceConfig,
} from "../core/BaseService";

// ============================================================================
// TYPES
// ============================================================================

export interface CryptoServiceConfig extends ServiceConfig {
  /** Default algorithm for encryption */
  algorithm?: "AES-GCM" | "AES-CBC";
  /** Key length in bits */
  keyLength?: 128 | 192 | 256;
}

export interface EncryptionResult {
  ciphertext: string;
  iv: string;
  algorithm: string;
}

export interface DecryptionResult {
  plaintext: string;
}

export interface HashResult {
  hash: string;
  algorithm: string;
}

// ============================================================================
// CRYPTO SERVICE INTERFACE
// ============================================================================

export interface CryptoService {
  encrypt(data: string, key: string): Promise<EncryptionResult>;
  decrypt(result: EncryptionResult, key: string): Promise<DecryptionResult>;
  hash(
    data: string,
    algorithm?: "SHA-256" | "SHA-384" | "SHA-512"
  ): Promise<HashResult>;
  randomBytes(length: number): Uint8Array;
  randomString(length: number): string;
}

// ============================================================================
// WEB CRYPTO SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Web Crypto API service implementation
 * Enterprise-grade cryptographic operations
 */
export class WebCryptoService
  extends BaseService<CryptoServiceConfig>
  implements CryptoService
{
  private algorithm: "AES-GCM" | "AES-CBC" = "AES-GCM";
  private keyLength: 128 | 192 | 256 = 256;
  private supported: boolean = false;

  constructor() {
    super("CryptoService");
  }

  protected override onConfigure(config: CryptoServiceConfig): void {
    this.algorithm = config.algorithm ?? "AES-GCM";
    this.keyLength = config.keyLength ?? 256;
  }

  protected override onStart(): void {
    // Check Web Crypto API support
    this.supported = !!(window.crypto && window.crypto.subtle);

    if (!this.supported) {
      this.error("Web Crypto API not supported");
    } else {
      this.log("Web Crypto API available");
    }
  }

  protected override onHealthCheck(): boolean {
    return this.supported;
  }

  // ==========================================================================
  // ENCRYPTION
  // ==========================================================================

  async encrypt(data: string, key: string): Promise<EncryptionResult> {
    this.ensureRunning();

    if (!this.supported) {
      throw new ServiceError("CryptoService", "Web Crypto API not supported");
    }

    try {
      // Derive key from password
      const cryptoKey = await this.deriveKey(key);

      // Generate random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Encrypt data
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: this.algorithm, iv },
        cryptoKey,
        dataBuffer
      );

      // Convert to base64
      const ciphertext = this.arrayBufferToBase64(encryptedBuffer);
      const ivBase64 = this.arrayBufferToBase64(iv.buffer);

      return {
        ciphertext,
        iv: ivBase64,
        algorithm: this.algorithm,
      };
    } catch (error) {
      throw new ServiceError(
        "CryptoService",
        `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async decrypt(
    result: EncryptionResult,
    key: string
  ): Promise<DecryptionResult> {
    this.ensureRunning();

    if (!this.supported) {
      throw new ServiceError("CryptoService", "Web Crypto API not supported");
    }

    try {
      // Derive key from password
      const cryptoKey = await this.deriveKey(key);

      // Convert from base64
      const ciphertext = this.base64ToArrayBuffer(result.ciphertext);
      const iv = this.base64ToArrayBuffer(result.iv);

      // Decrypt data
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: result.algorithm, iv: new Uint8Array(iv) },
        cryptoKey,
        ciphertext
      );

      // Convert to string
      const decoder = new TextDecoder();
      const plaintext = decoder.decode(decryptedBuffer);

      return { plaintext };
    } catch (error) {
      throw new ServiceError(
        "CryptoService",
        `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // ==========================================================================
  // HASHING
  // ==========================================================================

  async hash(
    data: string,
    algorithm: "SHA-256" | "SHA-384" | "SHA-512" = "SHA-256"
  ): Promise<HashResult> {
    this.ensureRunning();

    if (!this.supported) {
      throw new ServiceError("CryptoService", "Web Crypto API not supported");
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      const hashBuffer = await window.crypto.subtle.digest(
        algorithm,
        dataBuffer
      );

      const hash = this.arrayBufferToHex(hashBuffer);

      return { hash, algorithm };
    } catch (error) {
      throw new ServiceError(
        "CryptoService",
        `Hashing failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // ==========================================================================
  // RANDOM GENERATION
  // ==========================================================================

  randomBytes(length: number): Uint8Array {
    this.ensureRunning();

    if (!this.supported) {
      throw new ServiceError("CryptoService", "Web Crypto API not supported");
    }

    return window.crypto.getRandomValues(new Uint8Array(length));
  }

  randomString(length: number): string {
    this.ensureRunning();

    const bytes = this.randomBytes(Math.ceil(length * 0.75));
    const base64 = this.arrayBufferToBase64(bytes.buffer as ArrayBuffer);

    // Remove non-alphanumeric and trim to length
    return base64.replace(/[^a-zA-Z0-9]/g, "").slice(0, length);
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private async deriveKey(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    // Derive key (using fixed salt for simplicity - in production use random salt)
    const salt = encoder.encode("lexiflow-crypto-salt-v1");

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ["encrypt", "decrypt"]
    );
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      if (byte !== undefined) {
        binary += String.fromCharCode(byte);
      }
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
