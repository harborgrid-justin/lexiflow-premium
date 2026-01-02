import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/api-keys/scopes
 * Get available API key scopes
 * Migrated from: backend/src/api-keys/api-keys.controller.ts
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement JWT authentication
    // TODO: Verify user has ADMIN role

    // Available API scopes
    const scopes = [
      {
        category: "Cases",
        scopes: [
          { name: "cases:read", description: "Read case information" },
          { name: "cases:write", description: "Create and update cases" },
          { name: "cases:delete", description: "Delete cases" },
        ],
      },
      {
        category: "Documents",
        scopes: [
          { name: "documents:read", description: "Read documents" },
          {
            name: "documents:write",
            description: "Upload and update documents",
          },
          { name: "documents:delete", description: "Delete documents" },
        ],
      },
      {
        category: "Billing",
        scopes: [
          { name: "billing:read", description: "Read billing information" },
          {
            name: "billing:write",
            description: "Create invoices and log time",
          },
        ],
      },
      {
        category: "Tasks",
        scopes: [
          { name: "tasks:read", description: "Read tasks" },
          { name: "tasks:write", description: "Create and update tasks" },
          { name: "tasks:delete", description: "Delete tasks" },
        ],
      },
      {
        category: "Users",
        scopes: [
          { name: "users:read", description: "Read user information" },
          {
            name: "users:write",
            description: "Update user profiles (admin only)",
          },
        ],
      },
      {
        category: "Webhooks",
        scopes: [
          { name: "webhooks:read", description: "Read webhook configurations" },
          { name: "webhooks:write", description: "Manage webhooks" },
        ],
      },
      {
        category: "Analytics",
        scopes: [
          { name: "analytics:read", description: "Read analytics and reports" },
        ],
      },
    ];

    return NextResponse.json({ success: true, data: scopes }, { status: 200 });
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
