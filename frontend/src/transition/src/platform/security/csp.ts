/**
 * Content Security Policy configuration
 */

export interface CSPDirectives {
  "default-src"?: string[];
  "script-src"?: string[];
  "style-src"?: string[];
  "img-src"?: string[];
  "font-src"?: string[];
  "connect-src"?: string[];
  "frame-src"?: string[];
  "object-src"?: string[];
  "base-uri"?: string[];
  "form-action"?: string[];
}

export const defaultCSP: CSPDirectives = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'", "data:"],
  "connect-src": ["'self'", "https://api.lexiflow.com"],
  "frame-src": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};

export function buildCSPHeader(directives: CSPDirectives = defaultCSP): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

export function applyCSP(nonce?: string): CSPDirectives {
  const csp = { ...defaultCSP };

  if (nonce) {
    csp["script-src"] = ["'self'", `'nonce-${nonce}'`];
    csp["style-src"] = ["'self'", `'nonce-${nonce}'`];
  }

  return csp;
}
