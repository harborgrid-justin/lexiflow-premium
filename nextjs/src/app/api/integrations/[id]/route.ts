import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * Integration Detail Routes
 * Migrated from: backend/src/integrations/integrations.controller.ts
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/api/integrations/${params.id}`);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/api/integrations/${params.id}`);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/api/integrations/${params.id}`);
}

    const { id } = params;

    return NextResponse.json(
      { success: true, message: `Integration ${id} deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
