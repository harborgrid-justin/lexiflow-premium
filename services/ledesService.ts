import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LEDESGenerationResponse {
  success: boolean;
  content: string;
  format: string;
  recordCount: number;
}

export interface LEDESValidationResponse {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldErrors: Record<string, string[]>;
}

export interface EBillingSubmission {
  id: string;
  platform: string;
  status: string;
  platformReferenceId?: string;
  submissionDate: string;
}

class LEDESService {
  /**
   * Generate LEDES file for invoice
   */
  async generateLEDES(
    invoiceId: string,
    format: 'LEDES_1998B' | 'LEDES_2000' = 'LEDES_1998B'
  ): Promise<LEDESGenerationResponse> {
    const response = await axios.post(`${API_BASE}/api/billing/ledes/generate`, {
      invoiceId,
      format,
    });
    return response.data;
  }

  /**
   * Validate LEDES file
   */
  async validateLEDES(
    invoiceId: string,
    format: 'LEDES_1998B' | 'LEDES_2000' = 'LEDES_1998B'
  ): Promise<LEDESValidationResponse> {
    const response = await axios.post(`${API_BASE}/api/billing/ledes/validate`, {
      invoiceId,
      format,
    });
    return response.data;
  }

  /**
   * Validate LEDES file content
   */
  async validateLEDESContent(
    content: string,
    format: 'LEDES_1998B' | 'LEDES_2000' = 'LEDES_1998B'
  ): Promise<LEDESValidationResponse> {
    const response = await axios.post(`${API_BASE}/api/billing/ledes/validate-content`, {
      content,
      format,
    });
    return response.data;
  }

  /**
   * Submit to e-billing platform
   */
  async submitToEBilling(invoiceId: string, platform: string): Promise<EBillingSubmission> {
    const response = await axios.post(`${API_BASE}/api/billing/ledes/submit`, {
      invoiceId,
      platform,
    });
    return response.data;
  }

  /**
   * Get submission status
   */
  async getSubmissionStatus(submissionId: string): Promise<EBillingSubmission> {
    const response = await axios.get(`${API_BASE}/api/billing/ledes/submissions/${submissionId}`);
    return response.data;
  }

  /**
   * Get platform requirements
   */
  async getPlatformRequirements(platform: string): Promise<any> {
    const response = await axios.get(`${API_BASE}/api/billing/ledes/platforms/${platform}`);
    return response.data;
  }

  /**
   * Test platform connection
   */
  async testPlatformConnection(platform: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(`${API_BASE}/api/billing/ledes/test-connection`, {
      platform,
    });
    return response.data;
  }

  /**
   * Batch generate LEDES for multiple invoices
   */
  async batchGenerateLEDES(
    invoiceIds: string[],
    format: 'LEDES_1998B' | 'LEDES_2000' = 'LEDES_1998B'
  ): Promise<Map<string, LEDESGenerationResponse>> {
    const response = await axios.post(`${API_BASE}/api/billing/ledes/batch-generate`, {
      invoiceIds,
      format,
    });
    return new Map(Object.entries(response.data));
  }

  /**
   * Get LEDES templates
   */
  async getLEDESTemplates(): Promise<any> {
    const response = await axios.get(`${API_BASE}/api/billing/ledes/templates`);
    return response.data;
  }

  /**
   * Get UTBMS codes
   */
  async getUTBMSCodes(type: 'task' | 'activity' | 'expense'): Promise<Record<string, string>> {
    const response = await axios.get(`${API_BASE}/api/billing/ledes/utbms-codes/${type}`);
    return response.data;
  }
}

export const ledesService = new LEDESService();
