import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Time Off Denial API Route
 */

// POST /api/hr/time-off/[id]/deny - Deny time off request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/hr/time-off/${params.id}/deny`);
}
