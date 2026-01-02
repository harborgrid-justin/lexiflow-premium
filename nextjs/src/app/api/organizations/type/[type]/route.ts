import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Organizations by Type API Route
 */

// GET /api/organizations/type/[type] - Get organizations by type
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  const { type } = await context.params;
  return proxyToBackend(request, `/api/organizations/type/${type}`);
}
