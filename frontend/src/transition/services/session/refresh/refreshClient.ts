/**
 * Client-side session refresh strategy
 */

import type { Session } from "../domain/session";

class RefreshClient {
  private refreshPromise: Promise<Session> | null = null;

  async refresh(): Promise<Session> {
    // Prevent concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();

    try {
      const session = await this.refreshPromise;
      return session;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<Session> {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return await response.json();
  }
}

export const refreshClient = new RefreshClient();
