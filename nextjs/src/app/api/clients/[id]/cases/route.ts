import { NextRequest, NextResponse } from "next/server";

/**
 * Client Cases API Route
 * Get all cases associated with a client
 */

// GET /api/clients/[id]/cases - Get client cases
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement authentication check
    const { id } = await context.params;

    // TODO: Fetch cases from database where clientId = id
    const mockCases = {
      data: [],
      total: 0,
    };

    return NextResponse.json(mockCases, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
