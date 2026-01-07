/**
 * HTTP utilities
 */

export async function http<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }

  return await response.json();
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string
  ) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = "HttpError";
  }
}

export const httpGet = <T>(url: string, options?: RequestInit) =>
  http<T>(url, { ...options, method: "GET" });

export const httpPost = <T>(url: string, body: any, options?: RequestInit) =>
  http<T>(url, { ...options, method: "POST", body: JSON.stringify(body) });

export const httpPut = <T>(url: string, body: any, options?: RequestInit) =>
  http<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) });

export const httpPatch = <T>(url: string, body: any, options?: RequestInit) =>
  http<T>(url, { ...options, method: "PATCH", body: JSON.stringify(body) });

export const httpDelete = <T>(url: string, options?: RequestInit) =>
  http<T>(url, { ...options, method: "DELETE" });
