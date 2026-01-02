import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/ocr/detect-language - Detect language from text or document
 * @headers Authorization: Bearer <token>
 * @body { text?: string, documentId?: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/ocr/detect-language");
}
