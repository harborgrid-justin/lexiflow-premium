import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/ocr/progress/:jobId - Get OCR job progress
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  return proxyToBackend(request, `/api/ocr/progress/${params.jobId}`);
}
