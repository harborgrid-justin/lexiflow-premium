import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/documents/:documentId/versions/compare - Compare two versions
 * @headers Authorization: Bearer <token>
 * @query v1, v2 - Version numbers to compare
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  return proxyToBackend(
    request,
    `/api/documents/${params.documentId}/versions/compare`
  );
}
