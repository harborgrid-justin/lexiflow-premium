import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/ocr/languages - Get supported OCR languages
 * @headers Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Fetch supported languages from OCR engine

    return NextResponse.json(
      {
        data: [
          { code: "eng", name: "English" },
          { code: "spa", name: "Spanish" },
          { code: "fra", name: "French" },
          { code: "deu", name: "German" },
          { code: "ita", name: "Italian" },
          { code: "por", name: "Portuguese" },
          { code: "rus", name: "Russian" },
          { code: "chi_sim", name: "Chinese Simplified" },
          { code: "jpn", name: "Japanese" },
          { code: "ara", name: "Arabic" },
        ],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch languages" },
      { status: 500 }
    );
  }
}
