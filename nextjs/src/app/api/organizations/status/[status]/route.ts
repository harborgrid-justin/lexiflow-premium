import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Organizations by Status API Route
 */

// GET /api/organizations/status/[status] - Get organizations by status
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ status: string }> }
) {
  const { status } = await context.params;
  return proxyToBackend(request, `/api/organizations/status/${status}`);
}
