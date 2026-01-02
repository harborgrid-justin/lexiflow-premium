import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/documents/:id/ocr - Trigger OCR processing for a document
 * @headers Authorization: Bearer <token>
 * @body { languages?: string[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentId = params.id;
    const body = await request.json();
    const { languages = ["eng"] } = body;

    // TODO: Verify document exists
    // TODO: Create OCR processing job
    // TODO: Queue job for background processing

    return NextResponse.json(
      {
        message: "OCR processing job created",
        jobId: "job-" + Date.now(),
        documentId,
        languages,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to trigger OCR" },
      { status: 500 }
    );
  }
}
