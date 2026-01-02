import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Settings API Route Handler
 * Proxies all requests to NestJS backend
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/settings");
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/settings");
}

export async function PUT(request: NextRequest) {
  return proxyToBackend(request, "/api/settings");
}

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request, "/api/settings");
}

export async function DELETE(request: NextRequest) {
  return proxyToBackend(request, "/api/settings");
}
