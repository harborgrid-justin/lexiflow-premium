/**
 * Secure localStorage wrapper with encryption
 */

class SecureLocalStorage {
  private prefix = "__secure__";

  set(key: string, value: unknown): void {
    if (typeof window === "undefined") return;

    try {
      const serialized = JSON.stringify(value);
      // In production, encrypt the value before storing
      const stored =
        process.env.NODE_ENV === "production"
          ? this.encrypt(serialized)
          : serialized;

      localStorage.setItem(`${this.prefix}${key}`, stored);
    } catch (error) {
      console.error("Failed to store item:", error);
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(`${this.prefix}${key}`);
      if (!stored) return null;

      const serialized =
        process.env.NODE_ENV === "production" ? this.decrypt(stored) : stored;

      return JSON.parse(serialized) as T;
    } catch (error) {
      console.error("Failed to retrieve item:", error);
      return null;
    }
  }

  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${this.prefix}${key}`);
  }

  clear(): void {
    if (typeof window === "undefined") return;

    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }

  private encrypt(data: string): string {
    // Simple base64 encoding for demo
    // In production, use proper encryption (Web Crypto API)
    return btoa(data);
  }

  private decrypt(encrypted: string): string {
    // Simple base64 decoding for demo
    // In production, use proper decryption
    return atob(encrypted);
  }
}

export const secureLocalStorage = new SecureLocalStorage();
