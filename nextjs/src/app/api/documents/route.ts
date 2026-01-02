import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/documents`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: `Backend error: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { message: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
