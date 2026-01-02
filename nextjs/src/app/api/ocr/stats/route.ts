import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/ocr/stats - Get OCR processing statistics
 * @headers Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/ocr/stats");
}
