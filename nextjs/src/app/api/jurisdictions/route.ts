import { NextRequest, NextResponse } from "next/server";

/**
 * Jurisdictions API Routes
 * Migrated from: backend/src/jurisdictions/jurisdictions.controller.ts
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement JWT authentication
    // TODO: Connect to PostgreSQL database

    const searchParams = request.nextUrl.searchParams;
    const system = searchParams.get("system"); // FEDERAL, STATE, REGULATORY, INTERNATIONAL
    const search = searchParams.get("search");

    // Mock jurisdictions data
    const allJurisdictions = [
      {
        id: "jur_1",
        name: "United States District Court for the Southern District of New York",
        system: "FEDERAL",
        code: "SDNY",
        type: "District Court",
        location: "New York, NY",
        pacerCourtId: "nysd",
      },
      {
        id: "jur_2",
        name: "United States Court of Appeals for the Ninth Circuit",
        system: "FEDERAL",
        code: "9th Cir.",
        type: "Circuit Court",
        location: "San Francisco, CA",
        pacerCourtId: "ca9",
      },
      {
        id: "jur_3",
        name: "California Superior Court",
        system: "STATE",
        code: "CA-SUP",
        type: "Superior Court",
        location: "California",
        state: "CA",
      },
      {
        id: "jur_4",
        name: "Securities and Exchange Commission",
        system: "REGULATORY",
        code: "SEC",
        type: "Federal Agency",
        location: "Washington, DC",
      },
    ];

    let filtered = allJurisdictions;

    if (system) {
      filtered = filtered.filter((j) => j.system === system);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.name.toLowerCase().includes(searchLower) ||
          j.code.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(
      { success: true, data: filtered },
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

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement JWT authentication
    // TODO: Verify user has ADMIN role
    // TODO: Connect to PostgreSQL database

    const body = await request.json();
    const { name, system, code, type, location } = body;

    // Validate required fields
    if (!name || !system || !code) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, system, code",
        },
        { status: 400 }
      );
    }

    // Mock jurisdiction creation
    const jurisdiction = {
      id: `jur_${Date.now()}`,
      name,
      system,
      code,
      type,
      location,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: jurisdiction },
      { status: 201 }
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
