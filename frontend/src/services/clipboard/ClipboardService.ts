import { BaseService } from "../core/BaseService";
import { ServiceError } from "../core/ServiceRegistry";

/**
 * ENTERPRISE REACT SERVICE: ClipboardService
 *
 * ROLE: Browser clipboard capability wrapper
 * SCOPE: Imperative clipboard operations
 * STATE: Stateless
 * DEPENDENCIES: Navigator Clipboard API
 */

export interface ClipboardService {
  copy(text: string): Promise<void>;
  paste(): Promise<string>;
  isSupported(): boolean;
}

export class BrowserClipboardService
  extends BaseService
  implements ClipboardService
{
  private supported: boolean = false;

  constructor() {
    super("ClipboardService");
  }

  override async configure(): Promise<void> {
    this.supported = !!navigator.clipboard;
    if (!this.supported) {
      console.warn("[ClipboardService] Clipboard API not supported");
    }
  }

  async copy(text: string): Promise<void> {
    this.ensureStarted();

    if (!this.supported) {
      throw new ServiceError(
        "ClipboardService",
        "UNSUPPORTED",
        "Clipboard API not available"
      );
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      throw new ServiceError(
        "ClipboardService",
        "WRITE_FAILED",
        error instanceof Error ? error.message : "Failed to write to clipboard"
      );
    }
  }

  async paste(): Promise<string> {
    this.ensureStarted();

    if (!this.supported) {
      throw new ServiceError(
        "ClipboardService",
        "UNSUPPORTED",
        "Clipboard API not available"
      );
    }

    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      throw new ServiceError(
        "ClipboardService",
        "READ_FAILED",
        error instanceof Error ? error.message : "Failed to read from clipboard"
      );
    }
  }

  isSupported(): boolean {
    return this.supported;
  }
}
