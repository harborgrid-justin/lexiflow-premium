import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/cases/:caseId/phases - Get all phases for a case
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  return proxyToBackend(request, `/api/cases/${params.caseId}/phases`);
}

/**
 * POST /api/cases/:caseId/phases - Create new phase for a case
 * @headers Authorization: Bearer <token>
 * @body { name: string, status?: string, startDate?: string, expectedEndDate?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  return proxyToBackend(request, `/api/cases/${params.caseId}/phases`);
}
