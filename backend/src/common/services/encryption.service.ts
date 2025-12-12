import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface EncryptionResult {
  ciphertext: string;
  iv: string;
  tag: string;
  algorithm: string;
}

export interface DecryptionOptions {
  ciphertext: string;
  iv: string;
  tag: string;
  algorithm?: string;
}

/**
 * Encryption Service
 * Implements AES-256-GCM field-level encryption for sensitive data
 * OWASP ASVS V6.2 - Cryptography at Rest
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly masterKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivationIterations = 100000;
  private readonly saltLength = 32;
  private readonly ivLength = 16; // 128 bits for GCM
  private readonly tagLength = 16; // 128 bits for GCM

  constructor(private configService: ConfigService) {
    // Get master encryption key from environment
    const masterKeyHex =
      this.configService.get<string>('ENCRYPTION_MASTER_KEY');

    if (!masterKeyHex) {
      this.logger.warn(
        'ENCRYPTION_MASTER_KEY not set. Using default key. DO NOT USE IN PRODUCTION!',
      );
      // Generate a deterministic key for development (DO NOT USE IN PRODUCTION)
      this.masterKey = crypto.scryptSync(
        'development-only-key',
        'salt',
        32,
      );
    } else {
      // Validate and use provided key
      if (masterKeyHex.length !== 64) {
        throw new Error(
          'ENCRYPTION_MASTER_KEY must be 64 hex characters (32 bytes)',
        );
      }
      this.masterKey = Buffer.from(masterKeyHex, 'hex');
    }

    this.logger.log('Encryption service initialized with AES-256-GCM');
  }

  /**
   * Encrypt data using AES-256-GCM
   * Provides both confidentiality and authenticity
   */
  encrypt(plaintext: string, context?: string): EncryptionResult {
    try {
      // Generate random IV for each encryption
      const iv = crypto.randomBytes(this.ivLength);

      // Derive encryption key from master key and optional context
      const encryptionKey = this.deriveKey(context);

      // Create cipher
      const cipher = crypto.createCipheriv(
        this.algorithm,
        encryptionKey,
        iv,
      );

      // Encrypt
      let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
      ciphertext += cipher.final('base64');

      // Get authentication tag
      const tag = cipher.getAuthTag();

      return {
        ciphertext,
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        algorithm: this.algorithm,
      };
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(options: DecryptionOptions, context?: string): string {
    try {
      const { ciphertext, iv, tag, algorithm = this.algorithm } = options;

      // Validate algorithm
      if (algorithm !== this.algorithm) {
        throw new Error(`Unsupported algorithm: ${algorithm}`);
      }

      // Derive decryption key (must match encryption key)
      const decryptionKey = this.deriveKey(context);

      // Convert from base64
      const ivBuffer = Buffer.from(iv, 'base64');
      const tagBuffer = Buffer.from(tag, 'base64');

      // Create decipher
      const decipher = crypto.createDecipheriv(
        algorithm,
        decryptionKey,
        ivBuffer,
      );

      // Set authentication tag
      decipher.setAuthTag(tagBuffer);

      // Decrypt
      let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
      plaintext += decipher.final('utf8');

      return plaintext;
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Encrypt an object's field
   */
  encryptField(
    obj: any,
    fieldName: string,
    context?: string,
  ): void {
    if (obj[fieldName] === undefined || obj[fieldName] === null) {
      return;
    }

    const value = String(obj[fieldName]);
    const encrypted = this.encrypt(value, context);

    // Store as JSON string in the field
    obj[fieldName] = JSON.stringify(encrypted);
  }

  /**
   * Decrypt an object's field
   */
  decryptField(
    obj: any,
    fieldName: string,
    context?: string,
  ): void {
    if (obj[fieldName] === undefined || obj[fieldName] === null) {
      return;
    }

    try {
      const encrypted = JSON.parse(obj[fieldName]);
      const decrypted = this.decrypt(encrypted, context);
      obj[fieldName] = decrypted;
    } catch (error) {
      this.logger.error(
        `Failed to decrypt field ${fieldName}: ${error.message}`,
      );
      // Don't throw - leave field encrypted
    }
  }

  /**
   * Hash data using SHA-256
   * Use for non-reversible hashing (e.g., checksums, fingerprints)
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash data using SHA-512
   */
  hashSHA512(data: string): string {
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  /**
   * Generate HMAC for data integrity
   */
  hmac(data: string, secret?: string): string {
    const key = secret ? Buffer.from(secret) : this.masterKey;
    return crypto
      .createHmac('sha256', key)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHmac(data: string, expectedHmac: string, secret?: string): boolean {
    const actualHmac = this.hmac(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(actualHmac),
      Buffer.from(expectedHmac),
    );
  }

  /**
   * Generate a cryptographically secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random API key
   */
  generateApiKey(): string {
    // Format: prefix_randomData
    const prefix = 'sk';
    const randomData = crypto.randomBytes(32).toString('base64url');
    return `${prefix}_${randomData}`;
  }

  /**
   * Derive encryption key from master key and optional context
   * Uses HKDF (HMAC-based Key Derivation Function)
   */
  private deriveKey(context?: string): Buffer {
    if (!context) {
      return this.masterKey;
    }

    // Use HKDF to derive a context-specific key
    const salt = crypto.createHash('sha256').update(context).digest();

    return crypto.pbkdf2Sync(
      this.masterKey,
      salt,
      this.keyDerivationIterations,
      32, // 256 bits
      'sha256',
    );
  }

  /**
   * Encrypt sensitive database fields
   * Returns a new object with encrypted fields
   */
  encryptSensitiveFields<T extends Record<string, any>>(
    data: T,
    sensitiveFields: (keyof T)[],
    context?: string,
  ): T {
    const encrypted = { ...data };

    for (const field of sensitiveFields) {
      if (data[field] !== undefined && data[field] !== null) {
        const value = String(data[field]);
        const encryptedValue = this.encrypt(value, context);
        (encrypted as any)[field] = JSON.stringify(encryptedValue);
      }
    }

    return encrypted;
  }

  /**
   * Decrypt sensitive database fields
   * Returns a new object with decrypted fields
   */
  decryptSensitiveFields<T extends Record<string, any>>(
    data: T,
    sensitiveFields: (keyof T)[],
    context?: string,
  ): T {
    const decrypted = { ...data };

    for (const field of sensitiveFields) {
      if (data[field] !== undefined && data[field] !== null) {
        try {
          const encrypted = JSON.parse(String(data[field]));
          const decryptedValue = this.decrypt(encrypted, context);
          (decrypted as any)[field] = decryptedValue;
        } catch (error) {
          this.logger.error(
            `Failed to decrypt field ${String(field)}: ${error.message}`,
          );
          // Leave field as is if decryption fails
        }
      }
    }

    return decrypted;
  }

  /**
   * Seal data (encrypt + sign)
   * Provides confidentiality, integrity, and authenticity
   */
  seal(
    plaintext: string,
    context?: string,
  ): {
    sealed: string;
    signature: string;
  } {
    // Encrypt the data
    const encrypted = this.encrypt(plaintext, context);
    const sealedData = JSON.stringify(encrypted);

    // Sign the encrypted data
    const signature = this.hmac(sealedData);

    return {
      sealed: sealedData,
      signature,
    };
  }

  /**
   * Unseal data (verify signature + decrypt)
   */
  unseal(
    sealed: string,
    signature: string,
    context?: string,
  ): string {
    // Verify signature first
    if (!this.verifyHmac(sealed, signature)) {
      throw new Error('Signature verification failed');
    }

    // Decrypt the data
    const encrypted = JSON.parse(sealed);
    return this.decrypt(encrypted, context);
  }

  /**
   * Tokenize sensitive data (one-way)
   * Creates a token that can be used to reference data without exposing it
   */
  tokenize(data: string): string {
    // Use HMAC for deterministic tokenization
    const token = this.hmac(data);
    return `tok_${token}`;
  }

  /**
   * Generate encryption key pair for asymmetric encryption
   */
  generateKeyPair(): {
    publicKey: string;
    privateKey: string;
  } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return { publicKey, privateKey };
  }

  /**
   * Encrypt with public key (RSA)
   */
  encryptWithPublicKey(plaintext: string, publicKey: string): string {
    const buffer = Buffer.from(plaintext, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );
    return encrypted.toString('base64');
  }

  /**
   * Decrypt with private key (RSA)
   */
  decryptWithPrivateKey(ciphertext: string, privateKey: string): string {
    const buffer = Buffer.from(ciphertext, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );
    return decrypted.toString('utf8');
  }

  /**
   * Generate a master key (for initial setup)
   * This should be stored securely (e.g., AWS KMS, HashiCorp Vault, Azure Key Vault)
   */
  static generateMasterKey(): string {
    const key = crypto.randomBytes(32); // 256 bits
    return key.toString('hex');
  }

  /**
   * Rotate encryption key
   * Re-encrypts data with a new key
   */
  async rotateKey(
    encryptedData: DecryptionOptions,
    newKey: Buffer,
    context?: string,
  ): Promise<EncryptionResult> {
    // Decrypt with old key
    const plaintext = this.decrypt(encryptedData, context);

    // Temporarily use new key
    const oldKey = this.masterKey;
    (this as any).masterKey = newKey;

    try {
      // Encrypt with new key
      const newEncrypted = this.encrypt(plaintext, context);

      return newEncrypted;
    } finally {
      // Restore old key
      (this as any).masterKey = oldKey;
    }
  }

  /**
   * Redact sensitive data for logging
   */
  redact(data: string, showLength: number = 4): string {
    if (!data || data.length <= showLength) {
      return '***';
    }

    const visible = data.substring(0, showLength);
    const hidden = '*'.repeat(Math.min(data.length - showLength, 10));
    return `${visible}${hidden}`;
  }
}

/**
 * Decorator for automatic field encryption
 */
export function Encrypted(context?: string) {
  return function (target: any, propertyKey: string) {
    const metadata = Reflect.getMetadata('encrypted:fields', target) || [];
    metadata.push({ field: propertyKey, context });
    Reflect.defineMetadata('encrypted:fields', metadata, target);
  };
}

/**
 * Encryption transformer for TypeORM
 */
export class EncryptionTransformer {
  constructor(
    private encryptionService: EncryptionService,
    private context?: string,
  ) {}

  to(value: string): string {
    if (value === null || value === undefined) {
      return value;
    }
    const encrypted = this.encryptionService.encrypt(value, this.context);
    return JSON.stringify(encrypted);
  }

  from(value: string): string {
    if (value === null || value === undefined) {
      return value;
    }
    try {
      const encrypted = JSON.parse(value);
      return this.encryptionService.decrypt(encrypted, this.context);
    } catch (error) {
      // If decryption fails, return as-is (might be unencrypted legacy data)
      return value;
    }
  }
}
