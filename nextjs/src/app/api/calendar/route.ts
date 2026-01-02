import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Calendar API Routes
 * Handles calendar events, deadlines, and scheduling
 */

// GET /api/calendar - Get all calendar events
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/calendar");
}

// POST /api/calendar - Create calendar event
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/calendar");
}
