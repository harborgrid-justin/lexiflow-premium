/**
 * Token policy configuration
 */

export interface TokenPolicy {
  accessTokenTTL: number; // milliseconds
  refreshTokenTTL: number; // milliseconds
  refreshThreshold: number; // milliseconds before expiry to refresh
  maxRefreshAttempts: number;
}

export const defaultTokenPolicy: TokenPolicy = {
  accessTokenTTL: 15 * 60 * 1000, // 15 minutes
  refreshTokenTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  refreshThreshold: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  maxRefreshAttempts: 3,
};
