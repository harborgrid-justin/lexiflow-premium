import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Client Cases API Route
 * Get all cases associated with a client
 */

// GET /api/clients/[id]/cases - Get client cases
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/clients/${id}/cases`);
}
