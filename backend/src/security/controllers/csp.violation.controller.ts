import { Controller, Post, Body, Req, Ip, Logger, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { CspViolationService, CspViolationReport } from '../services/csp.violation.service';

/**
 * CSP Violation Report DTO
 */
interface CspReportDto {
  'csp-report': CspViolationReport;
}

/**
 * CSP Violation Reporting Controller
 *
 * Receives CSP violation reports from browsers and processes them for security analysis.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP#violation_report_syntax
 */
@Controller('security/csp-report')
export class CspViolationController {
  private readonly logger = new Logger(CspViolationController.name);

  constructor(private readonly cspViolationService: CspViolationService) {}

  /**
   * Receive CSP violation report
   *
   * This endpoint is configured in the CSP header:
   * Content-Security-Policy: ... report-uri /api/security/csp-report
   */
  @Post()
  @HttpCode(204)
  async receiveCspReport(
    @Body() reportDto: CspReportDto,
    @Req() request: Request,
    @Ip() ipAddress: string,
  ): Promise<void> {
    try {
      const report = reportDto['csp-report'];

      if (!report) {
        this.logger.warn('Received invalid CSP report format');
        return;
      }

      const userAgent = request.headers['user-agent'] || 'unknown';

      // Extract user/session info if available (properly typed)
      interface RequestWithAuth extends Request {
        user?: { id: string; [key: string]: unknown };
        sessionId?: string;
      }
      const authRequest = request as RequestWithAuth;
      const userId = authRequest.user?.id;
      const sessionId = authRequest.sessionId;

      // Process violation
      await this.cspViolationService.processViolation(
        report,
        userAgent,
        ipAddress,
        userId,
        sessionId,
      );

      this.logger.debug('CSP violation report processed successfully');
    } catch (error) {
      this.logger.error('Failed to process CSP violation report', error);
      // Don't throw error - CSP reports should not affect user experience
    }
  }
}
