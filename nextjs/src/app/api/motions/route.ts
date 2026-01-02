import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/motions - Retrieve all motions
 * @headers Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Fetch all motions from database

    return NextResponse.json(
      {
        data: [
          {
            id: "motion-1",
            caseId: "case-1",
            title: "Motion to Dismiss",
            type: "dismissal",
            status: "pending",
            filedDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch motions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/motions - Create a new motion
 * @headers Authorization: Bearer <token>
 * @body { caseId: string, title: string, type: string, status?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { caseId, title, type, status } = body;

    // Basic validation
    if (!caseId || !title || !type) {
      return NextResponse.json(
        { error: "Case ID, title, and type are required" },
        { status: 400 }
      );
    }

    // TODO: Validate input with Zod
    // TODO: Create motion in database

    return NextResponse.json(
      {
        data: {
          id: "new-motion-id",
          caseId,
          title,
          type,
          status: status || "draft",
          filedDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create motion" },
      { status: 500 }
    );
  }
}
