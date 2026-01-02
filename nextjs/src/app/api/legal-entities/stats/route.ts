import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/legal-entities/stats
 * Get entity statistics
 * Migrated from: backend/src/legal-entities/legal-entities.controller.ts
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement JWT authentication
    // TODO: Connect to PostgreSQL database

    // Mock entity statistics
    const stats = {
      totalEntities: 156,
      byType: {
        CORPORATION: 78,
        LLC: 52,
        PARTNERSHIP: 18,
        SOLE_PROPRIETORSHIP: 8,
      },
      byStatus: {
        ACTIVE: 142,
        INACTIVE: 10,
        DISSOLVED: 4,
      },
      byJurisdiction: {
        Delaware: 56,
        California: 38,
        "New York": 32,
        Texas: 18,
        Other: 12,
      },
      recentlyAdded: 12, // last 30 days
      pendingActions: 5,
    };

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
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
