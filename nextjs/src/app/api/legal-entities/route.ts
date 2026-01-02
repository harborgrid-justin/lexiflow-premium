import { NextRequest, NextResponse } from "next/server";

/**
 * Legal Entities API Routes
 * Migrated from: backend/src/legal-entities/legal-entities.controller.ts
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement JWT authentication
    // TODO: Connect to PostgreSQL database

    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get("entityType");
    const status = searchParams.get("status");
    const jurisdiction = searchParams.get("jurisdiction");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Mock legal entities
    let entities = [
      {
        id: "entity_1",
        name: "Acme Corporation",
        entityType: "CORPORATION",
        status: "ACTIVE",
        jurisdiction: "Delaware",
        ein: "12-3456789",
        registrationNumber: "DE-2021-001234",
        formationDate: "2021-03-15",
        address: {
          street: "123 Business Ave",
          city: "Wilmington",
          state: "DE",
          zipCode: "19801",
        },
      },
      {
        id: "entity_2",
        name: "Tech Innovations LLC",
        entityType: "LLC",
        status: "ACTIVE",
        jurisdiction: "California",
        ein: "98-7654321",
        registrationNumber: "CA-2022-567890",
        formationDate: "2022-07-20",
        address: {
          street: "456 Tech Blvd",
          city: "San Francisco",
          state: "CA",
          zipCode: "94105",
        },
      },
      {
        id: "entity_3",
        name: "Global Industries Inc.",
        entityType: "CORPORATION",
        status: "ACTIVE",
        jurisdiction: "New York",
        ein: "55-9876543",
        registrationNumber: "NY-2020-123456",
        formationDate: "2020-01-10",
        address: {
          street: "789 Corporate Dr",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
      },
    ];

    // Apply filters
    if (entityType) {
      entities = entities.filter((e) => e.entityType === entityType);
    }
    if (status) {
      entities = entities.filter((e) => e.status === status);
    }
    if (jurisdiction) {
      entities = entities.filter((e) => e.jurisdiction === jurisdiction);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      entities = entities.filter(
        (e) =>
          e.name.toLowerCase().includes(searchLower) ||
          e.ein?.includes(search) ||
          e.registrationNumber?.includes(search)
      );
    }

    const total = entities.length;
    const start = (page - 1) * limit;
    const paginatedEntities = entities.slice(start, start + limit);

    return NextResponse.json(
      {
        success: true,
        data: paginatedEntities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
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
    // TODO: Connect to PostgreSQL database
    // TODO: Validate entity data

    const body = await request.json();
    const { name, entityType, jurisdiction, ein, registrationNumber } = body;

    // Validate required fields
    if (!name || !entityType || !jurisdiction) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, entityType, jurisdiction",
        },
        { status: 400 }
      );
    }

    // Mock entity creation
    const entity = {
      id: `entity_${Date.now()}`,
      name,
      entityType,
      status: "ACTIVE",
      jurisdiction,
      ein,
      registrationNumber,
      formationDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: entity }, { status: 201 });
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
