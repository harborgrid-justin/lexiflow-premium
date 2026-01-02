import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * Calendar Integration API Routes
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations/calendar`);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations/calendar`);
}

export async function DELETE(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations/calendar`);
}
