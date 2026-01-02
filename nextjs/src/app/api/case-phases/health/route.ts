import { NextResponse } from "next/server";

/**
 * GET /api/case-phases/health - Health check endpoint
 */
export async function GET() {
  try {
    return NextResponse.json(
      { status: "ok", service: "case-phases" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
