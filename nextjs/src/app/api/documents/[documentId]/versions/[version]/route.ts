import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/documents/:documentId/versions/:version - Get a specific version
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string; version: string } }
) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentId = params.documentId;
    const version = parseInt(params.version, 10);

    // TODO: Fetch specific version from database

    return NextResponse.json(
      {
        data: {
          id: "version-id",
          documentId,
          version,
          changeDescription: "Initial version",
          createdBy: "user-1",
          createdAt: new Date().toISOString(),
          fileSize: 1024000,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Version not found" },
      { status: 404 }
    );
  }
}
