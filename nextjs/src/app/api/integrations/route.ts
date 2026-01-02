import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Integrations API Routes
 * Migrated from: backend/src/integrations/integrations.controller.ts
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations`);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations`);
}
