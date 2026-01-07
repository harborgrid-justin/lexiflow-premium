/**
 * Server-side session refresh strategy
 * Handles token refresh during SSR
 */

import type { Session } from "../domain/session";

export async function refreshServer(refreshToken: string): Promise<Session> {
  // Server-side refresh logic
  // This would typically validate the refresh token and issue new tokens

  const response = await fetch("https://api.lexiflow.com/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Server token refresh failed");
  }

  return await response.json();
}
