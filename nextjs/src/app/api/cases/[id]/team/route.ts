import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/cases/:id/team - Get team members for a case
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(request, `/api/cases/${id}/team`);
}

/**
 * POST /api/cases/:id/team - Add a team member to a case
 * @headers Authorization: Bearer <token>
 * @body { userId: string, role: string, permissions: string[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(request, `/api/cases/${id}/team`);
}
