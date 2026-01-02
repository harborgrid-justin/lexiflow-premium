import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/documents/:id/redact - Create redaction job for a document
 * @headers Authorization: Bearer <token>
 * @body { patterns?: string[], areas?: object[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/api/documents/${params.id}/redact`);
}
