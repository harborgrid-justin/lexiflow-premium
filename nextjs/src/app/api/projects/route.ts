import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Projects API Routes
 * Handles project management with filtering and status tracking
 */

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/projects");
}

// POST /api/projects - Create project
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/projects");
}
