import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Clients API Routes
 * Handles client management and portal access
 */

// GET /api/clients - Get all clients
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/clients");
}

// POST /api/clients - Create client
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/clients");
}
