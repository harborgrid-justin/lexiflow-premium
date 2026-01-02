"use client";

/**
 * Crypto Worker - Off-thread cryptographic operations
 *
 * Next.js 16: Client-only (uses Worker API)
 */

const createCryptoWorker = (): Worker | null => {
  // Check if Worker API is available (not available in SSR)
  if (typeof Worker === "undefined") {
    console.warn("[CryptoWorker] Worker API not available (SSR mode)");
    return null;
  }

  const code = `
      self.onmessage = async function(e) {
        const { fileChunk, id } = e.data;

        try {
            // SHA-256 Hashing
            const hashBuffer = await crypto.subtle.digest('SHA-256', fileChunk);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            self.postMessage({ id, hash: hashHex, status: 'success' });
        } catch (error) {
            self.postMessage({ id, error: error.message, status: 'error' });
        }
      };
    `;

  try {
    const blob = new Blob([code], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url); // Clean up blob URL immediately
    return worker;
  } catch (error) {
    console.error("[CryptoWorker] Failed to create worker:", error);
    return null;
  }
};

export const CryptoWorker = {
  create: createCryptoWorker,
};
