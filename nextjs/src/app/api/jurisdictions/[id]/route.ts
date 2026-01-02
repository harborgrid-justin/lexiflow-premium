import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Jurisdiction Detail Routes
 * Migrated from: backend/src/jurisdictions/jurisdictions.controller.ts
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/jurisdictions/${params.id}`);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/jurisdictions/${params.id}`);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/jurisdictions/${params.id}`);
}
