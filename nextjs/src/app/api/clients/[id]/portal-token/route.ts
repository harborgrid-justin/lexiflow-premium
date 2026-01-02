import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Client Portal Token API Route
 * Generate access token for client portal
 */

// POST /api/clients/[id]/portal-token - Generate client portal access token
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/clients/${id}/portal-token`);
}
