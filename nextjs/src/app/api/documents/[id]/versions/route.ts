import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/documents/:id/versions - Get version history of a document
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(request, `/api/documents/${id}/versions`);
}

/**
 * POST /api/documents/:id/versions - Create a new version of a document
 * @headers Authorization: Bearer <token>
 * @body FormData with file, changeDescription, metadata
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(request, `/api/documents/${id}/versions`);
}
