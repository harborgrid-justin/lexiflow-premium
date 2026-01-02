import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/case-phases/:id - Get case phase by ID
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const phaseId = params.id;

    // TODO: Fetch phase from database

    return NextResponse.json(
      {
        data: {
          id: phaseId,
          caseId: "case-1",
          name: "Discovery",
          status: "active",
          startDate: new Date().toISOString(),
          expectedEndDate: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
          ).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Case phase not found" },
      { status: 404 }
    );
  }
}

/**
 * PUT /api/case-phases/:id - Update case phase
 * @headers Authorization: Bearer <token>
 * @body { name?: string, status?: string, startDate?: string, expectedEndDate?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const phaseId = params.id;
    const body = await request.json();

    // TODO: Validate input with Zod
    // TODO: Update phase in database

    return NextResponse.json(
      {
        data: {
          id: phaseId,
          ...body,
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update case phase" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/case-phases/:id - Delete case phase
 * @headers Authorization: Bearer <token>
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const phaseId = params.id;

    // TODO: Delete phase from database

    return NextResponse.json(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete case phase" },
      { status: 500 }
    );
  }
}
