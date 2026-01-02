import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/documents/:id/ocr - Trigger OCR processing for a document
 * @headers Authorization: Bearer <token>
 * @body { languages?: string[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/api/documents/${params.id}/ocr`);
}
