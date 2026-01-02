import { NextRequest, NextResponse } from "next/server";

/**
 * Time Off Denial API Route
 */

export interface DenyTimeOffBody {
  reason?: string;
}

// POST /api/hr/time-off/[id]/deny - Deny time off request
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement authentication check
    // TODO: Extract user ID from auth context
    const { id } = params;
    const body: DenyTimeOffBody = await request.json();
    const approverId = "system"; // TODO: Get from auth

    // TODO: Update status in database
    // TODO: Send notification to employee with reason

    const mockTimeOff = {
      id,
      status: "denied",
      approverId,
      denialReason: body.reason,
      deniedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockTimeOff, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
