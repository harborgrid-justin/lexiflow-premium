import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cases/:caseId/phases - Get all phases for a case
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caseId = params.caseId;

    // TODO: Fetch case phases from database

    return NextResponse.json(
      {
        data: [
          {
            id: "phase-1",
            caseId,
            name: "Discovery",
            status: "active",
            startDate: new Date().toISOString(),
            expectedEndDate: new Date(
              Date.now() + 90 * 24 * 60 * 60 * 1000
            ).toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: "phase-2",
            caseId,
            name: "Pre-Trial",
            status: "pending",
            startDate: null,
            expectedEndDate: null,
            createdAt: new Date().toISOString(),
          },
        ],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch case phases" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cases/:caseId/phases - Create new phase for a case
 * @headers Authorization: Bearer <token>
 * @body { name: string, status?: string, startDate?: string, expectedEndDate?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caseId = params.caseId;
    const body = await request.json();
    const { name, status, startDate, expectedEndDate } = body;

    // Basic validation
    if (!name) {
      return NextResponse.json(
        { error: "Phase name is required" },
        { status: 400 }
      );
    }

    // TODO: Validate input with Zod
    // TODO: Create phase in database

    return NextResponse.json(
      {
        data: {
          id: "new-phase-id",
          caseId,
          name,
          status: status || "pending",
          startDate: startDate || null,
          expectedEndDate: expectedEndDate || null,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create case phase" },
      { status: 500 }
    );
  }
}
