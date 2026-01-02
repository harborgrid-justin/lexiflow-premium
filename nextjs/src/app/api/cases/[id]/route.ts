import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Case Detail API Route Handler
 * GET /api/cases/[id] - Get specific case
 * PUT /api/cases/[id] - Update specific case
 * DELETE /api/cases/[id] - Delete specific case
 */

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend(request, `/api/cases/${id}`);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend(request, `/api/cases/${id}`);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend(request, `/api/cases/${id}`);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend(request, `/api/cases/${id}`);
}
