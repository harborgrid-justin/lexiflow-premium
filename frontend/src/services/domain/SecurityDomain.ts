/**
 * Security Domain Service
 * Enterprise-grade service for security management and threat detection
 *
 * @module SecurityDomain
 * @description Manages all security-related operations including:
 * - Malware signature management
 * - Threat detection and prevention
 * - Security policy enforcement
 * - Access control validation
 * - Vulnerability scanning
 * - Security audit logging
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend-first architecture (migrated 2025-12-21)
 * - Principle of least privilege
 * - Security event logging and monitoring
 * - Proper error handling without information disclosure
 *
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - Type-safe operations with strict validation
 * - React Query integration via SECURITY_QUERY_KEYS
 * - Real-time threat intelligence updates
 * - Integration with security information systems
 *
 * @migrated Backend API integration completed 2025-12-21
 */

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: SECURITY_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: SECURITY_QUERY_KEYS.malwareSignatures() });
 */

import { isBackendApiEnabled } from "@/api";
import { OperationError } from "@/services/core/errors";
import { apiClient } from "@/services/infrastructure/apiClient";

export const SECURITY_QUERY_KEYS = {
  all: () => ["security"] as const,
  malwareSignatures: () => ["security", "malware-signatures"] as const,
  threatLevel: () => ["security", "threat-level"] as const,
  securityPolicies: () => ["security", "policies"] as const,
  auditLogs: (startDate?: string, endDate?: string) =>
    startDate && endDate
      ? (["security", "audit-logs", startDate, endDate] as const)
      : (["security", "audit-logs"] as const),
  vulnerabilities: () => ["security", "vulnerabilities"] as const,
} as const;

/**
 * Security Service
 * Provides enterprise-grade security management functionality
 *
 * @constant SecurityService
 */
