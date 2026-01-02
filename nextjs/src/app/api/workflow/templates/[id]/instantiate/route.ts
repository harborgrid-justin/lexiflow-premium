import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Workflow Instantiation API Route
 * Creates tasks from a workflow template for a specific case
 */

// POST /api/workflow/templates/[id]/instantiate - Instantiate workflow for a case
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(
    request,
    `/api/workflow/templates/${params.id}/instantiate`
  );
}
