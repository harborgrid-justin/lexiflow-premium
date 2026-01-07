/**
 * Edge Runtime SSR Entry Point
 * Uses renderToReadableStream for Web Streams API compatibility
 */

import { renderToReadableStream } from 'react-dom/server';
import { App } from '../../App';
import { ServerProviders } from '../../providers/ServerProviders';

interface RenderOptions {
  request: Request;
  bootstrapScripts?: string[];
  nonce?: string;
}

export async function render({ request, bootstrapScripts = [], nonce }: RenderOptions): Promise<Response> {
  try {
    const stream = await renderToReadableStream(
      <ServerProviders request={request}>
        <App />
      </ServerProviders>,
      {
        bootstrapScripts,
        nonce,
        signal: request.signal,
      }
    );

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Edge render error:', error);
    return new Response('<!doctype html><html><body><h1>Server Error</h1></body></html>', {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
