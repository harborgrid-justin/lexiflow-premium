import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/parties/case/:caseId - Get parties by case ID
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  return proxyToBackend(request, `/parties/case/${params.caseId}`);
}
