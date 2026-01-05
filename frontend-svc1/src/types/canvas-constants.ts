/**
 * canvas-constants.ts
 * 
 * Centralized constants for Strategy Canvas dimensions, timing, and positioning.
 * Extracted from components for shared use across services and hooks.
 * 
 * @module types/canvas-constants
 */

/**
 * Canvas Layout Constants
 */
export const CANVAS_CONSTANTS = {
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
  
  // Validation
  MAX_NODES: 100,               // Maximum nodes per strategy
  MAX_CONNECTIONS: 200,         // Maximum connections per strategy
  
  // AI Command Bar
  AI_RATE_LIMIT_REQUESTS: 3,    // Max requests per time window
  AI_RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  AI_MAX_PROMPT_LENGTH: 500,    // Max prompt characters
  AI_MIN_PROMPT_LENGTH: 10,     // Min prompt characters
  
  // Animation
  CONNECTION_ANIMATION_DURATION: 200, // ms
  NODE_DRAG_ANIMATION: 150,     // ms
  
  // Connection Routing
  CURVE_CONTROL_OFFSET: 80,     // Control point offset for Bezier curves
  
  // Hit Detection
  NODE_HIT_PADDING: 5,          // Extra pixels for node selection
  CONNECTION_HIT_THRESHOLD: 10, // Distance threshold for connection selection
  
  // Auto-Layout
  VERTICAL_SPACING: 120,        // Vertical space between node tiers
  HORIZONTAL_SPACING: 200,      // Horizontal space between nodes
  
  // Export
  EXPORT_PADDING: 50,           // Padding around content when exporting
  EXPORT_SCALE: 2,              // Resolution multiplier for exports
} as const;

/**
 * Validation Messages
 */
export const VALIDATION_MESSAGES = {
  NO_START_NODE: 'Strategy must have a Start node',
  NO_END_NODE: 'Strategy must have at least one End node',
  MULTIPLE_START_NODES: 'Strategy can only have one Start node',
  DISCONNECTED_NODES: 'All nodes must be connected to the workflow',
  ORPHAN_NODES: 'Strategy contains disconnected nodes',
  INVALID_CONNECTION: 'Invalid connection between nodes',
  CIRCULAR_DEPENDENCY: 'Strategy contains circular dependencies',
  MISSING_DECISION_PORTS: 'Decision nodes must have at least one outgoing connection per port',
  INVALID_PORT_CONNECTION: 'Connection must use valid ports',
  NODE_OVERLAP: 'Nodes are overlapping',
  EMPTY_CANVAS: 'Strategy canvas is empty',
  MAX_NODES_EXCEEDED: 'Maximum number of nodes exceeded',
  MAX_CONNECTIONS_EXCEEDED: 'Maximum number of connections exceeded',
  DUPLICATE_CONNECTION: 'Duplicate connection between nodes',
  MISSING_CASE_SELECTION: 'Please select a case to deploy strategy',
} as const;

/**
 * Keyboard Shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  DELETE: 'Delete',
  COPY: 'Ctrl+C',
  PASTE: 'Ctrl+V',
  DUPLICATE: 'Ctrl+D',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
  SELECT_ALL: 'Ctrl+A',
  SAVE: 'Ctrl+S',
  ZOOM_IN: 'Ctrl+=',
  ZOOM_OUT: 'Ctrl+-',
  ZOOM_RESET: 'Ctrl+0',
  FIT_TO_VIEW: 'Ctrl+1',
  TOGGLE_MINIMAP: 'Ctrl+M',
  TOGGLE_GRID: 'Ctrl+G',
  EXPORT: 'Ctrl+E',
  HELP: '?',
} as const;

/**
 * Node Type Colors (Tailwind classes)
 */
export const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Start: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700' },
  End: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700' },
  Task: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700' },
  Decision: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700' },
  Parallel: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' },
  Delay: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700' },
  Phase: { bg: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-700' },
  Event: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700' },
  Milestone: { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-700' },
  Comment: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600' },
} as const;

/**
 * Connection Styles
 */
export const CONNECTION_STYLES = {
  solid: { strokeDasharray: 'none', strokeWidth: 2 },
  dashed: { strokeDasharray: '5,5', strokeWidth: 2 },
} as const;
