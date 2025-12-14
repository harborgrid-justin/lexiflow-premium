/**
 * @module hooks/useGanttDrag
 * @category Hooks - Workflow Management
 * @description Gantt chart drag-and-drop hook with move and resize modes (left/right handles).
 * Uses RAF for 60fps visual updates without React re-renders, then calculates date changes on
 * drop based on pixels-per-day ratio. Supports drag modes: move, resize-left, resize-right.
 * 
 * NO THEME USAGE: Utility hook for Gantt drag logic
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import React, { useRef, useCallback } from 'react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Types
import { WorkflowTask } from '../types';

// ========================================
// TYPES & INTERFACES
// ========================================
export type DragMode = 'move' | 'resize-left' | 'resize-right';

interface DragOptions {
    pixelsPerDay: number;
    tasks: WorkflowTask[];
    onTaskUpdate: (taskId: string, newStartDate: string, newDueDate: string) => void;
}

// ========================================
// HOOK
// ========================================
export const useGanttDrag = ({ pixelsPerDay, tasks, onTaskUpdate }: DragOptions) => {
    const dragRef = useRef<{
        taskId: string;
        mode: DragMode;
        startX: number;
        initialWidth: number;
        element: HTMLElement;
    } | null>(null);

    // 60fps Loop for smooth visual updates without React re-renders
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragRef.current) return;
        const { startX, initialWidth, element, mode } = dragRef.current;
        const dx = e.clientX - startX;

        requestAnimationFrame(() => {
            if (mode === 'move') {
                element.style.transform = `translate3d(${dx}px, 0, 0)`;
                element.style.zIndex = '50';
            } else if (mode === 'resize-right') {
                element.style.width = `${Math.max(20, initialWidth + dx)}px`;
            } else if (mode === 'resize-left') {
                // For left resize, we translate right and shrink width, or translate left and grow width
                // Visual trick: translate X and change width
                const newWidth = Math.max(20, initialWidth - dx);
                if (newWidth > 20) {
                     element.style.transform = `translate3d(${dx}px, 0, 0)`;
                     element.style.width = `${newWidth}px`;
                }
            }
        });
    }, []);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (!dragRef.current) return;
        const { taskId, mode, startX, element } = dragRef.current;
        const dx = e.clientX - startX;
        
        // Cleanup
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        
        // Reset visual overrides (React state update will snap it to correct place)
        element.style.transform = '';
        element.style.width = ''; 
        element.style.zIndex = '';

        dragRef.current = null;

        // Logic: Calculate new dates
        const daysDelta = Math.round(dx / pixelsPerDay);
        
        if (daysDelta !== 0) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                // Default duration to 5 days if not calculable
                const currentDue = new Date(task.dueDate);
                const currentStart = task.startDate 
                    ? new Date(task.startDate) 
                    : new Date(currentDue.getTime() - (5 * 24 * 60 * 60 * 1000));
                
                let newStart = new Date(currentStart);
                let newDue = new Date(currentDue);

                if (mode === 'move') {
                    newStart.setDate(newStart.getDate() + daysDelta);
                    newDue.setDate(newDue.getDate() + daysDelta);
                } else if (mode === 'resize-right') {
                    newDue.setDate(newDue.getDate() + daysDelta);
                } else if (mode === 'resize-left') {
                    newStart.setDate(newStart.getDate() + daysDelta);
                }

                // Ensure start is before due
                if (newStart.getTime() > newDue.getTime()) {
                    return; // Invalid state, abort
                }

                onTaskUpdate(
                    taskId, 
                    newStart.toISOString().split('T')[0], 
                    newDue.toISOString().split('T')[0]
                );
            }
        }
    }, [tasks, pixelsPerDay, onTaskUpdate, handleMouseMove]);

    const onMouseDown = useCallback((e: React.MouseEvent, taskId: string, mode: DragMode) => {
        // Only left click
        if (e.button !== 0) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.currentTarget as HTMLElement;
        // If dragging handles, the target is the handle, parent is the bar.
        // If moving, target is the bar.
        const element = mode === 'move' ? target : target.parentElement as HTMLElement;
        
        if (!element) return;

        const rect = element.getBoundingClientRect();
        
        dragRef.current = {
            taskId,
            mode,
            startX: e.clientX,
            initialWidth: rect.width,
            element
        };

        document.body.style.cursor = mode === 'move' ? 'grabbing' : 'col-resize';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove, handleMouseUp]);

    return { onMouseDown };
};