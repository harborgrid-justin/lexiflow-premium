import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/ocr/languages/:lang/check - Check if language is supported
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { lang: string } }
) {
  try {
    // TODO: Implement authentication check
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lang = params.lang;

    // TODO: Check if language is supported
    const supportedLanguages = [
      "eng",
      "spa",
      "fra",
      "deu",
      "ita",
      "por",
      "rus",
      "chi_sim",
      "jpn",
      "ara",
    ];
    const isSupported = supportedLanguages.includes(lang);

    return NextResponse.json(
      {
        language: lang,
        supported: isSupported,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to check language support" },
      { status: 500 }
    );
  }
}
