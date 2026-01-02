import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/matters - Retrieve all matters with pagination and filters
 * @headers Authorization: Bearer <token>
 * @query page, pageSize, status, matterType, priority, clientId, leadAttorneyId, search
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/matters");
}

/**
 * POST /api/matters - Create new matter
 * @headers Authorization: Bearer <token>
 * @body { title, matterType, clientId, leadAttorneyId, description?, priority? }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/matters");
}
