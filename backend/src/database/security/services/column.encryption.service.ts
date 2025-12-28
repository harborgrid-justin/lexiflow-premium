import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface EncryptionKeyConfig {
  current: string;
  previous?: string[];
}

export interface EncryptedValue {
  data: string;
  keyVersion: number;
  iv: string;
  authTag: string;
}

@Injectable()
export class ColumnEncryptionService {
  private readonly logger = new Logger(ColumnEncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16;
  private readonly currentKeyVersion = 1;

  private encryptionKeys: Map<number, Buffer> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeKeys();
  }

  private initializeKeys(): void {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') ||
      this.configService.get<string>('DATABASE_ENCRYPTION_KEY');

    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY or DATABASE_ENCRYPTION_KEY must be set in environment variables');
    }

    const keyBuffer = this.deriveKey(encryptionKey, this.currentKeyVersion);
    this.encryptionKeys.set(this.currentKeyVersion, keyBuffer);

    const previousKeys = this.configService.get<string>('ENCRYPTION_PREVIOUS_KEYS');
    if (previousKeys) {
      try {
        const keys = JSON.parse(previousKeys);
        keys.forEach((key: string, index: number) => {
          const version = this.currentKeyVersion - (index + 1);
          if (version > 0) {
            this.encryptionKeys.set(version, this.deriveKey(key, version));
          }
        });
      } catch (error) {
        this.logger.warn('Failed to parse previous encryption keys', error);
      }
    }

    this.logger.log(`Initialized encryption with ${this.encryptionKeys.size} key version(s)`);
  }

  private deriveKey(key: string, version: number): Buffer {
    const salt = `lexiflow-encryption-v${version}`;
    return crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');
  }

  encrypt(plaintext: string | null | undefined): string | null {
    if (plaintext === null || plaintext === undefined || plaintext === '') {
      return null;
    }

    try {
      const iv = crypto.randomBytes(this.ivLength);
      const key = this.encryptionKeys.get(this.currentKeyVersion);

      if (!key) {
        throw new Error('Encryption key not found');
      }

      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      const encryptedValue: EncryptedValue = {
        data: encrypted,
        keyVersion: this.currentKeyVersion,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
      };

      return Buffer.from(JSON.stringify(encryptedValue)).toString('base64');
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData: string | null | undefined): string | null {
    if (encryptedData === null || encryptedData === undefined || encryptedData === '') {
      return null;
    }

    try {
      const encryptedValue: EncryptedValue = JSON.parse(
        Buffer.from(encryptedData, 'base64').toString('utf8')
      );

      const key = this.encryptionKeys.get(encryptedValue.keyVersion);

      if (!key) {
        throw new Error(`Encryption key version ${encryptedValue.keyVersion} not found`);
      }

      const iv = Buffer.from(encryptedValue.iv, 'hex');
      const authTag = Buffer.from(encryptedValue.authTag, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedValue.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new Error('Failed to decrypt data');
    }
  }

  async rotateKey(columnName: string, _entityClass: any, repository: any): Promise<number> {
    this.logger.log(`Starting key rotation for column ${columnName}`);

    let rotatedCount = 0;
    const batchSize = 100;
    let offset = 0;

    try {
      while (true) {
        const entities = await repository.find({
          take: batchSize,
          skip: offset,
        });

        if (entities.length === 0) {
          break;
        }

        for (const entity of entities) {
          const encryptedValue = entity[columnName];
          if (encryptedValue) {
            const decrypted = this.decrypt(encryptedValue);
            entity[columnName] = this.encrypt(decrypted);
            await repository.save(entity);
            rotatedCount++;
          }
        }

        offset += batchSize;
      }

      this.logger.log(`Key rotation completed. Rotated ${rotatedCount} records`);
      return rotatedCount;
    } catch (error) {
      this.logger.error('Key rotation failed', error);
      throw new Error('Failed to rotate encryption keys');
    }
  }

  encryptObject(obj: Record<string, any>): Record<string, any> {
    const encrypted: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        encrypted[key] = this.encrypt(value);
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        encrypted[key] = this.encryptObject(value);
      } else {
        encrypted[key] = value;
      }
    }

    return encrypted;
  }

  decryptObject(obj: Record<string, any>): Record<string, any> {
    const decrypted: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && this.isEncrypted(value)) {
        try {
          decrypted[key] = this.decrypt(value);
        } catch {
          decrypted[key] = value;
        }
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        decrypted[key] = this.decryptObject(value);
      } else {
        decrypted[key] = value;
      }
    }

    return decrypted;
  }

  private isEncrypted(value: string): boolean {
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      return parsed.data && parsed.keyVersion && parsed.iv && parsed.authTag;
    } catch {
      return false;
    }
  }

  generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  compareHash(value: string, hash: string): boolean {
    const valueHash = this.hashValue(value);
    return crypto.timingSafeEqual(
      Buffer.from(valueHash),
      Buffer.from(hash)
    );
  }
}
