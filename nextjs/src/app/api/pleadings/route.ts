import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Pleadings API Route Handler
 * Proxies all requests to NestJS backend
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/pleadings");
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/pleadings");
}

export async function PUT(request: NextRequest) {
  return proxyToBackend(request, "/api/pleadings");
}

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request, "/api/pleadings");
}

export async function DELETE(request: NextRequest) {
  return proxyToBackend(request, "/api/pleadings");
}
