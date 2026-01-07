/**
 * Memory-based session storage (for testing)
 */

import type { Session } from "../domain/session";

class MemorySession {
  private session: Session | null = null;

  get(): Session | null {
    return this.session;
  }

  set(session: Session): void {
    this.session = session;
  }

  clear(): void {
    this.session = null;
  }
}

export const memorySession = new MemorySession();
