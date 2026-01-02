import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/motions - Retrieve all motions
 * @headers Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/motions`);
}

/**
 * POST /api/motions - Create a new motion
 * @headers Authorization: Bearer <token>
 * @body { caseId: string, title: string, type: string, status?: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/motions`);
}
