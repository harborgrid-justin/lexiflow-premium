import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Bulk Task Update API Route
 */

// POST /api/tasks/bulk-update - Bulk update tasks
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/tasks/bulk-update");
}
