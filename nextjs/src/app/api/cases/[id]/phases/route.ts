import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/cases/:id/phases - Get all phases for a case
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(request, `/api/cases/${id}/phases`);
}

/**
 * POST /api/cases/:id/phases - Create new phase for a case
 * @headers Authorization: Bearer <token>
 * @body { name: string, status?: string, startDate?: string, expectedEndDate?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(request, `/api/cases/${id}/phases`);
}
