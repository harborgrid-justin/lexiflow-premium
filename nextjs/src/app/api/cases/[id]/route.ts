/**
 * Case Detail API Route Handler
 * GET /api/cases/[id] - Get specific case
 * PUT /api/cases/[id] - Update specific case
 * DELETE /api/cases/[id] - Delete specific case
 */

import { API_BASE_URL } from "@/lib/api-config";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          authorization: request.headers.get("authorization")!,
        }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch case" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
      method: "PUT",
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
      { error: "Failed to update case" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          authorization: request.headers.get("authorization")!,
        }),
      },
    });

    return NextResponse.json({}, { status: response.status });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to delete case" },
      { status: 500 }
    );
  }
}
