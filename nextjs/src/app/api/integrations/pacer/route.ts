import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * PACER Integration API Routes
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations/pacer`);
}

export async function PUT(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations/pacer`);
}

export async function DELETE(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations/pacer`);
}
