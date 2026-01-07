/**
 * Edge Runtime Adapters
 * Runtime flags and adapters for Edge-safe environment
 * MUST NOT use Node.js-only APIs (fs, crypto module, etc.)
 */

export const runtime = {
  name: "edge" as const,
  isNode: false,
  isEdge: true,
  isBrowser: false,
};

/**
 * Edge-safe crypto adapter
 * Uses Web Crypto API (available in all modern environments)
 */
export const cryptoAdapter = {
  async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  },

  async encrypt(data: string, key: string): Promise<string> {
    // Implement using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encoder.encode(data)
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  },

  async decrypt(_encrypted: string, _key: string): Promise<string> {
    // Implement using Web Crypto API
    throw new Error("Not implemented");
  },
};

/**
 * Edge-safe storage adapter
 * Uses KV storage or Cache API when available
 */
export const storageAdapter = {
  async get(key: string): Promise<string | null> {
    // Edge environments typically provide KV storage
    // @ts-ignore - environment-specific global
    if (typeof KV !== "undefined") {
      // @ts-ignore
      return await KV.get(key);
    }

    // Fallback to Cache API
    if (typeof caches !== "undefined") {
      const cache = await caches.open("edge-storage");
      const response = await cache.match(key);
      return response ? await response.text() : null;
    }

    return null;
  },

  async set(key: string, value: string): Promise<void> {
    // @ts-ignore
    if (typeof KV !== "undefined") {
      // @ts-ignore
      await KV.put(key, value);
      return;
    }

    if (typeof caches !== "undefined") {
      const cache = await caches.open("edge-storage");
      await cache.put(key, new Response(value));
    }
  },

  async delete(key: string): Promise<void> {
    // @ts-ignore
    if (typeof KV !== "undefined") {
      // @ts-ignore
      await KV.delete(key);
      return;
    }

    if (typeof caches !== "undefined") {
      const cache = await caches.open("edge-storage");
      await cache.delete(key);
    }
  },
};
