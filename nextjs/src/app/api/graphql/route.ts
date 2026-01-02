import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * GraphQL API Endpoint
 * Migrated from: backend/src/graphql/
 */

/**
 * POST /api/graphql - Execute GraphQL queries and mutations
 * @body { query: string, variables?: any, operationName?: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/graphql`);
}

/**
 * GET /api/graphql - GraphQL playground/schema introspection
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/graphql`);
}
