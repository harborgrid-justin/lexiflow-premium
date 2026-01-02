import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Individual Employee API Routes
 */

// GET /api/hr/employees/[id] - Get employee by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/hr/employees/${params.id}`);
}

// PUT /api/hr/employees/[id] - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/hr/employees/${params.id}`);
}

// DELETE /api/hr/employees/[id] - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/hr/employees/${params.id}`);
}
