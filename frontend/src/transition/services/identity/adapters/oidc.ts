/**
 * OIDC Adapter (Auth0, Okta, Entra)
 */

import type { User } from "../domain/user";

export interface OIDCConfig {
  authority: string;
  clientId: string;
  redirectUri: string;
  scope: string;
}

export interface OIDCTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export class OIDCAdapter {
  constructor(private config: OIDCConfig) {}

  async login(): Promise<OIDCTokens> {
    // Implement OIDC authorization code flow
    // Redirect to authorization endpoint
    const authUrl = new URL(`${this.config.authority}/authorize`);
    authUrl.searchParams.set("client_id", this.config.clientId);
    authUrl.searchParams.set("redirect_uri", this.config.redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", this.config.scope);

    window.location.href = authUrl.toString();

    // This will redirect, so the promise never resolves in this flow
    return new Promise(() => {});
  }

  async handleCallback(code: string): Promise<OIDCTokens> {
    // Exchange authorization code for tokens
    const response = await fetch(`${this.config.authority}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error("Token exchange failed");
    }

    return await response.json();
  }

  async getUserInfo(accessToken: string): Promise<User> {
    const response = await fetch(`${this.config.authority}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    const data = await response.json();

    // Map OIDC claims to User model
    return {
      id: data.sub,
      email: data.email,
      name: data.name,
      avatar: data.picture,
      roles: data.roles || [],
      permissions: data.permissions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async logout(idToken: string): Promise<void> {
    const logoutUrl = new URL(`${this.config.authority}/logout`);
    logoutUrl.searchParams.set("id_token_hint", idToken);
    logoutUrl.searchParams.set(
      "post_logout_redirect_uri",
      window.location.origin
    );

    window.location.href = logoutUrl.toString();
  }
}
