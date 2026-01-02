import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/ocr/extract/:documentId - Extract structured data from document
 * @headers Authorization: Bearer <token>
 * @body { extractTables?: boolean, extractImages?: boolean, languages?: string[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  return proxyToBackend(request, `/api/ocr/extract/${params.documentId}`);
}
