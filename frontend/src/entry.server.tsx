/**
 * Entry Server
 *
 * Server-side rendering entry point for React Router.
 * Delegates to the rendering module's request handler.
 *
 * @see @rendering/server for implementation details
 */

import { initializeModules } from "@/config/modules/initializeModules";
import handleRequest from "@rendering/server";
import type { AppLoadContext, EntryContext } from "react-router";

// Initialize modules for SSR
initializeModules();

/**
 * Handles server-side rendering requests
 * Re-exports the handleRequest function from the rendering module
 */
export default async function (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext
): Promise<Response> {
  return handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    routerContext,
    loadContext
  );
}
