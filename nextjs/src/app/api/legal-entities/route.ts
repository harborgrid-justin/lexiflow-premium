import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * Legal Entities API Routes
 * Migrated from: backend/src/legal-entities/legal-entities.controller.ts
 */

/**
 * GET /api/legal-entities - Get all legal entities
 * @query entityType?: string
 * @query status?: string
 * @query jurisdiction?: string
 * @query search?: string
 * @query page?: number
 * @query limit?: number
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/legal-entities`);
}

/**
 * POST /api/legal-entities - Create a new legal entity
 * @body { name, entityType, jurisdiction, ein, registrationNumber, ... }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/legal-entities`);
}
