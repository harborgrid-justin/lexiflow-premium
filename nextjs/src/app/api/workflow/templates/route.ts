import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Workflow Templates API Routes
 * Handles workflow template management and instantiation
 */

// GET /api/workflow/templates - Get all workflow templates
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/workflow/templates");
}

// POST /api/workflow/templates - Create workflow template
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/workflow/templates");
}
