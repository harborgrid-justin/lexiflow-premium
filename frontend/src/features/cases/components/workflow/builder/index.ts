/**
 * Workflow Builder Module
 * 
 * Modular components for visual workflow design:
 * - BuilderCanvas: Main drag-drop canvas for node placement
 * - BuilderPalette: Node type palette (sidebar)
 * - BuilderProperties: Node property editor
 * - BuilderToolbar: Zoom, pan, and view controls
 * - GeneralSettings: Workflow-level configuration
 * - SimulationView: Test workflow execution
 */

export { BuilderCanvas } from './BuilderCanvas';
export { BuilderPalette } from './BuilderPalette';
export { BuilderProperties } from './BuilderProperties';
export { BuilderToolbar } from './BuilderToolbar';
export { GeneralSettings } from './GeneralSettings';
export { SimulationView } from './SimulationView';

// Types (re-exported from central workflow types)
export type * from './types';
