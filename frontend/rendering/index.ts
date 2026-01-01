/**
 * Rendering Module
 *
 * Main entry point for server-side rendering (SSR) functionality.
 * Organized using Service-Oriented Architecture (SOA) principles.
 *
 * This module provides:
 * - Server: SSR request handling and streaming
 * - Client: Hydration and client initialization
 * - Hydration: Loading states and fallback components
 * - Utils: SSR-safe utilities and environment detection
 * - Middleware: Request/response processing
 *
 * @module rendering
 */

// Server-side rendering
export * from "./server";

// Client-side hydration
export * from "./client";

// Hydration components
export * from "./hydration";

// Utilities
export * from "./utils";

// Middleware
export * from "./middleware";
