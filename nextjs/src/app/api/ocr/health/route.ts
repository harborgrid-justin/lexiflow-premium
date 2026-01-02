import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/ocr/health - Health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        status: "ok",
        service: "ocr",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
