import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/matters/pipeline - Get intake pipeline stages
 * @headers Authorization: Bearer <token>
 * @query dateRange (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get("dateRange");

    // TODO: Fetch pipeline data from database

    return NextResponse.json(
      {
        data: [
          {
            stage: "initial_contact",
            count: 12,
            value: 450000,
          },
          {
            stage: "conflict_check",
            count: 8,
            value: 320000,
          },
          {
            stage: "engagement",
            count: 5,
            value: 180000,
          },
          {
            stage: "active",
            count: 32,
            value: 1250000,
          },
        ],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch pipeline" },
      { status: 500 }
    );
  }
}