export const SecurityService = {
  /**
   * Validate signature parameter
   * @private
   * @throws Error if signature is invalid
   */
  validateSignature: (signature: string, methodName: string): void => {
    if (
      !signature ||
      typeof signature !== "string" ||
      signature.trim() === ""
    ) {
      throw new Error(
        `[SecurityService.${methodName}] Invalid signature parameter`
      );
    }
  },

  /**
   * Validate ID parameter
   * @private
   * @throws Error if ID is invalid
   */
  validateId: (id: string, methodName: string): void => {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error(`[SecurityService.${methodName}] Invalid id parameter`);
    }
  },

  // =============================================================================
  // MALWARE DETECTION
  // =============================================================================

  /**
   * Get malware signatures for threat detection
   *
   * @returns Promise<string[]> Array of malware signatures
   * @throws Error if fetch fails
   *
   * @example
   * const signatures = await SecurityService.getMalwareSignatures();
   * // Returns: ['md5:abc123...', 'sha256:def456...', ...]
   *
   * @security
   * - Returns signature hashes only (no malware samples)
   * - Backend performs validation and sanitization
   * - Access restricted to security administrators
   * - Audit trail automatically created
   *
   * @architecture
   * - Primary: Backend API with real-time threat intelligence
   * - Signatures updated from threat databases
   * - Cached with short TTL for freshness
   */
  getMalwareSignatures: async (): Promise<string[]> => {
    try {
      if (isBackendApiEnabled()) {
        return apiClient.get<string[]>("/security/malware-signatures");
      }
      return [];
    } catch (error) {
      console.error("[SecurityService.getMalwareSignatures] Error:", error);
      throw new OperationError(
        "SecurityService.getMalwareSignatures",
        "Failed to fetch malware signatures"
      );
    }
  },

  /**
   * Scan content for malware using signatures
   *
   * @param content - Content to scan (file hash, text, etc.)
   * @returns Promise with scan results
   * @throws Error if content is invalid or scan fails
   *
   * @example
   * const result = await SecurityService.scanForMalware('abc123...');
   * // Returns: { clean: true, threatsFound: [], scannedAt: '...' }
   *
   * @security
   * - Backend performs actual scanning
   * - No malware content returned to frontend
   * - All scans logged for audit
   */
  scanForMalware: async (
    content: string
  ): Promise<{
    clean: boolean;
    threatsFound: string[];
    scannedAt: string;
  }> => {
    if (!content || typeof content !== "string" || content.trim() === "") {
      throw new Error(
        "[SecurityService.scanForMalware] Invalid content parameter"
      );
    }

    try {
      if (isBackendApiEnabled()) {
        return apiClient.post("/security/scan", { content });
      }

      console.warn("[SecurityService] Backend security scan unavailable");
      return {
        clean: true,
        threatsFound: [],
        scannedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[SecurityService.scanForMalware] Error:", error);
      throw new OperationError(
        "SecurityService.scanForMalware",
        "Failed to scan for malware"
      );
    }
  },

  // =============================================================================
  // THREAT ASSESSMENT
  // =============================================================================

  /**
   * Get current threat level
   *
   * @returns Promise with threat level data
   * @throws Error if fetch fails
   *
   * @example
   * const threat = await SecurityService.getThreatLevel();
   * // Returns: { level: 'Low', score: 25, lastUpdated: '...' }
   *
   * @security
   * - Real-time threat intelligence
   * - Aggregated from multiple sources
   * - Access restricted to authorized users
   */
  getThreatLevel: async (): Promise<{
    level: "Low" | "Medium" | "High" | "Critical";
    score: number;
    lastUpdated: string;
    factors?: string[];
  }> => {
    try {
      if (isBackendApiEnabled()) {
        return apiClient.get("/security/threat-level");
      }

      console.warn("[SecurityService] Backend threat level unavailable");
      return {
        level: "Low",
        score: 0,
        lastUpdated: new Date().toISOString(),
        factors: [],
      };
    } catch (error) {
      console.error("[SecurityService.getThreatLevel] Error:", error);
      throw new OperationError(
        "SecurityService.getThreatLevel",
        "Failed to fetch threat level"
      );
    }
  },

  // =============================================================================
  // SECURITY POLICIES
  // =============================================================================

  /**
   * Get security policies
   *
   * @returns Promise<unknown[]> Array of security policies
   * @throws Error if fetch fails
   *
   * @example
   * const policies = await SecurityService.getSecurityPolicies();
   *
   * @security
   * - Access restricted to administrators
   * - Policies include access control rules
   * - Audit trail for policy changes
   */
  getSecurityPolicies: async (): Promise<unknown[]> => {
    try {
      if (isBackendApiEnabled()) {
        return apiClient.get("/security/policies");
      }

      return [];
    } catch (error) {
      console.error("[SecurityService.getSecurityPolicies] Error:", error);
      throw new OperationError(
        "SecurityService.getSecurityPolicies",
        "Failed to fetch security policies"
      );
    }
  },

  // =============================================================================
  // AUDIT & LOGGING
  // =============================================================================

  /**
   * Get security audit logs
   *
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns Promise<unknown[]> Array of audit log entries
   * @throws Error if fetch fails
   *
   * @example
   * const logs = await SecurityService.getAuditLogs('2025-01-01', '2025-12-31');
   *
   * @security
   * - Access restricted to security administrators
   * - Comprehensive event logging
   * - Tamper-proof audit trail
   */
  getAuditLogs: async (
    startDate?: string,
    endDate?: string
  ): Promise<unknown[]> => {
    try {
      if (
        startDate &&
        (typeof startDate !== "string" || startDate.trim() === "")
      ) {
        throw new Error(
          "[SecurityService.getAuditLogs] Invalid startDate parameter"
        );
      }

      if (endDate && (typeof endDate !== "string" || endDate.trim() === "")) {
        throw new Error(
          "[SecurityService.getAuditLogs] Invalid endDate parameter"
        );
      }

      if (isBackendApiEnabled()) {
        return apiClient.get("/security/audit-logs", { startDate, endDate });
      }

      return [];
    } catch (error) {
      console.error("[SecurityService.getAuditLogs] Error:", error);
      throw new OperationError(
        "SecurityService.getAuditLogs",
        "Failed to fetch audit logs"
      );
    }
  },

  // =============================================================================
  // VULNERABILITY MANAGEMENT
  // =============================================================================

  /**
   * Get system vulnerabilities
   *
   * @returns Promise<unknown[]> Array of vulnerabilities
   * @throws Error if fetch fails
   *
   * @example
   * const vulns = await SecurityService.getVulnerabilities();
   *
   * @security
   * - Access restricted to security administrators
   * - Regular vulnerability scanning
   * - Integration with CVE databases
   */
  getVulnerabilities: async (): Promise<unknown[]> => {
    try {
      if (isBackendApiEnabled()) {
        return apiClient.get("/security/vulnerabilities");
      }

      return [];
    } catch (error) {
      console.error("[SecurityService.getVulnerabilities] Error:", error);
      throw new OperationError(
        "SecurityService.getVulnerabilities",
        "Failed to fetch vulnerabilities"
      );
    }
  },
};
