import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Tasks API Routes
 * Handles task management with filtering, assignment, and status tracking
 */

// GET /api/tasks - Get all tasks with filters
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/tasks");
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/tasks");
}
