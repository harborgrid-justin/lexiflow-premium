import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Integration Detail Routes
 * Migrated from: backend/src/integrations/integrations.controller.ts
 */

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  return proxyToBackend(request, `/api/integrations/${id}`);
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  return proxyToBackend(request, `/api/integrations/${id}`);
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  return proxyToBackend(request, `/api/integrations/${id}`);
}
