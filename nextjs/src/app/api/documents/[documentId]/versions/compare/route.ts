import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/documents/:documentId/versions/compare - Compare two versions
 * @headers Authorization: Bearer <token>
 * @query v1, v2 - Version numbers to compare
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentId = params.documentId;
    const searchParams = request.nextUrl.searchParams;
    const v1 = parseInt(searchParams.get("v1") || "1", 10);
    const v2 = parseInt(searchParams.get("v2") || "2", 10);

    // TODO: Fetch both versions
    // TODO: Perform diff comparison
    // TODO: Return comparison results

    return NextResponse.json(
      {
        documentId,
        version1: v1,
        version2: v2,
        differences: [
          {
            type: "text_change",
            location: "page 2, paragraph 3",
            oldText: "Original text",
            newText: "Updated text",
          },
        ],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to compare versions" },
      { status: 500 }
    );
  }
}
