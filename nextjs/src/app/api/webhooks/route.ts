import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Webhooks API Routes
 * Migrated from: backend/src/webhooks/webhooks.controller.ts
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/webhooks`);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/webhooks`);
}
