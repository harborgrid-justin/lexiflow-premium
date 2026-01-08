/**
 * @module hooks/useScheduleDrag
 * @category Hooks - Workflow Management
 *
 * Schedule chart drag-and-drop with move and resize modes.
 * Uses RAF for 60fps visual updates without React re-renders.
 *
 * @example
 * ```typescript
 * const drag = useScheduleController({
 *   pixelsPerDay: 30,
 *   tasks,
 *   onTaskUpdate: (id, start, end) => updateTask(id, { start, end })
 * });
 *
 * <TaskBar
 *   onMouseDown={(e) => drag.initDrag(e, task.id, 'move', e.currentTarget)}
 * />
 * <ResizeHandle
 *   onMouseDown={(e) => drag.initDrag(e, task.id, 'resize-right', taskEl)}
 * />
 * ```
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import React, { useCallback, useEffect, useRef } from "react";

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Types
import { WorkflowTask } from "@/types";

// ========================================
// TYPES & INTERFACES
// ========================================

/**
 * Drag mode type
 */
export type DragMode = "move" | "resize-left" | "resize-right";

/**
 * Configuration for useGanttDrag
 */
interface DragOptions {
  /** Pixels per day for date calculation */
  pixelsPerDay: number;
  /** Tasks array for date lookups */
  tasks: WorkflowTask[];
  /** Callback when task dates change */
  onTaskUpdate: (
    taskId: string,
    newStartDate: string,
    newDueDate: string
  ) => void;
}

/**
 * Return type for useGanttDrag hook
 */
export interface UseGanttDragReturn {
  /** Initialize drag operation */
  initDrag: (
    e: React.MouseEvent,
    taskId: string,
    mode: DragMode,
    element: HTMLElement
  ) => void;
  /** Initialize drag operation (alias for backward compatibility) */
  onMouseDown: (
    e: React.MouseEvent,
    taskId: string,
    mode: DragMode,
    element?: HTMLElement
  ) => void;
}

// ========================================
// HOOK
// ========================================

/**
 * Gantt chart drag-and-drop with smooth visual updates.
 *
 * @param options - Configuration options
 * @returns Object with initDrag method
 */
export function useScheduleController({
  pixelsPerDay,
  tasks,
  onTaskUpdate,
}: DragOptions): UseGanttDragReturn {
  const dragRef = useRef<{
    taskId: string;
    mode: DragMode;
    startX: number;
    initialWidth: number;
    element: HTMLElement;
  } | null>(null);

  const activeListenersRef = useRef<{
    move: ((e: MouseEvent) => void) | null;
    up: ((e: MouseEvent) => void) | null;
  }>({ move: null, up: null });

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      if (activeListenersRef.current.move) {
        window.removeEventListener(
          "mousemove",
          activeListenersRef.current.move
        );
      }
      if (activeListenersRef.current.up) {
        window.removeEventListener("mouseup", activeListenersRef.current.up);
      }
    };
  }, []);

  // 60fps Loop for smooth visual updates without React re-renders
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { startX, initialWidth, element, mode } = dragRef.current;
      const dx = e.clientX - startX;

      requestAnimationFrame(() => {
        if (mode === "move") {
          element.style.transform = `translate3d(${dx}px, 0, 0)`;
          element.style.zIndex = "50";
        } else if (mode === "resize-right") {
          element.style.width = `${Math.max(20, initialWidth + dx)}px`;
        } else if (mode === "resize-left") {
          // For left resize, we translate right and shrink width, or translate left and grow width
          // Visual trick: translate X and change width
          const newWidth = Math.max(20, initialWidth - dx);
          if (newWidth > 20) {
            element.style.transform = `translate3d(${dx}px, 0, 0)`;
            element.style.width = `${newWidth}px`;
          }
        }
      });
    },
    [handleMouseUp]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent, taskId: string, mode: DragMode) => {
      // Only left click
      if (e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      // If dragging handles, the target is the handle, parent is the bar.
      // If moving, target is the bar.
      const element =
        mode === "move" ? target : (target.parentElement as HTMLElement);

      if (!element) return;

      const rect = element.getBoundingClientRect();

      dragRef.current = {
        taskId,
        mode,
        startX: e.clientX,
        initialWidth: rect.width,
        element,
      };

      document.body.style.cursor = mode === "move" ? "grabbing" : "col-resize";

      // Store listeners in ref for cleanup
      activeListenersRef.current = { move: handleMouseMove, up: handleMouseUp };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  return { initDrag: onMouseDown, onMouseDown };
}
