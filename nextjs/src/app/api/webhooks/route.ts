import { NextRequest, NextResponse } from "next/server";

/**
 * Webhooks API Routes
 * Migrated from: backend/src/webhooks/webhooks.controller.ts
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement JWT authentication
    // TODO: Connect to PostgreSQL database
    // TODO: Filter webhooks by user

    // Mock webhooks list
    const webhooks = [
      {
        id: "wh_1",
        url: "https://example.com/webhook",
        events: ["case.created", "case.updated", "document.uploaded"],
        status: "active",
        secret: "whsec_***",
        createdAt: new Date().toISOString(),
      },
      {
        id: "wh_2",
        url: "https://api.client.com/lexiflow-events",
        events: ["billing.invoice.created", "task.completed"],
        status: "active",
        secret: "whsec_***",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(
      { success: true, data: webhooks },
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
    // TODO: Validate webhook URL
    // TODO: Generate webhook secret

    const body = await request.json();
    const { url, events, description } = body;

    // Validate required fields
    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: url, events" },
        { status: 400 }
      );
    }

    // Mock webhook creation
    const webhook = {
      id: `wh_${Date.now()}`,
      url,
      events,
      description,
      status: "active",
      secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: webhook }, { status: 201 });
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
