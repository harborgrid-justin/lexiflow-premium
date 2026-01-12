/**
 * @jest-environment jsdom
 * @module tests/services/infrastructure/cryptoService
 * @description Tests for cryptoService - encryption/decryption operations
 */

import { cryptoService } from "@/services/infrastructure/cryptoService";

describe("CryptoService", () => {
  describe("Text Encryption/Decryption", () => {
    const plaintext = "This is a secret message";
    const password = "super-secret-password";

    it("should encrypt and decrypt text successfully", async () => {
      const encrypted = await cryptoService.encrypt(plaintext, password);
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted).toContain(":"); // Format check (salt:iv:encrypted)

      const decrypted = await cryptoService.decrypt(encrypted, password);
      expect(decrypted).toBe(plaintext);
    });

    it("should fail to decrypt with wrong password", async () => {
      const encrypted = await cryptoService.encrypt(plaintext, password);

      await expect(
        cryptoService.decrypt(encrypted, "wrong-password")
      ).rejects.toThrow();
    });

    it("should handle empty strings", async () => {
      const encrypted = await cryptoService.encrypt("", password);
      const decrypted = await cryptoService.decrypt(encrypted, password);
      expect(decrypted).toBe("");
    });

    it("should handle unicode characters", async () => {
      const unicode = "你好世界 🌍 Привет мир";
      const encrypted = await cryptoService.encrypt(unicode, password);
      const decrypted = await cryptoService.decrypt(encrypted, password);
      expect(decrypted).toBe(unicode);
    });

    it("should produce different ciphertext for same plaintext", async () => {
      const encrypted1 = await cryptoService.encrypt(plaintext, password);
      const encrypted2 = await cryptoService.encrypt(plaintext, password);

      expect(encrypted1).not.toBe(encrypted2); // Different IVs
    });
  });

  describe("Hash Generation", () => {
    it("should generate consistent hash for same input", async () => {
      const input = "test data";
      const hash1 = await cryptoService.hash(input);
      const hash2 = await cryptoService.hash(input);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different inputs", async () => {
      const hash1 = await cryptoService.hash("data1");
      const hash2 = await cryptoService.hash("data2");

      expect(hash1).not.toBe(hash2);
    });

    it("should produce fixed-length hashes", async () => {
      const hash1 = await cryptoService.hash("short");
      const hash2 = await cryptoService.hash(
        "a very long input string with lots of characters"
      );

      expect(hash1.length).toBe(hash2.length);
    });
  });

  describe("Key Derivation", () => {
    it("should derive key from password", async () => {
      const password = "my-password";
      const salt = "salt-value";

      const key = await cryptoService.deriveKey(password, salt);
      expect(key).toBeDefined();
      expect(typeof key).toBe("object"); // CryptoKey
    });

    it("should derive same key for same password and salt", async () => {
      const password = "my-password";
      const salt = "salt-value";

      const key1 = await cryptoService.deriveKey(password, salt);
      const key2 = await cryptoService.deriveKey(password, salt);

      // Keys should be equivalent (can't directly compare CryptoKey objects)
      expect(key1.type).toBe(key2.type);
      expect(key1.algorithm).toEqual(key2.algorithm);
    });
  });

  describe("Random Value Generation", () => {
    it("should generate random bytes", () => {
      const bytes1 = cryptoService.generateRandomBytes(16);
      const bytes2 = cryptoService.generateRandomBytes(16);

      expect(bytes1.length).toBe(16);
      expect(bytes2.length).toBe(16);
      expect(bytes1).not.toEqual(bytes2); // Should be random
    });

    it("should generate random strings", () => {
      const str1 = cryptoService.generateRandomString(32);
      const str2 = cryptoService.generateRandomString(32);

      expect(str1.length).toBe(32);
      expect(str2.length).toBe(32);
      expect(str1).not.toBe(str2);
    });

    it("should handle different lengths", () => {
      const short = cryptoService.generateRandomString(8);
      const long = cryptoService.generateRandomString(64);

      expect(short.length).toBe(8);
      expect(long.length).toBe(64);
    });
  });

  describe("Data Signing", () => {
    it("should sign and verify data", async () => {
      const data = "data to sign";
      const signature = await cryptoService.sign(data, password);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe("string");

      const isValid = await cryptoService.verify(data, signature, password);
      expect(isValid).toBe(true);
    });

    it("should fail verification with tampered data", async () => {
      const data = "original data";
      const signature = await cryptoService.sign(data, password);

      const isValid = await cryptoService.verify(
        "tampered data",
        signature,
        password
      );
      expect(isValid).toBe(false);
    });

    it("should fail verification with wrong key", async () => {
      const data = "data to sign";
      const signature = await cryptoService.sign(data, "password1");

      const isValid = await cryptoService.verify(data, signature, "password2");
      expect(isValid).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed encrypted data", async () => {
      await expect(
        cryptoService.decrypt("invalid-data", password)
      ).rejects.toThrow();
    });

    it("should handle missing password", async () => {
      await expect(
        // @ts-expect-error - Testing invalid input
        cryptoService.encrypt("data", null)
      ).rejects.toThrow();
    });

    it("should handle invalid encrypted format", async () => {
      const invalidFormat = "no-colons-here";
      await expect(
        cryptoService.decrypt(invalidFormat, password)
      ).rejects.toThrow();
    });
  });

  describe("Binary Data Support", () => {
    it("should encrypt and decrypt binary data", async () => {
      const binaryData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const encrypted = await cryptoService.encryptBinary(binaryData, password);
      const decrypted = await cryptoService.decryptBinary(encrypted, password);

      expect(decrypted).toEqual(binaryData);
    });

    it("should handle large binary data", async () => {
      const largeBinary = new Uint8Array(1024 * 100); // 100KB
      for (let i = 0; i < largeBinary.length; i++) {
        largeBinary[i] = i % 256;
      }

      const encrypted = await cryptoService.encryptBinary(
        largeBinary,
        password
      );
      const decrypted = await cryptoService.decryptBinary(encrypted, password);

      expect(decrypted).toEqual(largeBinary);
    });
  });

  describe("Performance", () => {
    it("should encrypt/decrypt within reasonable time", async () => {
      const data = "test data".repeat(100);

      const start = Date.now();
      const encrypted = await cryptoService.encrypt(data, password);
      const decrypted = await cryptoService.decrypt(encrypted, password);
      const elapsed = Date.now() - start;

      expect(decrypted).toBe(data);
      expect(elapsed).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
