import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Analytics API Route Handler
 * Proxies all requests to NestJS backend
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/analytics");
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/analytics");
}
