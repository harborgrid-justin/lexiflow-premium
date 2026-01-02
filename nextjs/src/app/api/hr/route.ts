import { NextRequest, NextResponse } from "next/server";

/**
 * HR Module API Routes
 * Handles employee management, time off requests, and utilization tracking
 */

// GET /api/hr - Health check
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement authentication check
    return NextResponse.json({ status: "ok", service: "hr" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
