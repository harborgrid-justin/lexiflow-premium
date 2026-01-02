import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Organizations by Jurisdiction API Route
 */

// GET /api/organizations/jurisdiction/[jurisdiction] - Get organizations by jurisdiction
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jurisdiction: string }> }
) {
  const { jurisdiction } = await context.params;
  return proxyToBackend(
    request,
    `/api/organizations/jurisdiction/${jurisdiction}`
  );
}
