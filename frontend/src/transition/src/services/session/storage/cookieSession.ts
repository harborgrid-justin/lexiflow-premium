/**
 * Cookie-based session storage
 */

import {
  deleteCookie,
  getCookie,
  setCookie,
} from "../../../platform/security/storage/secureCookies";
import type { Session } from "../domain/session";

const SESSION_COOKIE_NAME = "session";

class CookieSession {
  get(): Session | null {
    const sessionData = getCookie(SESSION_COOKIE_NAME);
    if (!sessionData) return null;

    try {
      return JSON.parse(sessionData);
    } catch (error) {
      console.error("Failed to parse session cookie:", error);
      return null;
    }
  }

  set(session: Session): void {
    const expiresAt = new Date(session.expiresAt);

    setCookie(SESSION_COOKIE_NAME, JSON.stringify(session), {
      expires: expiresAt,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }

  clear(): void {
    deleteCookie(SESSION_COOKIE_NAME);
  }
}

export const cookieSession = new CookieSession();
