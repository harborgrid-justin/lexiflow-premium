import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Mark All Notifications as Read API Route
 */

// PUT /api/notifications/mark-all-read - Mark all notifications as read for user
export async function PUT(request: NextRequest) {
  return proxyToBackend(request, "/api/notifications/mark-all-read");
}
