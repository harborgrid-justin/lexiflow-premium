/**
 * Health Check Module
 * System-wide health monitoring for 25+ microservices
 */

import { getApiBaseUrl } from "@/config/network/api.config";
import { ApiTimeoutError } from "@/services/core/errors";
import { HEALTH_CHECK_TIMEOUT, buildBaseURL, getOrigin } from "./config";
import { buildHeaders, buildURL } from "./request-builder";
import type { ServiceHealth, SystemHealth, ServiceHealthStatus } from "./types";

/**
 * Health check for backend server
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT),
    });
    return await response.json();
  } catch (error) {
    console.error("[HealthCheck.healthCheck] Error:", error);
    throw new ApiTimeoutError("/health", 5000);
  }
}

/**
 * Check health of a specific service endpoint
 */
export async function checkServiceHealth(endpoint: string): Promise<ServiceHealth> {
  const startTime = performance.now();
  const lastChecked = new Date().toISOString();

  try {
    const baseURL = buildBaseURL();
    const url = buildURL(baseURL, endpoint, getOrigin());

    const response = await fetch(url.toString(), {
      method: "HEAD",
      headers: await buildHeaders(),
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT),
    });

    const latency = Math.round(performance.now() - startTime);

    if (response.ok) {
      return {
        status: latency > 2000 ? "degraded" : "online",
        latency,
        lastChecked,
      };
    } else {
      return {
        status: "offline",
        latency,
        lastChecked,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error: unknown) {
    return {
      status: "offline",
      lastChecked,
      error: (error as Error).message || "Network error",
    };
  }
}

/**
 * Service endpoint definitions for health monitoring
 */
const SERVICE_ENDPOINTS = [
  { name: "cases", endpoint: "/cases" },
  { name: "docket", endpoint: "/docket" },
  { name: "documents", endpoint: "/documents" },
  { name: "evidence", endpoint: "/evidence" },
  { name: "billing", endpoint: "/billing/invoices" },
  { name: "users", endpoint: "/users" },
  { name: "pleadings", endpoint: "/pleadings" },
  { name: "motions", endpoint: "/motions" },
  { name: "parties", endpoint: "/parties" },
  { name: "clauses", endpoint: "/clauses" },
  { name: "calendar", endpoint: "/calendar" },
  { name: "trustAccounts", endpoint: "/billing/trust-accounts" },
  { name: "legalHolds", endpoint: "/legal-holds/health" },
  { name: "depositions", endpoint: "/depositions/health" },
  { name: "conflictChecks", endpoint: "/compliance/conflict-checks" },
  { name: "auditLogs", endpoint: "/audit-logs" },
  { name: "discovery", endpoint: "/discovery" },
  { name: "discoveryEvidence", endpoint: "/discovery/evidence" },
  { name: "compliance", endpoint: "/compliance" },
  { name: "tasks", endpoint: "/tasks" },
  { name: "reports", endpoint: "/reports" },
  { name: "hr", endpoint: "/hr" },
  { name: "workflow", endpoint: "/workflow/templates" },
  { name: "trial", endpoint: "/trial" },
  { name: "search", endpoint: "/search" },
  { name: "knowledge", endpoint: "/knowledge" },
  { name: "messenger", endpoint: "/messenger" },
  { name: "notifications", endpoint: "/notifications" },
  { name: "warRoom", endpoint: "/war-room/health" },
  { name: "webhooks", endpoint: "/webhooks/health" },
  { name: "versioning", endpoint: "/versioning/health" },
  { name: "sync", endpoint: "/sync/health" },
  { name: "queryWorkbench", endpoint: "/query-workbench/health" },
  { name: "schema", endpoint: "/schema/health" },
  { name: "monitoring", endpoint: "/monitoring/health" },
  { name: "ocr", endpoint: "/ocr/health" },
  { name: "risks", endpoint: "/risks/health" },
  { name: "pipelines", endpoint: "/pipelines/health" },
  { name: "production", endpoint: "/production/health" },
  { name: "processingJobs", endpoint: "/processing-jobs/health" },
  { name: "jurisdictions", endpoint: "/jurisdictions/health" },
  { name: "integrations", endpoint: "/integrations/health" },
  { name: "bluebook", endpoint: "/bluebook/health" },
  { name: "casePhases", endpoint: "/case-phases/health" },
  { name: "analytics", endpoint: "/analytics/health" },
  { name: "backups", endpoint: "/backups/health" },
  { name: "auth", endpoint: "/auth/health" },
];

/**
 * Check health of all backend services
 */
export async function checkSystemHealth(): Promise<SystemHealth> {
  const healthChecks = await Promise.allSettled(
    SERVICE_ENDPOINTS.map(async ({ name, endpoint }) => ({
      name,
      health: await checkServiceHealth(endpoint),
    }))
  );

  const services: { [key: string]: ServiceHealth } = {};
  let onlineCount = 0;
  let degradedCount = 0;
  let offlineCount = 0;

  healthChecks.forEach((result) => {
    if (result.status === "fulfilled") {
      const { name, health } = result.value;
      services[name] = health;

      if (health.status === "online") onlineCount++;
      else if (health.status === "degraded") degradedCount++;
      else if (health.status === "offline") offlineCount++;
    }
  });

  let overall: ServiceHealthStatus = "unknown";
  if (offlineCount === healthChecks.length) {
    overall = "offline";
  } else if (offlineCount > 0 || degradedCount > healthChecks.length / 2) {
    overall = "degraded";
  } else if (onlineCount === healthChecks.length) {
    overall = "online";
  } else {
    overall = "degraded";
  }

  return {
    overall,
    services,
    timestamp: new Date().toISOString(),
  };
}
