/**
 * Node.js SSR Entry Point
 * Uses renderToPipeableStream for server-side rendering with streaming support
 */

import type { Request, Response } from 'express';
import { renderToPipeableStream } from 'react-dom/server';
import { AppProviders } from '../../providers/AppProviders';
import { ServerProviders } from '../../providers/ServerProviders';

interface RenderOptions {
  req: Request;
  res: Response;
  bootstrapScripts?: string[];
  nonce?: string;
}

export function render({ req, res, bootstrapScripts = [], nonce }: RenderOptions) {
  let didError = false;

  const stream = renderToPipeableStream(
    <ServerProviders request={req}>
      <AppProviders children={null}>
        {/* App content will be composed here */}
      </AppProviders>
    </ServerProviders>,
    {
      bootstrapScripts,
      nonce,
      onShellReady() {
        // Shell is ready, can start streaming
        res.statusCode = didError ? 500 : 200;
        res.setHeader('Content-Type', 'text/html');
        stream.pipe(res);
      },
      onShellError(error: unknown) {
        // Something went wrong before we could start streaming
        console.error('Shell error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.send('<!doctype html><html><body><h1>Server Error</h1></body></html>');
      },
      onError(error: unknown) {
        didError = true;
        console.error('Stream error:', error);
      },
    }
  );

  // Timeout after 10 seconds
  setTimeout(() => {
    stream.abort();
  }, 10000);
}
