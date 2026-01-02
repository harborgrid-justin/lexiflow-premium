import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/case-phases/:id - Get case phase by ID
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/case-phases/${params.id}`);
}

/**
 * PUT /api/case-phases/:id - Update case phase
 * @headers Authorization: Bearer <token>
 * @body { name?: string, status?: string, startDate?: string, expectedEndDate?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/case-phases/${params.id}`);
}

/**
 * DELETE /api/case-phases/:id - Delete case phase
 * @headers Authorization: Bearer <token>
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/case-phases/${params.id}`);
}
