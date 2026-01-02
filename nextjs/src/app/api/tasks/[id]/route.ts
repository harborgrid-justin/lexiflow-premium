import { NextRequest, NextResponse } from "next/server";

/**
 * Individual Task API Routes
 */

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueDate?: string;
}

// GET /api/tasks/[id] - Get task by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement authentication check
    const { id } = await context.params;

    // TODO: Fetch from database
    const mockTask = {
      id,
      title: "Sample Task",
      description: "Task description",
      status: "todo",
      priority: "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockTask, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement authentication check
    const { id } = await context.params;
    const body: UpdateTaskDto = await request.json();

    // TODO: Validate input
    // TODO: Update in database

    const mockTask = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockTask, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement authentication check
    const { id } = await context.params;

    // TODO: Delete from database

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
