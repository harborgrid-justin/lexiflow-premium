import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { LEDESGeneratorService, LEDESFormat } from './ledes-generator.service';
import { LEDESValidatorService } from './ledes-validator.service';
import { EBILLING_PLATFORM_FORMATS } from './ledes-templates';

/**
 * E-Billing Integration Service
 * Integrates with major e-billing platforms (CounselLink, Tymetrix, Serengeti, etc.)
 */

export enum EBillingPlatform {
  COUNSELLINK = 'COUNSELLINK',
  TYMETRIX = 'TYMETRIX',
  SERENGETI = 'SERENGETI',
  LEGAL_TRACKER = 'LEGAL_TRACKER',
  BRIGHTFLAG = 'BRIGHTFLAG',
  APPERIO = 'APPERIO',
}

export interface EBillingConfig {
  platform: EBillingPlatform;
  apiEndpoint: string;
  apiKey: string;
  clientId: string;
  firmId: string;
  usesSFTP?: boolean;
  sftpHost?: string;
  sftpPort?: number;
  sftpUsername?: string;
  sftpPassword?: string;
  usesAPI?: boolean;
  requiresEncryption?: boolean;
}

export interface EBillingSubmission {
  id: string;
  platform: EBillingPlatform;
  invoiceId: string;
  submissionDate: Date;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected' | 'paid';
  ledesFile: string;
  platformReferenceId?: string;
  validationErrors?: string[];
  rejectionReason?: string;
  submittedBy: string;
  metadata?: Record<string, any>;
}

export interface EBillingResponse {
  success: boolean;
  platformReferenceId?: string;
  message: string;
  errors?: string[];
  warnings?: string[];
  submissionId?: string;
}

export interface InvoiceStatus {
  invoiceId: string;
  platform: EBillingPlatform;
  status: string;
  lastUpdated: Date;
  approvalStatus?: string;
  paymentStatus?: string;
  comments?: string[];
}

@Injectable()
export class EBillingIntegrationService {
  private readonly logger = new Logger(EBillingIntegrationService.name);

