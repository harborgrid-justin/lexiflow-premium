import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/parties - Retrieve all parties
 * @headers Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/parties");
}

/**
 * POST /api/parties - Create a new party
 * @headers Authorization: Bearer <token>
 * @body { caseId: string, name: string, type: string, role?: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/parties");
}
