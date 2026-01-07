/**
 * ServerProviders - Server-only provider wrappers
 * Request-scoped configuration, cookies, headers
 */

import { type ReactNode } from 'react';

interface ServerProvidersProps {
  children: ReactNode;
  request: Request | any; // Express Request or Web Request
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
function extractCookies(request: any): Record<string, string> {
  // Express-style
  if (request.cookies) return request.cookies;

  // Web Request
  const cookieHeader = request.headers?.get?.('cookie') || request.headers?.cookie || '';
  return Object.fromEntries(
    cookieHeader.split(';').map((c: string) => {
      const [key, ...rest] = c.trim().split('=');
      return [key, rest.join('=')];
    }).filter(([key]: [string]) => key)
  );
}

function extractHeaders(request: any): Record<string, string> {
  if (request.headers?.entries) {
    return Object.fromEntries(request.headers.entries());
  }
  return request.headers || {};
}

function extractUserAgent(request: any): string {
  return request.headers?.get?.('user-agent') || request.headers?.['user-agent'] || '';
}

function extractUrl(request: any): string {
  return request.url || request.path || '/';
}
