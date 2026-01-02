import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Calendar Event Completion API Route
 */

// PUT /api/calendar/[id]/complete - Mark event as complete
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/calendar/${id}/complete`);
}
