/**
 * Stream Renderer Service
 *
 * Handles server-side streaming of React components using renderToPipeableStream.
 * Provides optimized rendering for both bot crawlers and regular users.
 *
 * @module rendering/server/streamRenderer
 */

import { PassThrough } from "node:stream";

import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";

import type { EntryContext } from "react-router";

export interface StreamRendererConfig {
  /** Timeout in milliseconds for stream rendering */
  streamTimeout: number;
  /** Whether to wait for all ready for bots */
  waitForBotsReady: boolean;
}

export interface RenderResult {
  stream: ReadableStream;
  headers: Headers;
  statusCode: number;
}

export class StreamRenderer {
  private config: StreamRendererConfig;

  constructor(config: Partial<StreamRendererConfig> = {}) {
    this.config = {
      streamTimeout: config.streamTimeout ?? 5000,
      waitForBotsReady: config.waitForBotsReady ?? true,
    };
  }

  /**
   * Renders a React Router application to a pipeable stream
   *
   * @param request - The incoming HTTP request
   * @param responseStatusCode - Initial response status code
   * @param responseHeaders - Response headers to include
   * @param routerContext - React Router context
   * @returns Promise resolving to render result
   */
  async render(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext
  ): Promise<RenderResult> {
    return new Promise((resolve, reject) => {
      let shellRendered = false;
      const userAgent = request.headers.get("user-agent");

      // Determine ready strategy based on client type
      const readyOption = this.getReadyOption(userAgent, routerContext);

      const { pipe, abort } = renderToPipeableStream(
        <ServerRouter context={routerContext} url={request.url} />,
        {
          [readyOption]() {
            shellRendered = true;
            const body = new PassThrough();
            const stream = createReadableStreamFromReadable(body);

            responseHeaders.set("Content-Type", "text/html");

            resolve({
              stream,
              headers: responseHeaders,
              statusCode: responseStatusCode,
            });

            pipe(body);
          },
          onShellError(error: unknown) {
            const safeError =
              error instanceof Error
                ? error
                : new Error("Render failed during shell");
            reject(safeError);
          },
          onError(error: unknown) {
            responseStatusCode = 500;
            if (shellRendered) {
              const safeError =
                error instanceof Error
                  ? error
                  : new Error("Stream rendering error");
              console.error("[StreamRenderer] Render error:", safeError);
            }
          },
        }
      );

      // Set timeout to abort rendering if it takes too long
      setTimeout(abort, this.config.streamTimeout + 1000);
    });
  }

  /**
   * Determines the appropriate ready option based on client characteristics
   */
  private getReadyOption(
    userAgent: string | null,
    routerContext: EntryContext
  ): "onAllReady" | "onShellReady" {
    // Bots should wait for full content
    if (userAgent && isbot(userAgent)) {
      return "onAllReady";
    }

    // SPA mode should wait for all content
    if (routerContext.isSpaMode) {
      return "onAllReady";
    }

    // Regular users get progressive rendering
    return "onShellReady";
  }

  /**
   * Updates the configuration
   */
  updateConfig(config: Partial<StreamRendererConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Default stream renderer instance
 */
export const streamRenderer = new StreamRenderer();
