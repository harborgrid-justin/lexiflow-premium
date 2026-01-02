import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/motions/case/:caseId - Get motions by case ID
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

    // TODO: Fetch motions for the case from database

    return NextResponse.json(
      {
        data: [
          {
            id: "motion-1",
            caseId,
            title: "Motion to Dismiss",
            type: "dismissal",
            status: "pending",
            filedDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: "motion-2",
            caseId,
            title: "Motion for Summary Judgment",
            type: "summary_judgment",
            status: "granted",
            filedDate: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            createdAt: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
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
