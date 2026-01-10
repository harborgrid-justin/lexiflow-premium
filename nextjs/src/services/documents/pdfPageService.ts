/**
 * @module services/documents/pdfPageService
 * @category Document Services
 * @description Production PDF page service using pdfjs-dist for accurate page counting,
 * metadata extraction, and page operations. Supports both local files and remote URLs.
 *
 * @example
 * ```typescript
 * const pageCount = await PDFPageService.getPageCount('/documents/file.pdf');
 * const metadata = await PDFPageService.getMetadata(pdfUrl);
 * ```
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PDFMetadata {
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pdfVersion?: string;
  fileSize?: number;
}

export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PDFLoadOptions {
  cacheKey?: string;
  withMetadata?: boolean;
  signal?: AbortSignal;
}

export interface PDFPageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

interface PDFPageProxy {
  getViewport(params: { scale: number; rotation?: number }): {
    width: number;
    height: number;
    viewBox: number[];
  };
  getTextContent(): Promise<{ items: Array<{ str: string }> }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render(params: any): any;
}

interface PDFDocumentProxy {
  numPages: number;
  getPage(num: number): Promise<PDFPageProxy>;
  destroy(): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getData(): Promise<any>;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class PDFPageServiceClass {
  private pdfCache = new Map<string, PDFDocumentProxy>();
  private metadataCache = new Map<string, PDFMetadata>();
  private readonly CACHE_DURATION = 300000; // 5 minutes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pdfjsLib: any = null;

  /**
   * Lazy-loads pdfjs-dist library
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async loadPDFJS(): Promise<any> {
    if (this.pdfjsLib) return this.pdfjsLib;

    try {
      // Dynamic import for code splitting
      const pdfjs = await import("pdfjs-dist");

      // Set worker path for Next.js
      if (typeof window !== "undefined") {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      }

      this.pdfjsLib = pdfjs;
      return pdfjs;
    } catch (error) {
      console.error("Failed to load pdfjs-dist:", error);
      throw new Error("PDF library not available");
    }
  }

  /**
   * Gets total page count for a PDF document
   */
  async getPageCount(
    url: string,
    options: PDFLoadOptions = {}
  ): Promise<number> {
    const { cacheKey = url } = options;

    // Check cache first
    const cached = this.metadataCache.get(cacheKey);
    if (cached) {
      return cached.pageCount;
    }

    try {
      const pdfDoc = await this.loadPDFDocument(url, options);
      const pageCount = pdfDoc.numPages;

      // Cache result
      this.metadataCache.set(cacheKey, {
        pageCount,
      });

      return pageCount;
    } catch (error) {
      console.error("Failed to get page count:", error);
      throw error;
    }
  }

  /**
   * Gets comprehensive PDF metadata
   */
  async getMetadata(
    url: string,
    options: PDFLoadOptions = {}
  ): Promise<PDFMetadata> {
    const { cacheKey = url } = options;

    // Check cache first
    const cached = this.metadataCache.get(cacheKey);
    if (cached && cached.title !== undefined) {
      return cached;
    }

    try {
      const pdfDoc = await this.loadPDFDocument(url, options);
      const metadata = await pdfDoc.getMetadata();
      const info = metadata.info;

      const pdfMetadata: PDFMetadata = {
        pageCount: pdfDoc.numPages,
        title: info.Title || undefined,
        author: info.Author || undefined,
        subject: info.Subject || undefined,
        keywords: info.Keywords || undefined,
        creator: info.Creator || undefined,
        producer: info.Producer || undefined,
        pdfVersion: metadata.metadata?.get("pdf:PDFVersion"),
        creationDate: this.parsePDFDate(info.CreationDate),
        modificationDate: this.parsePDFDate(info.ModDate),
      };

      // Cache result
      this.metadataCache.set(cacheKey, pdfMetadata);

      return pdfMetadata;
    } catch (error) {
      console.error("Failed to get metadata:", error);
      throw error;
    }
  }

  /**
   * Gets information about a specific page
   */
  async getPageInfo(
    url: string,
    pageNumber: number,
    options: PDFLoadOptions = {}
  ): Promise<PDFPageInfo> {
    try {
      const pdfDoc = await this.loadPDFDocument(url, options);

      if (pageNumber < 1 || pageNumber > pdfDoc.numPages) {
        throw new Error(`Invalid page number: ${pageNumber}`);
      }

      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.0 });

      return {
        pageNumber,
        width: viewport.width,
        height: viewport.height,
        rotation: viewport.rotation,
      };
    } catch (error) {
      console.error("Failed to get page info:", error);
      throw error;
    }
  }

  /**
   * Gets dimensions for all pages
   */
  async getAllPageDimensions(
    url: string,
    options: PDFLoadOptions = {}
  ): Promise<PDFPageDimensions[]> {
    try {
      const pdfDoc = await this.loadPDFDocument(url, options);
      const dimensions: PDFPageDimensions[] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });

        dimensions.push({
          width: viewport.width,
          height: viewport.height,
          aspectRatio: viewport.width / viewport.height,
        });

        // Yield every 10 pages
        if (i % 10 === 0) {
          await this.yieldToMain();
        }
      }

      return dimensions;
    } catch (error) {
      console.error("Failed to get page dimensions:", error);
      throw error;
    }
  }

  /**
   * Extracts text from a specific page
   */
  async extractPageText(
    url: string,
    pageNumber: number,
    options: PDFLoadOptions = {}
  ): Promise<string> {
    try {
      const pdfDoc = await this.loadPDFDocument(url, options);

      if (pageNumber < 1 || pageNumber > pdfDoc.numPages) {
        throw new Error(`Invalid page number: ${pageNumber}`);
      }
      {
        str: string;
      }
      const page = await pdfDoc.getPage(pageNumber);
      const textContent = await page.getTextContent();

      return textContent.items.map((item: any) => item.str).join(" ");
    } catch (error) {
      console.error("Failed to extract page text:", error);
      throw error;
    }
  }

  /**
   * Extracts text from all pages
   */
  async extractAllText(
    url: string,
    options: PDFLoadOptions = {},
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    try {
      const pdfDoc = await this.loadPDFDocument(url, options);
      const texts: string[] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: { str: string }) => item.str)
          .join(" ");
        texts.push(pageText);

        if (onProgress) {
          onProgress(i, pdfDoc.numPages);
        }

        // Yield every 5 pages
        if (i % 5 === 0) {
          await this.yieldToMain();
        }
      }

      return texts;
    } catch (error) {
      console.error("Failed to extract all text:", error);
      throw error;
    }
  }

  /**
   * Validates if a file is a valid PDF
   */
  async validatePDF(url: string): Promise<boolean> {
    try {
      const pdfDoc = await this.loadPDFDocument(url);
      return pdfDoc.numPages > 0;
    } catch {
      return false;
    }
  }

  /**
   * Gets file size estimate in bytes
   */
  async getFileSize(url: string): Promise<number> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentLength = response.headers.get("Content-Length");
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Clears all caches
   */
  clearCache(): void {
    this.pdfCache.clear();
    this.metadataCache.clear();
  }

  /**
   * Clears cache for specific document
   */
  clearDocumentCache(cacheKey: string): void {
    this.pdfCache.delete(cacheKey);
    this.metadataCache.delete(cacheKey);
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Loads a PDF document with caching
   */
  private async loadPDFDocument(
    url: string,
    options: PDFLoadOptions = {}
  ): Promise<PDFDocumentProxy> {
    const { cacheKey = url, signal } = options;

    // Check cache
    const cached = this.pdfCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Load pdfjs library
    const pdfjs = await this.loadPDFJS();

    try {
      // Load document
      const loadingTask = pdfjs.getDocument({
        url,
        withCredentials: true,
      });

      // Handle abort signal
      if (signal) {
        signal.addEventListener("abort", () => {
          loadingTask.destroy();
        });
      }

      const pdfDoc = await loadingTask.promise;

      // Cache document
      this.pdfCache.set(cacheKey, pdfDoc);

      // Auto-cleanup cache after duration
      setTimeout(() => {
        this.clearDocumentCache(cacheKey);
      }, this.CACHE_DURATION);

      return pdfDoc;
    } catch (error) {
      console.error("Failed to load PDF document:", error);
      throw error;
    }
  }

  /**
   * Parses PDF date format to JavaScript Date
   */
  private parsePDFDate(dateString?: string): Date | undefined {
    if (!dateString) return undefined;

    // PDF date format: D:YYYYMMDDHHmmSSOHH'mm'
    const match = dateString.match(
      /^D:(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/
    );

    if (!match) return undefined;

    const [, year, month, day, hour = "00", minute = "00", second = "00"] =
      match;

    return new Date(
      parseInt(year || "1970", 10),
      parseInt(month || "1", 10) - 1,
      parseInt(day || "1", 10),
      parseInt(hour || "0", 10),
      parseInt(minute || "0", 10),
      parseInt(second || "0", 10)
    );
  }

  /**
   * Yields to main thread for UI responsiveness
   */
  private async yieldToMain(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  /**
   * Formats file size for display
   */
  formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Checks if PDF has text layer (searchable)
   */
  async hasTextLayer(
    url: string,
    options: PDFLoadOptions = {}
  ): Promise<boolean> {
    try {
      const text = await this.extractPageText(url, 1, options);
      return text.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Gets average page size
   */
  async getAveragePageSize(
    url: string,
    options: PDFLoadOptions = {}
  ): Promise<PDFPageDimensions> {
    try {
      const dimensions = await this.getAllPageDimensions(url, options);

      if (dimensions.length === 0) {
        throw new Error("No pages found");
      }

      const totalWidth = dimensions.reduce((sum, d) => sum + d.width, 0);
      const totalHeight = dimensions.reduce((sum, d) => sum + d.height, 0);

      const avgWidth = totalWidth / dimensions.length;
      const avgHeight = totalHeight / dimensions.length;

      return {
        width: avgWidth,
        height: avgHeight,
        aspectRatio: avgWidth / avgHeight,
      };
    } catch (error) {
      console.error("Failed to get average page size:", error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const PDFPageService = new PDFPageServiceClass();
