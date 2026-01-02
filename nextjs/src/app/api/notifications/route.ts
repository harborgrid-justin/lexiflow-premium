import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Notifications API Routes
 * Handles system notifications and alerts
 */

// GET /api/notifications - Get all notifications
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/notifications");
}

// POST /api/notifications - Create notification
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/notifications");
}
