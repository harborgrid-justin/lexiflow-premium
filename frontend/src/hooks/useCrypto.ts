import { useCallback } from "react";
import type { IService } from "../services/core/ServiceLifecycle";
import { ServiceRegistry } from "../services/core/ServiceRegistry";
import type { CryptoService } from "../services/crypto/CryptoService";

/**
 * HOOK ADAPTER for CryptoService
 *
 * PATTERN: Hooks adapt services, never vice versa
 * ROLE: Provide React-friendly interface to crypto capability
 */

export function useCrypto() {
  const cryptoService = ServiceRegistry.get<IService>(
    "CryptoService"
  ) as unknown as CryptoService;

  const encrypt = useCallback(
    async (data: string, key: string) => {
      try {
        return await cryptoService.encrypt(data, key);
      } catch (error) {
        console.error("[useCrypto] Encryption failed:", error);
        return null;
      }
    },
    [cryptoService]
  );

  const decrypt = useCallback(
    async (result: Parameters<CryptoService["decrypt"]>[0], key: string) => {
      try {
        return await cryptoService.decrypt(result, key);
      } catch (error) {
        console.error("[useCrypto] Decryption failed:", error);
        return null;
      }
    },
    [cryptoService]
  );

  const hash = useCallback(
    async (data: string, algorithm?: "SHA-256" | "SHA-384" | "SHA-512") => {
      try {
        return await cryptoService.hash(data, algorithm);
      } catch (error) {
        console.error("[useCrypto] Hashing failed:", error);
        return null;
      }
    },
    [cryptoService]
  );

  const randomBytes = useCallback(
    (length: number) => {
      return cryptoService.randomBytes(length);
    },
    [cryptoService]
  );

  const randomString = useCallback(
    (length: number) => {
      return cryptoService.randomString(length);
    },
    [cryptoService]
  );

  return { encrypt, decrypt, hash, randomBytes, randomString };
}