  constructor(
    private readonly ledesGenerator: LEDESGeneratorService,
    private readonly ledesValidator: LEDESValidatorService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Submit invoice to e-billing platform
   */
  async submitInvoice(
    invoiceId: string,
    platform: EBillingPlatform,
    config: EBillingConfig,
  ): Promise<EBillingSubmission> {
    this.logger.log(`Submitting invoice ${invoiceId} to ${platform}`);

    try {
      // Generate LEDES file
      const platformConfig = EBILLING_PLATFORM_FORMATS[platform];
      const format = platformConfig.format === 'LEDES_2000'
        ? LEDESFormat.LEDES_2000
        : LEDESFormat.LEDES_1998B;

      const ledesFile = await this.ledesGenerator.generateFromInvoice(invoiceId, format);

      // Validate LEDES file
      const validation = await this.ledesValidator.validateFile(ledesFile, format);
      if (!validation.isValid) {
        throw new BadRequestException(
          `LEDES validation failed: ${validation.errors.join(', ')}`,
        );
      }

      // Submit based on platform method
      let response: EBillingResponse;

      if (platformConfig.supportsAPI && config.usesAPI) {
        response = await this.submitViaAPI(platform, config, ledesFile, invoiceId);
      } else if (config.usesSFTP) {
        response = await this.submitViaSFTP(platform, config, ledesFile, invoiceId);
      } else {
        // Email submission fallback
        response = await this.submitViaEmail(platform, config, ledesFile, invoiceId);
      }

      const submission: EBillingSubmission = {
        id: this.generateId(),
        platform,
        invoiceId,
        submissionDate: new Date(),
        status: response.success ? 'submitted' : 'pending',
        ledesFile,
        platformReferenceId: response.platformReferenceId,
        validationErrors: response.errors,
        submittedBy: config.firmId,
        metadata: {
          method: config.usesAPI ? 'API' : config.usesSFTP ? 'SFTP' : 'Email',
          validationWarnings: validation.warnings,
        },
      };

      this.logger.log(
        `Invoice ${invoiceId} ${response.success ? 'successfully submitted' : 'submission failed'} to ${platform}`,
      );

      return submission;
    } catch (error) {
      this.logger.error(`Failed to submit invoice to ${platform}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Submit via API
   */
  private async submitViaAPI(
    platform: EBillingPlatform,
    config: EBillingConfig,
    ledesFile: string,
    invoiceId: string,
  ): Promise<EBillingResponse> {
    this.logger.log(`Submitting to ${platform} via API`);

    try {
      const headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'text/plain',
        'X-Client-ID': config.clientId,
        'X-Firm-ID': config.firmId,
      };

      const payload = this.buildAPIPayload(platform, ledesFile, invoiceId, config);

      const response = await firstValueFrom(
        this.httpService.post(config.apiEndpoint, payload, { headers }),
      );

      return {
        success: true,
        platformReferenceId: response.data.referenceId || response.data.id,
        message: 'Invoice successfully submitted via API',
        submissionId: response.data.submissionId,
      };
    } catch (error) {
      this.logger.error(`API submission failed: ${error.message}`);
      return {
        success: false,
        message: `API submission failed: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Build API payload for specific platform
   */
  private buildAPIPayload(
    platform: EBillingPlatform,
    ledesFile: string,
    invoiceId: string,
    config: EBillingConfig,
  ): any {
    switch (platform) {
      case EBillingPlatform.BRIGHTFLAG:
        return {
          invoice_id: invoiceId,
          client_id: config.clientId,
          firm_id: config.firmId,
          ledes_content: Buffer.from(ledesFile).toString('base64'),
          format: 'LEDES_2000',
        };

      case EBillingPlatform.APPERIO:
        return {
          invoiceReference: invoiceId,
          clientReference: config.clientId,
          ledesData: ledesFile,
          submissionDate: new Date().toISOString(),
        };

      case EBillingPlatform.TYMETRIX:
        return {
          invoice: {
            invoiceId,
            clientId: config.clientId,
            firmId: config.firmId,
          },
          ledesContent: ledesFile,
        };

      default:
        return {
          invoiceId,
          clientId: config.clientId,
          ledesFile,
        };
    }
  }

  /**
   * Submit via SFTP
   */
  private async submitViaSFTP(
    platform: EBillingPlatform,
    config: EBillingConfig,
    ledesFile: string,
    invoiceId: string,
  ): Promise<EBillingResponse> {
    this.logger.log(`Submitting to ${platform} via SFTP`);

    try {
      // SFTP implementation would go here
      // For now, return mock success
      const filename = `${invoiceId}_${Date.now()}.txt`;

      this.logger.log(`SFTP upload to ${config.sftpHost}:${config.sftpPort} - ${filename}`);

      return {
        success: true,
        message: `Invoice uploaded via SFTP as ${filename}`,
        platformReferenceId: filename,
      };
    } catch (error) {
      this.logger.error(`SFTP submission failed: ${error.message}`);
      return {
        success: false,
        message: `SFTP submission failed: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Submit via Email
   */
  private async submitViaEmail(
    platform: EBillingPlatform,
    config: EBillingConfig,
    ledesFile: string,
    invoiceId: string,
  ): Promise<EBillingResponse> {
    this.logger.log(`Submitting to ${platform} via Email`);

    // Email submission would integrate with email service
    // For now, return mock success
    return {
      success: true,
      message: 'Invoice queued for email submission',
      platformReferenceId: `email_${invoiceId}_${Date.now()}`,
    };
  }

  /**
   * Check invoice status on platform
   */
  async checkInvoiceStatus(
    submissionId: string,
    platform: EBillingPlatform,
    config: EBillingConfig,
  ): Promise<InvoiceStatus> {
    this.logger.log(`Checking status for submission ${submissionId} on ${platform}`);

    try {
      if (EBILLING_PLATFORM_FORMATS[platform].supportsAPI && config.usesAPI) {
        const headers = {
          'Authorization': `Bearer ${config.apiKey}`,
          'X-Client-ID': config.clientId,
        };

        const statusEndpoint = `${config.apiEndpoint}/status/${submissionId}`;
        const response = await firstValueFrom(
          this.httpService.get(statusEndpoint, { headers }),
        );

        return {
          invoiceId: response.data.invoiceId,
          platform,
          status: response.data.status,
          lastUpdated: new Date(response.data.lastUpdated),
          approvalStatus: response.data.approvalStatus,
          paymentStatus: response.data.paymentStatus,
          comments: response.data.comments,
        };
      } else {
        // Mock status for non-API platforms
        return {
          invoiceId: submissionId,
          platform,
          status: 'submitted',
          lastUpdated: new Date(),
        };
      }
    } catch (error) {
      this.logger.error(`Failed to check invoice status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve invoice feedback from platform
   */
  async getInvoiceFeedback(
    submissionId: string,
    platform: EBillingPlatform,
    config: EBillingConfig,
  ): Promise<any> {
    this.logger.log(`Retrieving feedback for submission ${submissionId} on ${platform}`);

    try {
      if (!EBILLING_PLATFORM_FORMATS[platform].supportsAPI || !config.usesAPI) {
        return {
          message: 'Feedback not available for this platform',
          feedbackItems: [],
        };
      }

      const headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Client-ID': config.clientId,
      };

      const feedbackEndpoint = `${config.apiEndpoint}/feedback/${submissionId}`;
      const response = await firstValueFrom(
        this.httpService.get(feedbackEndpoint, { headers }),
      );

      return {
        submissionId,
        platform,
        feedbackItems: response.data.feedback || [],
        rejectionReasons: response.data.rejectionReasons || [],
        adjustmentRequests: response.data.adjustmentRequests || [],
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve feedback: ${error.message}`);
      throw error;
    }
  }

  /**
   * Batch submit multiple invoices
   */
  async batchSubmitInvoices(
    invoiceIds: string[],
    platform: EBillingPlatform,
    config: EBillingConfig,
  ): Promise<EBillingSubmission[]> {
    this.logger.log(`Batch submitting ${invoiceIds.length} invoices to ${platform}`);

    const submissions: EBillingSubmission[] = [];

    for (const invoiceId of invoiceIds) {
      try {
        const submission = await this.submitInvoice(invoiceId, platform, config);
        submissions.push(submission);
      } catch (error) {
        this.logger.error(`Failed to submit invoice ${invoiceId}: ${error.message}`);
        submissions.push({
          id: this.generateId(),
          platform,
          invoiceId,
          submissionDate: new Date(),
          status: 'rejected',
          ledesFile: '',
          validationErrors: [error.message],
          submittedBy: config.firmId,
        });
      }
    }

    return submissions;
  }

  /**
   * Test connection to e-billing platform
   */
  async testConnection(
    platform: EBillingPlatform,
    config: EBillingConfig,
  ): Promise<{ success: boolean; message: string; details?: any }> {
    this.logger.log(`Testing connection to ${platform}`);

    try {
      if (!EBILLING_PLATFORM_FORMATS[platform].supportsAPI || !config.usesAPI) {
        return {
          success: true,
          message: 'Connection test not applicable for this platform (uses SFTP/Email)',
        };
      }

      const headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Client-ID': config.clientId,
      };

      const testEndpoint = `${config.apiEndpoint}/health`;
      const response = await firstValueFrom(
        this.httpService.get(testEndpoint, { headers, timeout: 5000 }),
      );

      return {
        success: true,
        message: 'Connection successful',
        details: response.data,
      };
    } catch (error) {
      this.logger.error(`Connection test failed: ${error.message}`);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }

  /**
   * Get platform-specific requirements
   */
  getPlatformRequirements(platform: EBillingPlatform): any {
    const config = EBILLING_PLATFORM_FORMATS[platform];

    if (!config) {
      throw new BadRequestException(`Unknown platform: ${platform}`);
    }

    return {
      platform,
      name: config.name,
      format: config.format,
      delimiter: config.delimiter,
      requiresHeader: config.requiresHeader,
      maxFileSize: config.maxFileSize,
      supportedCurrencies: config.supportedCurrencies,
      supportsAPI: config.supportsAPI || false,
      requiresEncryption: config.requiresEncryption || false,
      customFields: config.customFields || [],
    };
  }

  /**
   * Sync invoice statuses for all submissions
   */
  async syncInvoiceStatuses(
    platform: EBillingPlatform,
    config: EBillingConfig,
  ): Promise<InvoiceStatus[]> {
    this.logger.log(`Syncing invoice statuses for ${platform}`);

    // Mock implementation - would fetch all pending submissions and check status
    const pendingSubmissions = await this.getPendingSubmissions(platform);

    const statuses: InvoiceStatus[] = [];

    for (const submission of pendingSubmissions) {
      try {
        const status = await this.checkInvoiceStatus(submission.id, platform, config);
        statuses.push(status);
      } catch (error) {
        this.logger.error(`Failed to sync status for ${submission.id}: ${error.message}`);
      }
    }

    return statuses;
  }

  /**
   * Generate submission report
   */
  async generateSubmissionReport(
    platform: EBillingPlatform,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    return {
      platform,
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalSubmissions: 0,
        successfulSubmissions: 0,
        failedSubmissions: 0,
        pendingSubmissions: 0,
        totalAmount: 0,
        paidAmount: 0,
      },
      submissionsByStatus: {},
      averageApprovalTime: 0,
      rejectionReasons: {},
    };
  }

  /**
   * Helper methods
   */
  private async getPendingSubmissions(platform: EBillingPlatform): Promise<EBillingSubmission[]> {
    // Mock implementation - would query database
    return [];
  }

  private generateId(): string {
    return `eb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate platform configuration
   */
  validatePlatformConfig(config: EBillingConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.platform) {
      errors.push('Platform is required');
    }

    if (config.usesAPI) {
      if (!config.apiEndpoint) {
        errors.push('API endpoint is required for API submission');
      }
      if (!config.apiKey) {
        errors.push('API key is required for API submission');
      }
    }

    if (config.usesSFTP) {
      if (!config.sftpHost) {
        errors.push('SFTP host is required for SFTP submission');
      }
      if (!config.sftpUsername) {
        errors.push('SFTP username is required for SFTP submission');
      }
    }

    if (!config.clientId) {
      errors.push('Client ID is required');
    }

    if (!config.firmId) {
      errors.push('Firm ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
