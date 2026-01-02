import { NextRequest, NextResponse } from "next/server";

/**
 * Workflow Instantiation API Route
 * Creates tasks from a workflow template for a specific case
 */

export interface InstantiateWorkflowBody {
  caseId: string;
}

// POST /api/workflow/templates/[id]/instantiate - Instantiate workflow for a case
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement authentication check
    const { id } = params;
    const body: InstantiateWorkflowBody = await request.json();

    // TODO: Fetch template from database
    // TODO: Create tasks for each step in the workflow
    // TODO: Link tasks to the case

    const mockResult = {
      workflowId: id,
      caseId: body.caseId,
      tasksCreated: 0,
      instantiatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockResult, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
