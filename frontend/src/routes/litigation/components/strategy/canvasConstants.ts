/**
 * canvasConstants.ts
 * 
 * Re-exports shared canvas constants from central location.
 * Maintains backward compatibility for component imports.
 * 
 * @module components/litigation/canvasConstants
 */

export * from '@/types/canvas-constants';

// Import for use in component-specific constants below
import { CANVAS_CONSTANTS } from '@/types/canvas-constants';

/**
 * Zoom Level Presets
 */
export const ZOOM_PRESETS = {
  FIT_TO_SCREEN: 'fit',
  ACTUAL_SIZE: 1.0,
  FILL_WIDTH: 'fill',
} as const;

/**
 * Gantt Zoom Pixels Per Day Mapping
 */
export const GANTT_ZOOM_SCALE = {
  Day: 60,
  Week: 20,
  Month: 5,
  Quarter: 2,
} as const;

/**
 * Node Type Duration Mapping (in days)
 */
export const NODE_DURATION_MAP = {
  Decision: CANVAS_CONSTANTS.DECISION_DURATION,
  Event: CANVAS_CONSTANTS.EVENT_DURATION,
  Milestone: CANVAS_CONSTANTS.EVENT_DURATION,
  Task: CANVAS_CONSTANTS.DEFAULT_TASK_DURATION,
  Phase: CANVAS_CONSTANTS.DEFAULT_TASK_DURATION,
  Delay: CANVAS_CONSTANTS.DEFAULT_TASK_DURATION,
  Start: 0,
  End: 0,
  Parallel: CANVAS_CONSTANTS.DEFAULT_TASK_DURATION,
  Comment: 0,
} as const;

// All KEYBOARD_SHORTCUTS and VALIDATION_MESSAGES are now exported from shared constants above
