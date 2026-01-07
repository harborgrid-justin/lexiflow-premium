/**
 * URL Builder Utility
 */

export class UrlBuilder {
  constructor(
    private baseUrl: string,
    private apiPrefix: string
  ) {}

  /**
   * Get full base URL
   */
  getBaseUrl(): string {
    if (!this.baseUrl) {
      return this.apiPrefix;
    }

    if (this.baseUrl.endsWith(this.apiPrefix)) {
      return this.baseUrl;
    }

    return `${this.baseUrl.replace(/\/$/, "")}${this.apiPrefix}`;
  }

  /**
   * Build full URL from endpoint
   */
  buildUrl(endpoint: string): string {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    if (!baseUrl) {
      return cleanEndpoint;
    }

    return `${baseUrl}${cleanEndpoint}`;
  }

  /**
   * Build URL with query params
   */
  buildUrlWithParams(
    endpoint: string,
    params?: Record<string, string | number | boolean | null | undefined>
  ): string {
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(
          ([_, value]) => value !== undefined && value !== null
        ) as [string, string][]
      ).toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }
    return this.buildUrl(url);
  }

  /**
   * Update base URL
   */
  updateBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Update API prefix
   */
  updateApiPrefix(prefix: string): void {
    this.apiPrefix = prefix;
  }
}
