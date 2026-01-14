import { BaseService } from "../core/BaseService";
import { ServiceError } from "../core/ServiceRegistry";

/**
 * ENTERPRISE REACT SERVICE: SessionService
 *
 * ROLE: Browser session lifecycle and cross-tab coordination
 * SCOPE: Session storage, tab visibility, beforeunload
 * STATE: Ephemeral (tab-scoped)
 * DEPENDENCIES: Browser Session Storage, Visibility API
 */

export interface SessionEvent {
  type: "visible" | "hidden" | "beforeunload" | "storage";
  timestamp: number;
  data?: unknown;
}

export type SessionListener = (event: SessionEvent) => void;

export interface SessionService {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  clear(): void;
  isVisible(): boolean;
  addListener(listener: SessionListener): () => void;
}

export class BrowserSessionService
  extends BaseService
  implements SessionService
{
  private listeners: Set<SessionListener> = new Set();
  private visibilityHandler?: () => void;
  private beforeUnloadHandler?: (e: BeforeUnloadEvent) => void;
  private storageHandler?: (e: StorageEvent) => void;

  constructor() {
    super("SessionService");
  }

  override async start(): Promise<void> {
    await super.start();

    // Visibility change listener
    this.visibilityHandler = () => {
      const event: SessionEvent = {
        type: document.hidden ? "hidden" : "visible",
        timestamp: Date.now(),
      };
      this.notifyListeners(event);
    };
    document.addEventListener("visibilitychange", this.visibilityHandler);

    // Before unload listener
    this.beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      const event: SessionEvent = {
        type: "beforeunload",
        timestamp: Date.now(),
      };
      this.notifyListeners(event);
    };
    window.addEventListener("beforeunload", this.beforeUnloadHandler);

    // Storage listener (cross-tab)
    this.storageHandler = (e: StorageEvent) => {
      const event: SessionEvent = {
        type: "storage",
        timestamp: Date.now(),
        data: { key: e.key, newValue: e.newValue, oldValue: e.oldValue },
      };
      this.notifyListeners(event);
    };
    window.addEventListener("storage", this.storageHandler);
  }

  override async stop(): Promise<void> {
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
    }
    if (this.beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this.beforeUnloadHandler);
    }
    if (this.storageHandler) {
      window.removeEventListener("storage", this.storageHandler);
    }
    this.listeners.clear();
    await super.stop();
  }

  setItem(key: string, value: string): void {
    this.ensureStarted();
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      throw new ServiceError(
        "SessionService",
        "WRITE_FAILED",
        error instanceof Error
          ? error.message
          : "Failed to write to session storage"
      );
    }
  }

  getItem(key: string): string | null {
    this.ensureStarted();
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      throw new ServiceError(
        "SessionService",
        "READ_FAILED",
        error instanceof Error
          ? error.message
          : "Failed to read from session storage"
      );
    }
  }

  removeItem(key: string): void {
    this.ensureStarted();
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      throw new ServiceError(
        "SessionService",
        "DELETE_FAILED",
        error instanceof Error
          ? error.message
          : "Failed to remove from session storage"
      );
    }
  }

  clear(): void {
    this.ensureStarted();
    try {
      sessionStorage.clear();
    } catch (error) {
      throw new ServiceError(
        "SessionService",
        "CLEAR_FAILED",
        error instanceof Error
          ? error.message
          : "Failed to clear session storage"
      );
    }
  }

  isVisible(): boolean {
    return !document.hidden;
  }

  addListener(listener: SessionListener): () => void {
    this.ensureStarted();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(event: SessionEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("[SessionService] Listener error:", error);
      }
    });
  }
}
