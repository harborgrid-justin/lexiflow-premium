import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Request } from "express";
import * as crypto from "crypto";
import {
  FINGERPRINT_HASH_ALGORITHM,
  FINGERPRINT_SALT_LENGTH,
  FINGERPRINT_COMPONENTS,
  SESSION_FINGERPRINT_MISMATCH_THRESHOLD,
} from "@security/constants/security.constants";

export interface FingerprintData {
  fingerprint: string;
  components: FingerprintComponents;
  timestamp: number;
}

export interface FingerprintComponents {
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  ip: string;
  platform?: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  mismatchCount: number;
  changedComponents: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
}

/**
 * Request Fingerprint Service
 * Generates unique fingerprints for client requests
 * Detects session hijacking attempts through device consistency tracking
 */
/**
 * ╔=================================================================================================================╗
 * ║REQUESTFINGERPRINT                                                                                               ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class RequestFingerprintService implements OnModuleDestroy {
  private readonly logger = new Logger(RequestFingerprintService.name);
  private readonly fingerprintCache = new Map<string, FingerprintData>();
  // Reserved for future LRU cache size enforcement
  // private readonly MAX_CACHE_SIZE = 10000;
  // Reserved for future TTL-based cleanup
  // private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(
      () => this.cleanupCache(),
      60 * 60 * 1000
    );
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
    this.fingerprintCache.clear();
  }

  /**
   * Extract fingerprint components from request
   */
  private extractComponents(req: Request): FingerprintComponents {
    return {
      userAgent: req.headers["user-agent"] || "unknown",
      acceptLanguage: req.headers["accept-language"] || "unknown",
      acceptEncoding: req.headers["accept-encoding"] || "unknown",
      ip: this.extractClientIp(req),
      platform: this.extractPlatform(req),
    };
  }

  /**
   * Extract client IP address from request
   * Handles proxy headers and forwarded IPs
   */
  private extractClientIp(req: Request): string {
    // Check X-Forwarded-For header (proxy/load balancer)
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      // Take the first IP if multiple are present
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      if (ips) {
        return ips.split(",")[0]?.trim() || "unknown";
      }
    }

    // Check X-Real-IP header (nginx)
    const realIp = req.headers["x-real-ip"];
    if (realIp) {
      return (Array.isArray(realIp) ? realIp[0] : realIp) || "unknown";
    }

    // Check CF-Connecting-IP (Cloudflare)
    const cfIp = req.headers["cf-connecting-ip"];
    if (cfIp) {
      return (Array.isArray(cfIp) ? cfIp[0] : cfIp) || "unknown";
    }

    // Fallback to connection remote address
    return req.ip || req.socket.remoteAddress || "unknown";
  }

  /**
   * Extract platform from user agent
   */
  private extractPlatform(req: Request): string {
    const userAgent = (req.headers["user-agent"] || "").toLowerCase();

    if (userAgent.includes("windows")) return "windows";
    if (userAgent.includes("mac")) return "macos";
    if (userAgent.includes("linux")) return "linux";
    if (userAgent.includes("android")) return "android";
    if (userAgent.includes("iphone") || userAgent.includes("ipad"))
      return "ios";

    return "unknown";
  }

  /**
   * Generate a unique fingerprint from request components
   */
  generateFingerprint(req: Request, salt?: string): FingerprintData {
    const components = this.extractComponents(req);

    // Combine components into a single string
    const componentString = [
      components.userAgent,
      components.acceptLanguage,
      components.acceptEncoding,
      components.ip,
      components.platform || "",
    ].join("|");

    // Add salt for additional security
    const fingerprintSalt =
      salt || crypto.randomBytes(FINGERPRINT_SALT_LENGTH).toString("hex");
    const dataToHash = `${componentString}|${fingerprintSalt}`;

    // Generate hash
    const hash = crypto
      .createHash(FINGERPRINT_HASH_ALGORITHM)
      .update(dataToHash)
      .digest("hex");

    const fingerprint = `${fingerprintSalt}:${hash}`;

    const fingerprintData: FingerprintData = {
      fingerprint,
      components,
      timestamp: Date.now(),
    };

    // Cache the fingerprint
    this.fingerprintCache.set(fingerprint, fingerprintData);

    return fingerprintData;
  }

  /**
   * Verify a fingerprint against a request
   */
  verifyFingerprint(req: Request, storedFingerprint: string): boolean {
    try {
      // Extract salt from stored fingerprint
      const [salt] = storedFingerprint.split(":");

      // Generate fingerprint with the same salt
      const current = this.generateFingerprint(req, salt);

      // Compare fingerprints using timing-safe comparison
      return this.secureCompare(current.fingerprint, storedFingerprint);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Fingerprint verification failed: ${err.message}`,
        err.stack
      );
      return false;
    }
  }

  /**
   * Validate session consistency by comparing fingerprints
   */
  validateSessionConsistency(
    req: Request,
    storedFingerprint: string
  ): SessionValidationResult {
    const currentData = this.generateFingerprint(req);
    const storedData = this.fingerprintCache.get(storedFingerprint);

    if (!storedData) {
      // If we don't have cached data, recreate it from stored fingerprint
      return this.validateAgainstStoredFingerprint(
        currentData,
        storedFingerprint
      );
    }

    const changedComponents: string[] = [];
    let mismatchCount = 0;

    // Compare each component
    for (const component of FINGERPRINT_COMPONENTS) {
      const currentValue = currentData.components[component];
      const storedValue = storedData.components[component];

      if (currentValue !== storedValue) {
        changedComponents.push(component);
        mismatchCount++;
      }
    }

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(changedComponents, mismatchCount);

    return {
      isValid: mismatchCount <= SESSION_FINGERPRINT_MISMATCH_THRESHOLD,
      mismatchCount,
      changedComponents,
      riskLevel,
    };
  }

  /**
   * Validate against stored fingerprint when cached data is unavailable
   */
  private validateAgainstStoredFingerprint(
    currentData: FingerprintData,
    storedFingerprint: string
  ): SessionValidationResult {
    const [salt] = storedFingerprint.split(":");

    // Recreate fingerprint with stored salt
    const componentString = [
      currentData.components.userAgent,
      currentData.components.acceptLanguage,
      currentData.components.acceptEncoding,
      currentData.components.ip,
      currentData.components.platform || "",
    ].join("|");

    const dataToHash = `${componentString}|${salt}`;
    const hash = crypto
      .createHash(FINGERPRINT_HASH_ALGORITHM)
      .update(dataToHash)
      .digest("hex");

    const recreatedFingerprint = `${salt}:${hash}`;
    const isValid = this.secureCompare(recreatedFingerprint, storedFingerprint);

    return {
      isValid,
      mismatchCount: isValid ? 0 : 1,
      changedComponents: isValid ? [] : ["fingerprint"],
      riskLevel: isValid ? "low" : "critical",
    };
  }

  /**
   * Calculate risk level based on changed components
   */
  private calculateRiskLevel(
    changedComponents: string[],
    mismatchCount: number
  ): "low" | "medium" | "high" | "critical" {
    if (mismatchCount === 0) return "low";

    // IP change is the most critical indicator of session hijacking
    if (changedComponents.includes("ip")) {
      return "critical";
    }

    // User agent change is highly suspicious
    if (changedComponents.includes("userAgent")) {
      return "high";
    }

    // Multiple component changes
    if (mismatchCount >= 3) {
      return "high";
    }

    // Single non-critical component change
    if (mismatchCount === 1) {
      return "low";
    }

    return "medium";
  }

  /**
   * Detect potential session hijacking
   */
  detectSessionHijacking(req: Request, storedFingerprint: string): boolean {
    const validation = this.validateSessionConsistency(req, storedFingerprint);

    if (
      validation.riskLevel === "critical" ||
      validation.riskLevel === "high"
    ) {
      this.logger.warn("Potential session hijacking detected", {
        riskLevel: validation.riskLevel,
        changedComponents: validation.changedComponents,
        ip: this.extractClientIp(req),
      });

      return true;
    }

    return false;
  }

  /**
   * Generate device identifier (more stable than full fingerprint)
   */
  generateDeviceId(req: Request): string {
    const userAgent = req.headers["user-agent"] || "unknown";
    const platform = this.extractPlatform(req);

    // Create a hash of stable device characteristics
    const deviceString = `${userAgent}|${platform}`;
    return crypto
      .createHash(FINGERPRINT_HASH_ALGORITHM)
      .update(deviceString)
      .digest("hex");
  }

  /**
   * Check if request is from the same device
   */
  isSameDevice(req: Request, storedDeviceId: string): boolean {
    const currentDeviceId = this.generateDeviceId(req);
    return this.secureCompare(currentDeviceId, storedDeviceId);
  }

  /**
   * Get fingerprint metadata for logging/auditing
   */
  getFingerprintMetadata(req: Request): {
    ip: string;
    userAgent: string;
    platform: string | undefined;
    deviceId: string;
    acceptLanguage: string;
    timestamp: string;
  } {
    const components = this.extractComponents(req);
    const deviceId = this.generateDeviceId(req);

    return {
      ip: components.ip,
      userAgent: components.userAgent,
      platform: components.platform,
      deviceId,
      acceptLanguage: components.acceptLanguage,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private secureCompare(a: string, b: string): boolean {
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
   * Clean up old fingerprints from cache
   */
  private cleanupCache(maxAge = 86400000): void {
    // Default max age: 24 hours
    const now = Date.now();
    let cleaned = 0;

    for (const [fingerprint, data] of this.fingerprintCache.entries()) {
      if (now - data.timestamp > maxAge) {
        this.fingerprintCache.delete(fingerprint);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} old fingerprints from cache`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; oldestEntry: number; newestEntry: number } {
    const entries = Array.from(this.fingerprintCache.values());

    if (entries.length === 0) {
      return { size: 0, oldestEntry: 0, newestEntry: 0 };
    }

    const timestamps = entries.map((e) => e.timestamp);

    return {
      size: this.fingerprintCache.size,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    };
  }

  /**
   * Extract browser information from user agent
   */
  extractBrowserInfo(req: Request): {
    browser: string;
    version: string;
    mobile: boolean;
  } {
    const userAgent = req.headers["user-agent"] || "";

    let browser = "unknown";
    let version = "unknown";
    let mobile = false;

    // Detect browser
    if (userAgent.includes("Chrome")) {
      browser = "Chrome";
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match?.[1] || "unknown";
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match?.[1] || "unknown";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browser = "Safari";
      const match = userAgent.match(/Version\/(\d+)/);
      version = match?.[1] || "unknown";
    } else if (userAgent.includes("Edge")) {
      browser = "Edge";
      const match = userAgent.match(/Edge\/(\d+)/);
      version = match?.[1] || "unknown";
    }

    // Detect mobile
    mobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);

    return { browser, version, mobile };
  }

  /**
   * Create a comprehensive request signature for auditing
   */
  createRequestSignature(req: Request): string {
    const components = this.extractComponents(req);
    const browserInfo = this.extractBrowserInfo(req);

    const signature = {
      ip: components.ip,
      userAgent: components.userAgent,
      platform: components.platform,
      browser: browserInfo.browser,
      browserVersion: browserInfo.version,
      mobile: browserInfo.mobile,
      language: components.acceptLanguage,
      timestamp: Date.now(),
    };

    // Create a hash of the signature
    return crypto
      .createHash(FINGERPRINT_HASH_ALGORITHM)
      .update(JSON.stringify(signature))
      .digest("hex");
  }

  /**
   * Check if IP address has changed significantly (different subnet)
   */
  isIpChangedSignificantly(currentIp: string, storedIp: string): boolean {
    // For IPv4, compare first 3 octets (class C subnet)
    const currentParts = currentIp.split(".");
    const storedParts = storedIp.split(".");

    if (currentParts.length === 4 && storedParts.length === 4) {
      // Compare first 3 octets
      return (
        currentParts[0] !== storedParts[0] ||
        currentParts[1] !== storedParts[1] ||
        currentParts[2] !== storedParts[2]
      );
    }

    // For IPv6 or other formats, consider any change as significant
    return currentIp !== storedIp;
  }
}
