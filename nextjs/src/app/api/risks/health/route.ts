import { NextRequest, NextResponse } from "next/server";

/**
 * Risk Health Check API Route
 */

// GET /api/risks/health - Health check
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      { status: "ok", service: "risks" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
