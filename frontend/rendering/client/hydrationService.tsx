/**
 * Hydration Service
 *
 * Handles client-side hydration of server-rendered React applications.
 * Ensures smooth transition from SSR to client-side interactivity.
 *
 * @module rendering/client/hydrationService
 */

import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import type { ReactElement } from "react";

export interface HydrationConfig {
  /** Whether to wrap in StrictMode */
  strictMode: boolean;
  /** Custom error handler for hydration errors */
  onHydrationError?: (error: unknown) => void;
  /** Callback when hydration completes */
  onHydrationComplete?: () => void;
}

export class HydrationService {
  private config: HydrationConfig;
  private isHydrated = false;

  constructor(config: Partial<HydrationConfig> = {}) {
    this.config = {
      strictMode: config.strictMode ?? true,
      onHydrationError: config.onHydrationError,
      onHydrationComplete: config.onHydrationComplete,
    };
  }

  /**
   * Hydrates the application root with a React Router app
   *
   * @param rootElement - The React element to hydrate (typically <HydratedRouter />)
   */
  hydrate(rootElement: ReactElement): void {
    if (this.isHydrated) {
      console.warn("[HydrationService] Application is already hydrated");
      return;
    }

    try {
      startTransition(() => {
        const element = this.config.strictMode ? (
          <StrictMode>{rootElement}</StrictMode>
        ) : (
          rootElement
        );

        hydrateRoot(document, element, {
          onRecoverableError: (error) => {
            // Only log recoverable errors in development if they're not Suspense hydration issues
            if (process.env.NODE_ENV === "development") {
              const errorMessage = error instanceof Error ? error.message : String(error);
              // Suppress common Suspense hydration warnings
              if (errorMessage.includes("Suspense boundary received an update before it finished hydrating")) {
                // This is expected behavior in React 18 - no action needed
                return;
              }
              console.error("[HydrationService] Recoverable error:", error);
            }
            this.config.onHydrationError?.(error);
          },
        });

        this.isHydrated = true;
        this.config.onHydrationComplete?.();
      });
    } catch (error) {
      console.error("[HydrationService] Fatal hydration error:", error);
      this.config.onHydrationError?.(error);
      throw error;
    }
  }

  /**
   * Returns whether the app has been hydrated
   */
  getIsHydrated(): boolean {
    return this.isHydrated;
  }

  /**
   * Updates the configuration
   */
  updateConfig(config: Partial<HydrationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Default hydration service instance
 */
export const hydrationService = new HydrationService();
