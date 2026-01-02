import { NextRequest, NextResponse } from "next/server";

/**
 * Integrations API Routes
 * Migrated from: backend/src/integrations/integrations.controller.ts
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement JWT authentication
    // TODO: Connect to PostgreSQL database

    // Mock integrations list
    const integrations = [
      {
        id: "int_1",
        name: "PACER Integration",
        type: "pacer",
        status: "connected",
        description: "Federal court case docket retrieval",
        enabled: true,
        lastSync: new Date(Date.now() - 3600000).toISOString(),
        config: {
          autoSync: true,
          syncInterval: 3600,
        },
      },
      {
        id: "int_2",
        name: "Google Calendar",
        type: "calendar",
        status: "connected",
        description: "Calendar event synchronization",
        enabled: true,
        lastSync: new Date(Date.now() - 1800000).toISOString(),
        config: {
          calendarId: "primary",
          syncInterval: 300,
        },
      },
      {
        id: "int_3",
        name: "Salesforce CRM",
        type: "crm",
        status: "disconnected",
        description: "Client relationship management",
        enabled: false,
        lastSync: null,
      },
    ];

    return NextResponse.json(
      { success: true, data: integrations },
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
    // TODO: Validate integration configuration

    const body = await request.json();
    const { name, type, description, config, enabled = true } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, type" },
        { status: 400 }
      );
    }

    // Mock integration creation
    const integration = {
      id: `int_${Date.now()}`,
      name,
      type,
      description,
      status: "pending",
      enabled,
      config,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: integration },
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
