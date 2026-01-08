/**
 * @module services/infrastructure/fileDownloadService
 * @category Infrastructure Services
 * @description Secure file download service with blob handling, progress tracking,
 * and automatic cleanup. Supports large files with streaming and provides
 * comprehensive error handling for production environments.
 *
 * @example
 * ```typescript
 * // Simple download
 * await FileDownloadService.downloadFile('/api/files/123', 'document.pdf');
 *
 * // With progress tracking
 * await FileDownloadService.downloadFile(
 *   '/api/files/123',
 *   'document.pdf',
 *   (progress) => console.log(`${progress}% complete`)
 * );
 * ```
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DownloadOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface DownloadResult {
  success: boolean;
  filename: string;
  size?: number;
  duration: number;
  error?: Error;
}

export interface BlobMetadata {
  filename: string;
  mimeType: string;
  size: number;
  lastModified?: Date;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class FileDownloadServiceClass {
  private downloads = new Map<string, AbortController>();

  /**
   * Downloads a file from the specified URL and triggers browser download
   */
  async downloadFile(
    url: string,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<DownloadResult> {
    const startTime = performance.now();
    const controller = new AbortController();
    const downloadId = `${url}-${Date.now()}`;

    this.downloads.set(downloadId, controller);

    try {
      // Fetch with streaming support
      const response = await fetch(url, {
        signal: controller.signal,
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(
          `Download failed: ${response.status} ${response.statusText}`
        );
      }

      // Get file size from headers
      const contentLength = response.headers.get("Content-Length");
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

      // Read response body with progress tracking
      const blob = await this.readStreamWithProgress(
        response.body!,
        totalSize,
        onProgress
      );

      // Trigger download
      this.triggerBrowserDownload(blob, filename);

      const duration = performance.now() - startTime;

      return {
        success: true,
        filename,
        size: blob.size,
        duration,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      const err = error instanceof Error ? error : new Error("Download failed");

      return {
        success: false,
        filename,
        duration,
        error: err,
      };
    } finally {
      this.downloads.delete(downloadId);
    }
  }

  /**
   * Downloads a file from backend API with authentication
   */
  async downloadFromBackend(
    endpoint: string,
    filename: string,
    options: DownloadOptions = {}
  ): Promise<DownloadResult> {
    const { onProgress, onError, signal, headers = {} } = options;
    const startTime = performance.now();

    const controller = signal ? new AbortController() : new AbortController();
    if (signal) {
      signal.addEventListener("abort", () => controller.abort());
    }

    try {
      // Build API URL
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const url = `${baseUrl}${endpoint}`;

      // Get auth token from localStorage
      const token = this.getAuthToken();

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          ...headers,
        },
        signal: controller.signal,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Download failed: ${response.status} ${response.statusText}`
        );
      }

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition");
      const extractedFilename =
        this.extractFilename(contentDisposition) || filename;

      const contentLength = response.headers.get("Content-Length");
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

      const blob = await this.readStreamWithProgress(
        response.body!,
        totalSize,
        onProgress
      );

      this.triggerBrowserDownload(blob, extractedFilename);

      const duration = performance.now() - startTime;

      return {
        success: true,
        filename: extractedFilename,
        size: blob.size,
        duration,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      const err = error instanceof Error ? error : new Error("Download failed");

      if (onError) {
        onError(err);
      }

      return {
        success: false,
        filename,
        duration,
        error: err,
      };
    }
  }

  /**
   * Downloads file as blob for programmatic use (no browser download)
   */
  async fetchFileAsBlob(url: string, signal?: AbortSignal): Promise<Blob> {
    const response = await fetch(url, {
      signal,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        `Fetch failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.blob();
  }

  /**
   * Downloads file and returns as base64 string
   */
  async fetchFileAsBase64(url: string, signal?: AbortSignal): Promise<string> {
    const blob = await this.fetchFileAsBlob(url, signal);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Downloads file and returns as ArrayBuffer
   */
  async fetchFileAsArrayBuffer(
    url: string,
    signal?: AbortSignal
  ): Promise<ArrayBuffer> {
    const blob = await this.fetchFileAsBlob(url, signal);
    return await blob.arrayBuffer();
  }

  /**
   * Creates a temporary object URL from blob (must be revoked manually)
   */
  createObjectURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Revokes an object URL to free memory
   */
  revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Downloads multiple files as a ZIP archive
   */
  async downloadMultipleAsZip(
    files: Array<{ url: string; filename: string }>,
    zipFilename: string,
    onProgress?: (progress: number) => void
  ): Promise<DownloadResult> {
    // For production, this would use a ZIP library like JSZip
    // For now, we'll download files sequentially
    const startTime = performance.now();

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        await this.downloadFile(file.url, file.filename);

        if (onProgress) {
          const progress = ((i + 1) / files.length) * 100;
          onProgress(Math.round(progress));
        }
      }

      const duration = performance.now() - startTime;

      return {
        success: true,
        filename: zipFilename,
        duration,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      const err =
        error instanceof Error ? error : new Error("Multi-download failed");

      return {
        success: false,
        filename: zipFilename,
        duration,
        error: err,
      };
    }
  }

  /**
   * Cancels an ongoing download
   */
  cancelDownload(downloadId: string): void {
    const controller = this.downloads.get(downloadId);
    if (controller) {
      controller.abort();
      this.downloads.delete(downloadId);
    }
  }

  /**
   * Cancels all ongoing downloads
   */
  cancelAllDownloads(): void {
    for (const controller of this.downloads.values()) {
      controller.abort();
    }
    this.downloads.clear();
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Reads a stream with progress tracking
   */
  private async readStreamWithProgress(
    stream: ReadableStream<Uint8Array>,
    totalSize: number,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let receivedSize = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedSize += value.length;

        if (onProgress && totalSize > 0) {
          const progress = Math.round((receivedSize / totalSize) * 100);
          onProgress(progress);
        }
      }

      return new Blob(chunks as BlobPart[]);
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Triggers browser download of blob
   */
  private triggerBrowserDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Extracts filename from Content-Disposition header
   */
  private extractFilename(contentDisposition: string | null): string | null {
    if (!contentDisposition) return null;

    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDisposition);

    if (matches != null && matches[1]) {
      const filename = matches[1].replace(/['"]/g, "");
      return decodeURIComponent(filename);
    }

    return null;
  }

  /**
   * Gets authentication token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      // Try localStorage first
      const token = localStorage.getItem("auth_token");
      if (token) return token;

      // Try sessionStorage as fallback
      return sessionStorage.getItem("auth_token");
    } catch (error) {
      console.warn("Failed to retrieve auth token:", error);
      return null;
    }
  }

  /**
   * Validates file size before download
   */
  validateFileSize(size: number, maxSizeMB: number = 100): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return size <= maxBytes;
  }

  /**
   * Formats file size for display
   */
  formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Gets MIME type from file extension
   */
  getMimeType(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      csv: "text/csv",
      json: "application/json",
      xml: "application/xml",
      zip: "application/zip",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      svg: "image/svg+xml",
      mp4: "video/mp4",
      mp3: "audio/mpeg",
      wav: "audio/wav",
    };

    return mimeTypes[extension || ""] || "application/octet-stream";
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const FileDownloadService = new FileDownloadServiceClass();
