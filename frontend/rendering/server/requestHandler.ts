/**
 * Request Handler Service
 *
 * Main entry point for handling server-side rendering requests.
 * Orchestrates the rendering pipeline and error handling.
 *
 * @module rendering/server/requestHandler
 */

import type { AppLoadContext, EntryContext } from "react-router";
import { streamRenderer } from "./streamRenderer.tsx";

export const DEFAULT_STREAM_TIMEOUT = 5000;

/**
 * Handles server-side rendering requests
 *
 * This is the main entry point called by the React Router server adapter.
 * It orchestrates the rendering pipeline, including stream setup, error handling,
 * and response generation.
 *
 * @param request - The incoming HTTP request
 * @param responseStatusCode - Initial HTTP status code for the response
 * @param responseHeaders - HTTP headers to include in the response
 * @param routerContext - React Router context containing route information
 * @param _loadContext
 * @returns Promise resolving to a Response object
 */
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext
): Promise<Response> {
  try {
    const result = await streamRenderer.render(
      request,
      responseStatusCode,
      responseHeaders,
      routerContext
    );

    return new Response(result.stream, {
      headers: result.headers,
      status: result.statusCode,
    });
  } catch (error) {
    console.error("[RequestHandler] Fatal rendering error:", error);

    // Return a minimal error response
    return new Response(
      `<!DOCTYPE html>
<html>
  <head><title>Server Error</title></head>
  <body>
    <h1>Server Error</h1>
    <p>The server encountered an error while rendering this page.</p>
  </body>
</html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
}

/**
 * Export stream timeout for compatibility
 */
export const streamTimeout = DEFAULT_STREAM_TIMEOUT;
