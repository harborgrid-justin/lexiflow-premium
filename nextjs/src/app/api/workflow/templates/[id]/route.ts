import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Individual Workflow Template API Routes
 */

// GET /api/workflow/templates/[id] - Get workflow template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/api/workflow/templates/${params.id}`);
}

// PUT /api/workflow/templates/[id] - Update workflow template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/api/workflow/templates/${params.id}`);
}

// DELETE /api/workflow/templates/[id] - Delete workflow template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/api/workflow/templates/${params.id}`);
}
