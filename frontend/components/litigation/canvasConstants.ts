/**
 * canvasConstants.ts
 * 
 * Re-exports shared canvas constants from central location.
 * Maintains backward compatibility for component imports.
 * 
 * @module components/litigation/canvasConstants
 */

export * from '../../types/canvas-constants';

// Import for use in component-specific constants below
import { CANVAS_CONSTANTS } from '../../types/canvas-constants';

// Component-specific constants can be added below
/** @deprecated Use CANVAS_CONSTANTS instead */
const LEGACY_CANVAS_CONSTANTS = {
  // Node Dimensions
  NODE_WIDTH_HALF: 75,          // Half width for positioning calculations
  NODE_HEIGHT_HALF: 40,         // Half height for positioning calculations
  PHASE_WIDTH: 300,             // Phase container width
  PHASE_HEIGHT: 200,            // Phase container height
  DECISION_NODE_SIZE: 56,       // Decision node half-size (diamond)
  
  // Grid & Spacing
  GRID_SIZE: 20,                // Snap-to-grid size
  NODE_SPACING: 20,             // Minimum space between nodes
  DUPLICATE_OFFSET: 20,         // Offset when duplicating nodes
  
  // Timeline Calculations
  PIXELS_PER_DAY: 20,           // X-axis pixels per day for Gantt conversion
  DEFAULT_TASK_DURATION: 7,    // Default task duration in days
  DECISION_DURATION: 14,        // Decision/motion duration in days
  EVENT_DURATION: 1,            // Event duration in days
  
  // Zoom & Pan
  MIN_ZOOM: 0.2,                // Minimum zoom level (20%)
  MAX_ZOOM: 2.0,                // Maximum zoom level (200%)
  DEFAULT_ZOOM: 1.0 as number,  // Default zoom level
  ZOOM_STEP: 0.1,               // Zoom increment/decrement
  ZOOM_ANIMATION_DURATION: 300, // ms
  
  // Minimap
  MINIMAP_WIDTH: 208,           // 52 * 4 (Tailwind w-52)
  MINIMAP_HEIGHT: 160,          // 40 * 4 (Tailwind h-40)
  MINIMAP_PADDING: 10,          // Internal padding
  MINIMAP_NODE_MIN_SIZE: 4,     // Minimum node size in minimap
  
  // Auto-Save
  AUTOSAVE_DEBOUNCE_MS: 3000,   // 3 seconds debounce
  
  // Undo/Redo
  MAX_HISTORY_SIZE: 50,         // Maximum undo/redo operations
  
  // AI Command Bar
  AI_RATE_LIMIT_REQUESTS: 3,    // Max requests per time window
  AI_RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  AI_MAX_PROMPT_LENGTH: 500,    // Max prompt characters
  AI_MIN_PROMPT_LENGTH: 10,     // Min prompt characters
  
  // Validation
  MAX_NODES: 100,               // Maximum nodes per strategy
  MAX_CONNECTIONS: 200,         // Maximum connections per strategy
  
  // Animation
  CONNECTION_ANIMATION_DURATION: 200, // ms
  NODE_DRAG_ANIMATION: 150,     // ms
} as const;

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
