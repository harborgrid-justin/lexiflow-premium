/**
 * ServerProviders - Server-only provider wrappers
 * Request-scoped configuration, cookies, headers
 */

import { type ReactNode } from 'react';

// Unified request type handling both generic objects (Express-like) and Web Requests
type ServerRequest = {
  cookies?: Record<string, string>;
  headers?: Record<string, string | string[] | undefined> | Headers | { get(name: string): string | null;[key: string]: unknown };
  url?: string;
  path?: string;
};

interface ServerProvidersProps {
  children: ReactNode;
  request: ServerRequest;
}

/**
 * Server-side provider composition
 * Handles request-scoped data like cookies, headers, user-agent
 */
export function ServerProviders({ children, request }: ServerProvidersProps) {
  // Extract server-side context from request
  const serverContext = {
    cookies: extractCookies(request),
    headers: extractHeaders(request),
    userAgent: extractUserAgent(request),
    url: extractUrl(request),
  };

  return (
    <ServerContext.Provider value={serverContext}>
      {children}
    </ServerContext.Provider>
  );
}

// Server Context
import { createContext, useContext } from 'react';

interface ServerContextValue {
  cookies: Record<string, string>;
  headers: Record<string, string>;
  userAgent: string;
  url: string;
}

const ServerContext = createContext<ServerContextValue | null>(null);

export function useServerContext() {
  const context = useContext(ServerContext);
  if (typeof window !== 'undefined') {
    throw new Error('useServerContext can only be used on the server');
  }
  return context;
}

// Helper functions to extract request data
function extractCookies(request: ServerRequest): Record<string, string> {
  // Express-style
  if ('cookies' in request && request.cookies) return request.cookies;

  // Web Request
  let cookieHeader = '';
  if (request.headers && typeof (request.headers as Headers).get === 'function') {
    cookieHeader = (request.headers as Headers).get('cookie') || '';
  } else if (request.headers && 'cookie' in request.headers) {
    cookieHeader = (request.headers as Record<string, string>).cookie || '';
  }

  return Object.fromEntries(
    cookieHeader.split(';').map((c: string) => {
      const [key, ...rest] = c.trim().split('=');
      return [key, rest.join('=')];
    }).filter((entry: string[]) => entry[0])
  );
}

function extractHeaders(request: ServerRequest): Record<string, string> {
  if (request.headers && 'entries' in request.headers && typeof (request.headers as Headers).entries === 'function') {
    return Object.fromEntries((request.headers as Headers).entries());
  }
  return (request.headers as Record<string, string>) || {};
}

function extractUserAgent(request: ServerRequest): string {
  if (request.headers && typeof (request.headers as Headers).get === 'function') {
    return (request.headers as Headers).get('user-agent') || '';
  }
  return (request.headers as Record<string, string | undefined>)?.['user-agent'] || '';
}

function extractUrl(request: ServerRequest): string {
  return request.url || request.path || '/';
}
