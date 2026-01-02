import { NextRequest, NextResponse } from "next/server";

/**
 * Calendar Event Completion API Route
 */

// PUT /api/calendar/[id]/complete - Mark event as complete
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement authentication check
    const { id } = await context.params;

    // TODO: Update event status in database to completed

    const mockEvent = {
      id,
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockEvent, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
