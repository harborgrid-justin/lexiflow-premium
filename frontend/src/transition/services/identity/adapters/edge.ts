/**
 * Edge-safe identity verification
 * Uses Web Crypto API (no Node.js crypto module)
 */

export async function verifyTokenSignature(
  token: string,
  publicKey: string
): Promise<boolean> {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) {
      return false;
    }

    // Import public key
    const keyData = base64UrlDecode(publicKey);
    const cryptoKey = await crypto.subtle.importKey(
      "spki",
      keyData.buffer as ArrayBuffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Verify signature
    const data = new TextEncoder().encode(`${header}.${payload}`);
    const signatureData = base64UrlDecode(signature);

    return await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signatureData.buffer as ArrayBuffer,
      data
    );
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

function base64UrlDecode(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Padded = base64 + padding;

  const binary = atob(base64Padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}
