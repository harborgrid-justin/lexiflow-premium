import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/cases/:caseId/team - Get team members for a case
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  return proxyToBackend(request, `/api/cases/${params.caseId}/team`);
}

/**
 * POST /api/cases/:caseId/team - Add a team member to a case
 * @headers Authorization: Bearer <token>
 * @body { userId: string, role: string, permissions: string[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  return proxyToBackend(request, `/api/cases/${params.caseId}/team`);
}
