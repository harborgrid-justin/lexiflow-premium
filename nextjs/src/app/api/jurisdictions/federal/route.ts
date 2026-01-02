import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/jurisdictions/federal
 * Get federal court jurisdictions
 * Migrated from: backend/src/jurisdictions/jurisdictions.controller.ts
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement JWT authentication
    // TODO: Connect to PostgreSQL database

    // Mock federal courts
    const federalCourts = [
      {
        id: "jur_fed_1",
        name: "United States District Court for the Southern District of New York",
        system: "FEDERAL",
        code: "SDNY",
        type: "District Court",
        circuit: "2nd Circuit",
        location: "New York, NY",
        pacerCourtId: "nysd",
      },
      {
        id: "jur_fed_2",
        name: "United States District Court for the Northern District of California",
        system: "FEDERAL",
        code: "NDCA",
        type: "District Court",
        circuit: "9th Circuit",
        location: "San Francisco, CA",
        pacerCourtId: "cand",
      },
      {
        id: "jur_fed_3",
        name: "United States Court of Appeals for the Ninth Circuit",
        system: "FEDERAL",
        code: "9th Cir.",
        type: "Circuit Court",
        location: "San Francisco, CA",
        pacerCourtId: "ca9",
      },
      {
        id: "jur_fed_4",
        name: "United States Supreme Court",
        system: "FEDERAL",
        code: "SCOTUS",
        type: "Supreme Court",
        location: "Washington, DC",
      },
    ];

    return NextResponse.json(
      { success: true, data: federalCourts },
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
