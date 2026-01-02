import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/ocr/progress/:jobId - Get OCR job progress
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = params.jobId;

    // TODO: Fetch job progress from queue/database

    return NextResponse.json(
      {
        jobId,
        status: "processing",
        progress: 65,
        startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        estimatedCompletion: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Job not found" },
      { status: 404 }
    );
  }
}
