import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/jurisdictions/state
 * Get state court jurisdictions
 * Migrated from: backend/src/jurisdictions/jurisdictions.controller.ts
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement JWT authentication
    // TODO: Connect to PostgreSQL database

    const searchParams = request.nextUrl.searchParams;
    const stateFilter = searchParams.get("state");

    // Mock state courts
    let stateCourts = [
      {
        id: "jur_state_1",
        name: "California Superior Court",
        system: "STATE",
        code: "CA-SUP",
        type: "Superior Court",
        state: "CA",
        location: "California",
      },
      {
        id: "jur_state_2",
        name: "New York Supreme Court",
        system: "STATE",
        code: "NY-SUP",
        type: "Supreme Court",
        state: "NY",
        location: "New York",
      },
      {
        id: "jur_state_3",
        name: "Texas District Court",
        system: "STATE",
        code: "TX-DIST",
        type: "District Court",
        state: "TX",
        location: "Texas",
      },
      {
        id: "jur_state_4",
        name: "Florida Circuit Court",
        system: "STATE",
        code: "FL-CIR",
        type: "Circuit Court",
        state: "FL",
        location: "Florida",
      },
    ];

    if (stateFilter) {
      stateCourts = stateCourts.filter((c) => c.state === stateFilter);
    }

    return NextResponse.json(
      { success: true, data: stateCourts },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
