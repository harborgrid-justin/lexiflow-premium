/**
 * Components Barrel Export
 *
 * ARCHITECTURE NOTES:
 * - Only exports presentation components
 * - No state, hooks, or services
 * - Components receive data via props
 * - Components emit events via callbacks
 */

// Components exported here should be pure presentation
export { DocumentAnnotations } from "./DocumentAnnotations";
export { DocumentUploader } from "./DocumentUploader";
export { DocumentViewer } from "./DocumentViewer";
export { MetadataPanel } from "./MetadataPanel";
export type { UploadMetadata } from "./types/DocumentUploaderProps";
export { VersionHistory } from "./VersionHistory";
