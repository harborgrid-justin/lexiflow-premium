/**
 * Server Rendering Module
 *
 * Exports all server-side rendering functionality including:
 * - Request handler for React Router
 * - Stream renderer service
 * - Server utilities
 *
 * @module rendering/server
 */

export {
  default,
  default as handleRequest,
  streamTimeout,
} from "./requestHandler";
export { StreamRenderer, streamRenderer } from "./streamRenderer.tsx";
export type { RenderResult, StreamRendererConfig } from "./streamRenderer.tsx";
