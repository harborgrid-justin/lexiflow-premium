import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/ocr/languages/:lang/check - Check if language is supported
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  return proxyToBackend(request, `/api/ocr/languages/${params.lang}/check`);
}
