import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/ocr/batch - Process multiple documents in batch
 * @headers Authorization: Bearer <token>
 * @body { documentIds: string[], languages?: string[], options?: object }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/ocr/batch");
}
