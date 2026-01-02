import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Risks API Routes
 * Handles risk management with impact, probability, and heatmap analytics
 */

// GET /api/risks - Get all risks with filters
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/risks");
}

// POST /api/risks - Create a new risk
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/risks");
}
