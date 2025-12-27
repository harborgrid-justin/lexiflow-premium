import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';
import * as crypto from 'crypto';

describe('EncryptionService', () => {
  let service: EncryptionService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'ENCRYPTION_MASTER_KEY') {
        return crypto.randomBytes(32).toString('hex');
      }
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a simple string', () => {
      const plaintext = 'Hello, World!';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
      expect(encrypted.split(':')).toHaveLength(4);
    });

    it('should encrypt and decrypt with custom password', () => {
      const plaintext = 'Sensitive data';
      const password = 'my-secure-password';
      const encrypted = service.encrypt(plaintext, password);
      const decrypted = service.decrypt(encrypted, password);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for same plaintext due to random IV', () => {
      const plaintext = 'Same data';
      const encrypted1 = service.encrypt(plaintext);
      const encrypted2 = service.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      expect(service.decrypt(encrypted1)).toBe(plaintext);
      expect(service.decrypt(encrypted2)).toBe(plaintext);
    });

    it('should fail to decrypt with wrong password', () => {
      const plaintext = 'Secret message';
      const password = 'correct-password';
      const wrongPassword = 'wrong-password';

      const encrypted = service.encrypt(plaintext, password);

      expect(() => service.decrypt(encrypted, wrongPassword)).toThrow('Failed to decrypt data');
    });

    it('should handle empty strings', () => {
      const plaintext = '';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long strings', () => {
      const plaintext = 'A'.repeat(10000);
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters and unicode', () => {
      const plaintext = 'Special: !@#$%^&*() Unicode: 你好世界 🚀';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle JSON strings', () => {
      const obj = { name: 'John Doe', age: 30, email: 'john@example.com' };
      const plaintext = JSON.stringify(obj);
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
      expect(JSON.parse(decrypted)).toEqual(obj);
    });

    it('should throw error for invalid ciphertext format', () => {
      const invalidCiphertext = 'invalid:format';
      expect(() => service.decrypt(invalidCiphertext)).toThrow('Failed to decrypt data');
    });

    it('should throw error for tampered ciphertext', () => {
      const plaintext = 'Original data';
      const encrypted = service.encrypt(plaintext);
      const parts = encrypted.split(':');
      parts[3] = Buffer.from('tampered').toString('base64');
      const tamperedCiphertext = parts.join(':');

      expect(() => service.decrypt(tamperedCiphertext)).toThrow('Failed to decrypt data');
    });
  });

  describe('encryptObject and decryptObject', () => {
    it('should encrypt specified fields in an object', () => {
      const obj = {
        id: '123',
        name: 'John Doe',
        ssn: '123-45-6789',
        email: 'john@example.com',
      };

      const encrypted = service.encryptObject(obj, ['ssn', 'email']);

      expect(encrypted.id).toBe(obj.id);
      expect(encrypted.name).toBe(obj.name);
      expect(encrypted.ssn).not.toBe(obj.ssn);
      expect(encrypted.email).not.toBe(obj.email);
    });

    it('should decrypt specified fields in an object', () => {
      const obj = {
        id: '123',
        name: 'John Doe',
        ssn: '123-45-6789',
        email: 'john@example.com',
      };

      const encrypted = service.encryptObject(obj, ['ssn', 'email']);
      const decrypted = service.decryptObject(encrypted, ['ssn', 'email']);

      expect(decrypted).toEqual(obj);
    });

    it('should handle null and undefined fields', () => {
      const obj = {
        id: '123',
        field1: null,
        field2: undefined,
        field3: 'value',
      };

      const encrypted = service.encryptObject(obj, ['field1', 'field2', 'field3']);

      expect(encrypted.field1).toBeNull();
      expect(encrypted.field2).toBeUndefined();
      expect(encrypted.field3).not.toBe('value');
    });
  });

  describe('hash and hashWithSalt', () => {
    it('should create a consistent SHA-256 hash', () => {
      const data = 'test data';
      const hash1 = service.hash(data);
      const hash2 = service.hash(data);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('should create different hashes for different data', () => {
      const hash1 = service.hash('data1');
      const hash2 = service.hash('data2');

      expect(hash1).not.toBe(hash2);
    });

    it('should create hash with salt', () => {
      const data = 'sensitive data';
      const hashed = service.hashWithSalt(data);

      expect(hashed).toContain(':');
      const parts = hashed.split(':');
      expect(parts).toHaveLength(2);
    });

    it('should verify hash correctly', () => {
      const data = 'test data';
      const hashed = service.hashWithSalt(data);

      expect(service.verifyHash(data, hashed)).toBe(true);
      expect(service.verifyHash('wrong data', hashed)).toBe(false);
    });

    it('should produce different salted hashes for same data', () => {
      const data = 'same data';
      const hash1 = service.hashWithSalt(data);
      const hash2 = service.hashWithSalt(data);

      expect(hash1).not.toBe(hash2);
      expect(service.verifyHash(data, hash1)).toBe(true);
      expect(service.verifyHash(data, hash2)).toBe(true);
    });
  });

  describe('generateRandomBytes and generateRandomString', () => {
    it('should generate random bytes of specified length', () => {
      const bytes = service.generateRandomBytes(16);
      expect(bytes).toHaveLength(16);
      expect(Buffer.isBuffer(bytes)).toBe(true);
    });

    it('should generate different random bytes each time', () => {
      const bytes1 = service.generateRandomBytes(16);
      const bytes2 = service.generateRandomBytes(16);

      expect(bytes1).not.toEqual(bytes2);
    });

    it('should generate random string of specified length', () => {
      const str = service.generateRandomString(32);
      expect(str).toHaveLength(32);
      expect(typeof str).toBe('string');
    });

    it('should generate different random strings each time', () => {
      const str1 = service.generateRandomString(32);
      const str2 = service.generateRandomString(32);

      expect(str1).not.toBe(str2);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate a secure token', () => {
      const token = service.generateSecureToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate different tokens each time', () => {
      const token1 = service.generateSecureToken();
      const token2 = service.generateSecureToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate token of custom length', () => {
      const token = service.generateSecureToken(64);
      expect(token).toBeDefined();
    });
  });

  describe('generateUuid', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = service.generateUuid();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate different UUIDs each time', () => {
      const uuid1 = service.generateUuid();
      const uuid2 = service.generateUuid();

      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('secureCompare', () => {
    it('should return true for identical strings', () => {
      const str = 'test string';
      expect(service.secureCompare(str, str)).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(service.secureCompare('string1', 'string2')).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      expect(service.secureCompare('short', 'longer string')).toBe(false);
    });

    it('should use constant-time comparison', () => {
      const str1 = 'a'.repeat(1000);
      const str2 = 'a'.repeat(1000);
      const str3 = 'a'.repeat(999) + 'b';

      expect(service.secureCompare(str1, str2)).toBe(true);
      expect(service.secureCompare(str1, str3)).toBe(false);
    });
  });

  describe('createHmac and verifyHmac', () => {
    it('should create HMAC signature', () => {
      const data = 'message to sign';
      const hmac = service.createHmac(data);

      expect(hmac).toBeDefined();
      expect(typeof hmac).toBe('string');
      expect(hmac).toHaveLength(64);
    });

    it('should create consistent HMAC for same data', () => {
      const data = 'consistent data';
      const hmac1 = service.createHmac(data);
      const hmac2 = service.createHmac(data);

      expect(hmac1).toBe(hmac2);
    });

    it('should verify HMAC correctly', () => {
      const data = 'signed message';
      const hmac = service.createHmac(data);

      expect(service.verifyHmac(data, hmac)).toBe(true);
      expect(service.verifyHmac('tampered message', hmac)).toBe(false);
    });

    it('should support custom secret for HMAC', () => {
      const data = 'message';
      const secret = 'custom-secret-key';
      const hmac = service.createHmac(data, secret);

      expect(service.verifyHmac(data, hmac, secret)).toBe(true);
      expect(service.verifyHmac(data, hmac, 'wrong-secret')).toBe(false);
    });
  });

  describe('encryptSensitiveFields and decryptSensitiveFields', () => {
    it('should encrypt sensitive fields', () => {
      const entity = {
        id: '123',
        name: 'John Doe',
        creditCard: '4111-1111-1111-1111',
        ssn: '123-45-6789',
      };

      const encrypted = service.encryptSensitiveFields(entity, ['creditCard', 'ssn']);

      expect(encrypted.id).toBe(entity.id);
      expect(encrypted.name).toBe(entity.name);
      expect(encrypted.creditCard).not.toBe(entity.creditCard);
      expect(encrypted.ssn).not.toBe(entity.ssn);
    });

    it('should decrypt sensitive fields', () => {
      const entity = {
        id: '123',
        name: 'John Doe',
        creditCard: '4111-1111-1111-1111',
        ssn: '123-45-6789',
      };

      const encrypted = service.encryptSensitiveFields(entity, ['creditCard', 'ssn']);
      const decrypted = service.decryptSensitiveFields(encrypted, ['creditCard', 'ssn']);

      expect(decrypted).toEqual(entity);
    });
  });

  describe('generateKeyFromPassword', () => {
    it('should generate key from password with salt', () => {
      const password = 'user-password';
      const keyWithSalt = service.generateKeyFromPassword(password);

      expect(keyWithSalt).toContain(':');
      const parts = keyWithSalt.split(':');
      expect(parts).toHaveLength(2);
    });

    it('should generate key from password with provided salt', () => {
      const password = 'user-password';
      const salt = crypto.randomBytes(16).toString('hex');
      const key1 = service.generateKeyFromPassword(password, salt);
      const key2 = service.generateKeyFromPassword(password, salt);

      expect(key1).toBe(key2);
      expect(key1).not.toContain(':');
    });
  });

  describe('encryptForDatabase and decryptFromDatabase', () => {
    it('should encrypt for database storage', () => {
      const plaintext = 'database value';
      const encrypted = service.encryptForDatabase(plaintext);

      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.split(':')).toHaveLength(4);
    });

    it('should decrypt from database', () => {
      const plaintext = 'database value';
      const encrypted = service.encryptForDatabase(plaintext);
      const decrypted = service.decryptFromDatabase(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('isEncrypted', () => {
    it('should identify encrypted strings', () => {
      const plaintext = 'test data';
      const encrypted = service.encrypt(plaintext);

      expect(service.isEncrypted(encrypted)).toBe(true);
      expect(service.isEncrypted(plaintext)).toBe(false);
    });

    it('should return false for invalid format', () => {
      expect(service.isEncrypted('not:encrypted:data')).toBe(false);
      expect(service.isEncrypted('plain text')).toBe(false);
    });
  });

  describe('rotateKey', () => {
    it('should rotate encryption key', () => {
      const plaintext = 'data to rotate';
      const encrypted = service.encrypt(plaintext);
      const rotated = service.rotateKey(encrypted);

      expect(rotated).not.toBe(encrypted);
      expect(service.decrypt(rotated)).toBe(plaintext);
    });

    it('should rotate key with new password', () => {
      const plaintext = 'data to rotate';
      const encrypted = service.encrypt(plaintext);
      const newPassword = 'new-password';
      const rotated = service.rotateKey(encrypted, newPassword);

      expect(service.decrypt(rotated, newPassword)).toBe(plaintext);
    });

    it('should throw error for invalid encrypted data during rotation', () => {
      expect(() => service.rotateKey('invalid:data')).toThrow('Failed to rotate encryption key');
    });
  });

  describe('initialization', () => {
    it('should initialize without master key and log warning', async () => {
      const warnConfigService = {
        get: jest.fn(() => null),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EncryptionService,
          {
            provide: ConfigService,
            useValue: warnConfigService,
          },
        ],
      }).compile();

      const warnService = module.get<EncryptionService>(EncryptionService);
      expect(warnService).toBeDefined();

      const plaintext = 'test data';
      const encrypted = warnService.encrypt(plaintext);
      const decrypted = warnService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for invalid master key length', async () => {
      const invalidKeyConfig = {
        get: jest.fn(() => 'too-short'),
      };

      await expect(async () => {
        await Test.createTestingModule({
          providers: [
            EncryptionService,
            {
              provide: ConfigService,
              useValue: invalidKeyConfig,
            },
          ],
        }).compile();
      }).rejects.toThrow('Invalid master key length');
    });
  });
});
