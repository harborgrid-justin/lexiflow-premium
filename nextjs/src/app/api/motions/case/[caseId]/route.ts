import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/motions/case/:caseId - Get motions by case ID
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  return proxyToBackend(request, `/api/motions/case/${params.caseId}`);
}
