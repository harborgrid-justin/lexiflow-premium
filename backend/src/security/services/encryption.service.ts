import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  ENCRYPTION_ALGORITHM,
  ENCRYPTION_IV_LENGTH,
  ENCRYPTION_SALT_LENGTH,
  PBKDF2_ITERATIONS,
  PBKDF2_KEY_LENGTH,
  PBKDF2_DIGEST,
  ENCRYPTION_KEY_LENGTH,
} from '@security/constants/security.constants';

/**
 * Enterprise Encryption Service
 * Provides AES-256-GCM encryption for sensitive data at rest
 * Implements secure key derivation using PBKDF2
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly masterKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    // Get master encryption key from environment
    const masterKeyString = this.configService.get<string>('ENCRYPTION_MASTER_KEY');

    if (!masterKeyString) {
      this.logger.warn('ENCRYPTION_MASTER_KEY not set. Using default key. DO NOT USE IN PRODUCTION!');
      // Generate a temporary key for development only
      this.masterKey = crypto.randomBytes(ENCRYPTION_KEY_LENGTH);
    } else {
      // Derive key from provided master key
      this.masterKey = Buffer.from(masterKeyString, 'hex');

      if (this.masterKey.length !== ENCRYPTION_KEY_LENGTH) {
        throw new Error(`Invalid master key length. Expected ${ENCRYPTION_KEY_LENGTH} bytes.`);
      }
    }

    this.logger.log('Encryption service initialized with AES-256-GCM');
  }

  /**
   * Derive an encryption key from a password using PBKDF2
   */
  private deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      PBKDF2_KEY_LENGTH,
      PBKDF2_DIGEST
    );
  }

  /**
   * Encrypt data using AES-256-GCM
   * Returns: salt:iv:authTag:encryptedData (all base64 encoded)
   */
  encrypt(plaintext: string, password?: string): string {
    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(ENCRYPTION_SALT_LENGTH);
      const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);

      // Derive key from password or use master key
      const key = password ? this.deriveKey(password, salt) : this.masterKey;

      // Create cipher
      const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

      // Encrypt data
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      // Combine salt, iv, authTag, and encrypted data
      const result = [
        salt.toString('base64'),
        iv.toString('base64'),
        authTag.toString('base64'),
        encrypted,
      ].join(':');

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Encryption failed: ${err.message}`, err.stack);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data encrypted with AES-256-GCM
   * Expects format: salt:iv:authTag:encryptedData
   */
  decrypt(ciphertext: string, password?: string): string {
    try {
      // Split the components
      const parts = ciphertext.split(':');
      if (parts.length !== 4) {
        throw new Error('Invalid ciphertext format');
      }

      const [saltB64, ivB64, authTagB64, encryptedData] = parts;
      if (!saltB64 || !ivB64 || !authTagB64 || !encryptedData) {
        throw new Error('Invalid ciphertext components');
      }

      // Decode components
      const salt = Buffer.from(saltB64, 'base64');
      const iv = Buffer.from(ivB64, 'base64');
      const authTag = Buffer.from(authTagB64, 'base64');

      // Derive key from password or use master key
      const key = password ? this.deriveKey(password, salt) : this.masterKey;

      // Create decipher
      const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt data
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Decryption failed: ${err.message}`, err.stack);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt an object field by field
   * Returns object with encrypted values
   */
  encryptObject<T extends Record<string, unknown>>(
    obj: T,
    fieldsToEncrypt: (keyof T)[],
    password?: string
  ): T {
    const result = { ...obj };

    for (const field of fieldsToEncrypt) {
      if (result[field] !== null && result[field] !== undefined) {
        const value = String(result[field]);
        result[field] = this.encrypt(value, password) as T[keyof T];
      }
    }

    return result;
  }

  /**
   * Decrypt an object field by field
   * Returns object with decrypted values
   */
  decryptObject<T extends Record<string, unknown>>(
    obj: T,
    fieldsToDecrypt: (keyof T)[],
    password?: string
  ): T {
    const result = { ...obj };

    for (const field of fieldsToDecrypt) {
      if (result[field] !== null && result[field] !== undefined) {
        try {
          result[field] = this.decrypt(String(result[field]), password) as T[keyof T];
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          this.logger.error(`Failed to decrypt field ${String(field)}: ${err.message}`);
          // Keep encrypted value if decryption fails
        }
      }
    }

    return result;
  }

  /**
   * Hash data using SHA-256 (one-way hash)
   * Use for data integrity checks, not for passwords
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash data with salt using SHA-512
   * Returns: salt:hash
   */
  hashWithSalt(data: string, providedSalt?: Buffer): string {
    const salt = providedSalt || crypto.randomBytes(ENCRYPTION_SALT_LENGTH);
    const hash = crypto.createHash('sha512').update(data + salt.toString('hex')).digest('hex');
    return `${salt.toString('hex')}:${hash}`;
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hashedData: string): boolean {
    try {
      const [saltHex, expectedHash] = hashedData.split(':');
      if (!saltHex || !expectedHash) {
        throw new Error('Invalid hash format');
      }
      const actualHash = crypto.createHash('sha512').update(data + saltHex).digest('hex');

      // Use timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(actualHash, 'hex'),
        Buffer.from(expectedHash, 'hex')
      );
    } catch {
      return false;
    }
  }

  /**
   * Generate cryptographically secure random bytes
   */
  generateRandomBytes(length: number): Buffer {
    return crypto.randomBytes(length);
  }

  /**
   * Generate a cryptographically secure random string
   */
  generateRandomString(length: number, encoding: BufferEncoding = 'hex'): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString(encoding).slice(0, length);
  }

  /**
   * Generate a secure random token
   */
  generateSecureToken(length = 32): string {
    return this.generateRandomBytes(length).toString('base64url');
  }

  /**
   * Generate a UUID v4
   */
  generateUuid(): string {
    return crypto.randomUUID();
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch {
      return false;
    }
  }

  /**
   * Create HMAC signature
   */
  createHmac(data: string, secret?: string): string {
    const key = secret || this.masterKey.toString('hex');
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHmac(data: string, signature: string, secret?: string): boolean {
    const expectedSignature = this.createHmac(data, secret);
    return this.secureCompare(signature, expectedSignature);
  }

  /**
   * Encrypt sensitive fields in a database entity
   * This is a helper for automatic field-level encryption
   */
  encryptSensitiveFields<T extends Record<string, unknown>>(
    entity: T,
    sensitiveFields: string[]
  ): T {
    const encrypted = { ...entity } as Record<string, any>;

    for (const field of sensitiveFields) {
      if (encrypted[field] !== null && encrypted[field] !== undefined) {
        try {
          encrypted[field] = this.encrypt(String(encrypted[field]));
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          this.logger.error(`Failed to encrypt field ${field}: ${err.message}`);
        }
      }
    }

    return encrypted as T;
  }

  /**
   * Decrypt sensitive fields in a database entity
   */
  decryptSensitiveFields<T extends Record<string, unknown>>(
    entity: T,
    sensitiveFields: string[]
  ): T {
    const decrypted = { ...entity } as Record<string, any>;

    for (const field of sensitiveFields) {
      if (decrypted[field] !== null && decrypted[field] !== undefined) {
        try {
          decrypted[field] = this.decrypt(String(decrypted[field]));
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          this.logger.error(`Failed to decrypt field ${field}: ${err.message}`);
          // Keep encrypted value if decryption fails
        }
      }
    }

    return decrypted as T;
  }

  /**
   * Generate encryption key from password (for user-specific encryption)
   */
  generateKeyFromPassword(password: string, salt?: string): string {
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(ENCRYPTION_SALT_LENGTH);
    const key = this.deriveKey(password, saltBuffer);

    if (salt) {
      return key.toString('hex');
    }

    return `${saltBuffer.toString('hex')}:${key.toString('hex')}`;
  }

  /**
   * Encrypt data for storage in database
   * Optimized for VARCHAR fields
   */
  encryptForDatabase(plaintext: string): string {
    return this.encrypt(plaintext);
  }

  /**
   * Decrypt data from database
   */
  decryptFromDatabase(ciphertext: string): string {
    return this.decrypt(ciphertext);
  }

  /**
   * Check if a string is encrypted (basic validation)
   */
  isEncrypted(value: string): boolean {
    // Check if the value has the expected encrypted format (salt:iv:authTag:data)
    const parts = value.split(':');
    return parts.length === 4;
  }

  /**
   * Rotate encryption key (re-encrypt data with new key)
   * WARNING: This should be done during a maintenance window
   */
  rotateKey(encryptedData: string, newPassword?: string): string {
    try {
      // Decrypt with current key
      const plaintext = this.decrypt(encryptedData);

      // Re-encrypt with new key
      return this.encrypt(plaintext, newPassword);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Key rotation failed: ${err.message}`, err.stack);
      throw new Error('Failed to rotate encryption key');
    }
  }
}
