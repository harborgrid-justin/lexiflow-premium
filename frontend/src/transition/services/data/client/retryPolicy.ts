/**
 * Retry policy configuration
 */

export const retryPolicy = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds

  getDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    const delay = this.baseDelay * Math.pow(2, attempt - 1);
    return Math.min(delay, this.maxDelay);
  },

  shouldRetry(error: any): boolean {
    // Retry on network errors or 5xx status codes
    if (error.name === "NetworkError") return true;
    if (error.status >= 500 && error.status < 600) return true;
    return false;
  },
};
