import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/documents/:documentId/versions - Get version history of a document
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  return proxyToBackend(
    request,
    `/api/documents/${params.documentId}/versions`
  );
}

/**
 * POST /api/documents/:documentId/versions - Create a new version of a document
 * @headers Authorization: Bearer <token>
 * @body FormData with file, changeDescription, metadata
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  return proxyToBackend(
    request,
    `/api/documents/${params.documentId}/versions`
  );
}
