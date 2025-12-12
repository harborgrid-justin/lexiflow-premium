/**
 * OCR Service - Client-side OCR Processing API
 * Handles all OCR-related API calls and processing
 */

export interface OcrJobOptions {
  language?: string;
  preprocessingEnabled?: boolean;
  postprocessingEnabled?: boolean;
  entityExtractionEnabled?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface OcrResult {
  text: string;
  confidence: number;
  pages: OcrPageResult[];
  processingTime: number;
  metadata: {
    language: string;
    totalWords: number;
    totalLines: number;
    averageConfidence: number;
  };
  entities?: ExtractedEntities;
  warnings: string[];
}

export interface OcrPageResult {
  pageNumber: number;
  text: string;
  confidence: number;
  words: OcrWord[];
  lines: OcrLine[];
}

export interface OcrWord {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface OcrLine {
  text: string;
  confidence: number;
  words: OcrWord[];
  bbox: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedEntities {
  parties: Array<{
    name: string;
    type: 'person' | 'organization' | 'government';
    role?: string;
    position: number;
  }>;
  dates: Array<{
    date: string;
    type: string;
    position: number;
  }>;
  amounts: Array<{
    amount: number;
    currency: string;
    type: string;
    position: number;
  }>;
  locations: Array<{
    location: string;
    type: string;
    position: number;
  }>;
  caseNumbers: Array<{
    caseNumber: string;
    position: number;
  }>;
}

export interface OcrJobStatus {
  jobId: string;
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedCompletion?: Date;
  result?: OcrResult;
  error?: string;
}

class OcrServiceClass {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  /**
   * Submit document for OCR processing
   */
  async processDocument(
    documentId: string,
    options?: OcrJobOptions,
  ): Promise<{ jobId: string; status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error(`OCR processing failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OCR processing error:', error);
      throw error;
    }
  }

  /**
   * Upload and process file directly
   */
  async uploadAndProcess(
    file: File,
    options?: OcrJobOptions,
  ): Promise<{ jobId: string; documentId: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options || {}));

      const response = await fetch(`${this.baseUrl}/ocr/upload-and-process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload and OCR failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload and OCR error:', error);
      throw error;
    }
  }

  /**
   * Get OCR job status
   */
  async getJobStatus(jobId: string): Promise<OcrJobStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/jobs/${jobId}`);

      if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get job status error:', error);
      throw error;
    }
  }

  /**
   * Poll job status until completion
   */
  async waitForCompletion(
    jobId: string,
    onProgress?: (status: OcrJobStatus) => void,
    pollInterval: number = 2000,
  ): Promise<OcrResult> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getJobStatus(jobId);

          onProgress?.(status);

          if (status.status === 'completed') {
            if (status.result) {
              resolve(status.result);
            } else {
              reject(new Error('OCR completed but no result available'));
            }
            return;
          }

          if (status.status === 'failed') {
            reject(new Error(status.error || 'OCR processing failed'));
            return;
          }

          // Continue polling
          setTimeout(poll, pollInterval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Get OCR result for document
   */
  async getDocumentOcrResult(documentId: string): Promise<OcrResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${documentId}/ocr`);

      if (response.status === 404) {
        return null; // No OCR results available
      }

      if (!response.ok) {
        throw new Error(`Failed to get OCR result: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get OCR result error:', error);
      throw error;
    }
  }

  /**
   * Batch process multiple documents
   */
  async processBatch(
    documentIds: string[],
    options?: OcrJobOptions,
  ): Promise<{ jobIds: string[]; batchId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Batch OCR failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Batch OCR error:', error);
      throw error;
    }
  }

  /**
   * Get batch status
   */
  async getBatchStatus(batchId: string): Promise<{
    batchId: string;
    totalJobs: number;
    completed: number;
    failed: number;
    pending: number;
    jobs: OcrJobStatus[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/batch/${batchId}`);

      if (!response.ok) {
        throw new Error(`Failed to get batch status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get batch status error:', error);
      throw error;
    }
  }

  /**
   * Retry failed OCR job
   */
  async retryJob(jobId: string): Promise<{ jobId: string; status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/jobs/${jobId}/retry`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to retry job: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Retry job error:', error);
      throw error;
    }
  }

  /**
   * Cancel ongoing OCR job
   */
  async cancelJob(jobId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/jobs/${jobId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel job: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cancel job error:', error);
      throw error;
    }
  }

  /**
   * Validate OCR quality
   */
  async validateQuality(result: OcrResult): Promise<{
    isValid: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result }),
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Validate quality error:', error);
      throw error;
    }
  }

  /**
   * Extract entities from text
   */
  async extractEntities(text: string): Promise<ExtractedEntities> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/extract-entities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Entity extraction failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Extract entities error:', error);
      throw error;
    }
  }

  /**
   * Search within OCR text
   */
  async searchInDocument(
    documentId: string,
    searchQuery: string,
  ): Promise<Array<{ match: string; position: number; context: string }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/documents/${documentId}/ocr/search?q=${encodeURIComponent(searchQuery)}`,
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search in document error:', error);
      throw error;
    }
  }

  /**
   * Export OCR result to various formats
   */
  async exportResult(
    documentId: string,
    format: 'txt' | 'json' | 'pdf' | 'docx',
  ): Promise<Blob> {
    try {
      const response = await fetch(
        `${this.baseUrl}/documents/${documentId}/ocr/export?format=${format}`,
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Export result error:', error);
      throw error;
    }
  }

  /**
   * Get OCR statistics for monitoring
   */
  async getStatistics(): Promise<{
    totalProcessed: number;
    averageConfidence: number;
    averageProcessingTime: number;
    successRate: number;
    queueLength: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/statistics`);

      if (!response.ok) {
        throw new Error(`Failed to get statistics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/ocr/languages`);

      if (!response.ok) {
        throw new Error(`Failed to get languages: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get languages error:', error);
      throw error;
    }
  }

  /**
   * Update OCR settings for a document
   */
  async updateSettings(
    documentId: string,
    settings: {
      language?: string;
      enablePostprocessing?: boolean;
      enableEntityExtraction?: boolean;
    },
  ): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${documentId}/ocr/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  }

  /**
   * Download original vs OCR comparison
   */
  async getComparisonPdf(documentId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${documentId}/ocr/comparison`);

      if (!response.ok) {
        throw new Error(`Failed to get comparison: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Get comparison error:', error);
      throw error;
    }
  }
}

export const ocrService = new OcrServiceClass();
export default ocrService;
