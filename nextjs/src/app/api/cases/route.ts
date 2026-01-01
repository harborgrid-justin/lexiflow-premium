/**
 * Cases API Route Handler
 * GET /api/cases - List all cases
 */

import { API_BASE_URL } from "@/lib/api-config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  try {
    // Forward request to backend API
    const response = await fetch(
      `${API_BASE_URL}/cases?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          // Forward auth headers if present
          ...(request.headers.get("authorization") && {
            authorization: request.headers.get("authorization")!,
          }),
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          authorization: request.headers.get("authorization")!,
        }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    );
  }
}
