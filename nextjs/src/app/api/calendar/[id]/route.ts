import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Individual Calendar Event API Routes
 */

// GET /api/calendar/[id] - Get calendar event by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/calendar/${id}`);
}

// PUT /api/calendar/[id] - Update calendar event
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/calendar/${id}`);
}

// DELETE /api/calendar/[id] - Delete calendar event
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/calendar/${id}`);
}
