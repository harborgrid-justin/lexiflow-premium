/**
 * Discovery Components Barrel Export
 *
 * ARCHITECTURE NOTES:
 * - Only exports presentation components
 * - No state, hooks, or services
 * - Components receive data via props
 * - Components emit events via callbacks
 *
 * @module routes/discovery/components
 * @category Discovery Components
 */

// ============================================================================
// VIEWER COMPONENTS
// ============================================================================

export * from "./DiffViewer";
export * from "./PDFViewer";

// ============================================================================
// EDITOR COMPONENTS
// ============================================================================

export * from "./EditorToolbar";
export * from "./SignaturePad";

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export * from "./ExportMenu";

// ============================================================================
// PLATFORM-SPECIFIC
// ============================================================================

export * from "./platform";
