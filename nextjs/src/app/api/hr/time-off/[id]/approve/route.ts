import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Time Off Approval API Route
 */

// POST /api/hr/time-off/[id]/approve - Approve time off request
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/api/hr/time-off/${params.id}/approve`);
}
