/**
 * Node.js Runtime Adapters
 * Runtime flags and adapters for Node.js environment
 */

export const runtime = {
  name: "node" as const,
  isNode: true,
  isEdge: false,
  isBrowser: false,
};

/**
 * Node-specific crypto adapter
 * Uses Node.js crypto module
 */
export const cryptoAdapter = {
  async hash(data: string): Promise<string> {
    const crypto = await import("crypto");
    return crypto.createHash("sha256").update(data).digest("hex");
  },

  async encrypt(data: string, key: string): Promise<string> {
    const crypto = await import("crypto");
    const iv = crypto.randomBytes(16);
    const keyBuffer = crypto.createHash("sha256").update(key).digest();
    const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
    const encrypted = cipher.update(data, "utf8", "hex") + cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  },

  async decrypt(encrypted: string, key: string): Promise<string> {
    const crypto = await import("crypto");
    const parts = encrypted.split(":");
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      throw new Error("Invalid encrypted format");
    }
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const keyBuffer = crypto.createHash("sha256").update(key).digest();
    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
    return (
      decipher.update(encryptedText, "hex", "utf8") + decipher.final("utf8")
    );
  },
};

/**
 * Node-specific storage adapter
 * Can use file system for caching
 */
export const storageAdapter = {
  async get(_key: string): Promise<string | null> {
    // Implement file-based storage or use a cache like Redis
    return null;
  },

  async set(_key: string, _value: string): Promise<void> {
    // Implement file-based storage or use a cache like Redis
  },

  async delete(_key: string): Promise<void> {
    // Implement file-based storage
  },
};
