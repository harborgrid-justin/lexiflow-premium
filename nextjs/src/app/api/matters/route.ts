import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/matters - Retrieve all matters with pagination and filters
 * @headers Authorization: Bearer <token>
 * @query page, pageSize, status, matterType, priority, clientId, leadAttorneyId, search
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
    const status = searchParams.get("status");
    const matterType = searchParams.get("matterType");
    const priority = searchParams.get("priority");
    const clientId = searchParams.get("clientId");
    const leadAttorneyId = searchParams.get("leadAttorneyId");
    const search = searchParams.get("search");

    // TODO: Apply filters and pagination
    // TODO: Fetch matters from database

    return NextResponse.json(
      {
        data: [
          {
            id: "matter-1",
            title: "Corporate Acquisition Review",
            matterType: "corporate",
            status: "active",
            priority: "high",
            clientId: "client-1",
            leadAttorneyId: "attorney-1",
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page,
        pageSize,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch matters" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/matters - Create a new matter
 * @headers Authorization: Bearer <token>
 * @body { title: string, matterType: string, clientId: string, leadAttorneyId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, matterType, clientId, leadAttorneyId } = body;

    // Basic validation
    if (!title || !matterType || !clientId) {
      return NextResponse.json(
        { error: "Title, matter type, and client ID are required" },
        { status: 400 }
      );
    }

    // TODO: Validate input with Zod
    // TODO: Create matter in database

    return NextResponse.json(
      {
        data: {
          id: "new-matter-id",
          title,
          matterType,
          clientId,
          leadAttorneyId: leadAttorneyId || null,
          status: "active",
          priority: "medium",
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create matter" },
      { status: 500 }
    );
  }
}
