import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientPortalService } from './client-portal.service';
import { SecureMessagingService } from './secure-messaging.service';
import { DocumentSharingService } from './document-sharing.service';
import { AppointmentSchedulingService } from './appointment-scheduling.service';
import { InvoiceReviewService } from './invoice-review.service';

/**
 * Client Portal Controller
 * Self-service client portal with secure authentication
 * Features:
 * - Client registration and authentication
 * - Secure messaging
 * - Document sharing and management
 * - Appointment scheduling
 * - Invoice review and payment
 */
@ApiTags('client-portal')
@Controller('client-portal')
export class ClientPortalController {
  constructor(
    private readonly clientPortalService: ClientPortalService,
    private readonly secureMessagingService: SecureMessagingService,
    private readonly documentSharingService: DocumentSharingService,
    private readonly appointmentSchedulingService: AppointmentSchedulingService,
    private readonly invoiceReviewService: InvoiceReviewService,
  ) {}

  // ==================== Authentication ====================

  @Post('register')
  @ApiOperation({ summary: 'Register a new portal user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(
    @Body() body: { clientId: string; email: string; password: string },
  ) {
    return await this.clientPortalService.register(body);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() body: { token: string }) {
    return await this.clientPortalService.verifyEmail(body.token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login to portal' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() body: { email: string; password: string }) {
    return await this.clientPortalService.login(body.email, body.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from portal' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Body() body: { portalUserId: string }) {
    await this.clientPortalService.logout(body.portalUserId);
    return { message: 'Logout successful' };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return await this.clientPortalService.refreshToken(body.refreshToken);
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  async requestPasswordReset(@Body() body: { email: string }) {
    await this.clientPortalService.requestPasswordReset(body.email);
    return { message: 'If an account exists, a reset email has been sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    await this.clientPortalService.resetPassword(body.token, body.newPassword);
    return { message: 'Password reset successfully' };
  }

  // ==================== Profile Management ====================

  @Get('profile')
  @ApiOperation({ summary: 'Get portal user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Query('portalUserId') portalUserId: string) {
    return await this.clientPortalService.getProfile(portalUserId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update portal user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Query('portalUserId') portalUserId: string,
    @Body() body: { preferences?: Record<string, unknown>; notificationSettings?: Record<string, unknown> },
  ) {
    return await this.clientPortalService.updateProfile(portalUserId, body);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @Query('portalUserId') portalUserId: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    await this.clientPortalService.changePassword(portalUserId, body.currentPassword, body.newPassword);
    return { message: 'Password changed successfully' };
  }

  @Post('mfa/enable')
  @ApiOperation({ summary: 'Enable MFA' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully' })
  async enableMfa(@Query('portalUserId') portalUserId: string) {
    return await this.clientPortalService.enableMfa(portalUserId);
  }

  @Post('mfa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable MFA' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  async disableMfa(@Query('portalUserId') portalUserId: string) {
    await this.clientPortalService.disableMfa(portalUserId);
    return { message: 'MFA disabled successfully' };
  }

  // ==================== Dashboard ====================

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboard(@Query('portalUserId') portalUserId: string) {
    return await this.clientPortalService.getDashboardSummary(portalUserId);
  }

  // ==================== Secure Messaging ====================

  @Get('messages')
  @ApiOperation({ summary: 'Get all messages' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getMessages(
    @Query('portalUserId') portalUserId: string,
    @Query('read') read?: string,
    @Query('messageType') messageType?: string,
    @Query('matterId') matterId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return await this.secureMessagingService.getMessages(portalUserId, {
      read: read ? read === 'true' : undefined,
      messageType,
      matterId,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('messages/:id')
  @ApiOperation({ summary: 'Get a specific message' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully' })
  async getMessage(@Param('id') id: string, @Query('portalUserId') portalUserId: string) {
    return await this.secureMessagingService.getMessage(id, portalUserId);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(
    @Query('portalUserId') portalUserId: string,
    @Body() body: {
      matterId?: string;
      subject: string;
      body: string;
      recipientId?: string;
      recipientType?: string;
      messageType?: string;
      attachments?: Array<{
        filename: string;
        url: string;
        size: number;
        mimeType: string;
        uploadedAt: string;
      }>;
    },
  ) {
    return await this.secureMessagingService.sendMessage(portalUserId, body);
  }

  @Put('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markAsRead(@Param('id') id: string, @Query('portalUserId') portalUserId: string) {
    return await this.secureMessagingService.markAsRead(id, portalUserId);
  }

  @Put('messages/:id/archive')
  @ApiOperation({ summary: 'Archive a message' })
  @ApiResponse({ status: 200, description: 'Message archived' })
  async archiveMessage(@Param('id') id: string, @Query('portalUserId') portalUserId: string) {
    return await this.secureMessagingService.archiveMessage(id, portalUserId);
  }

  @Post('messages/:id/reply')
  @ApiOperation({ summary: 'Reply to a message' })
  @ApiResponse({ status: 201, description: 'Reply sent successfully' })
  async replyToMessage(
    @Param('id') id: string,
    @Query('portalUserId') portalUserId: string,
    @Body() body: { body: string; attachments?: any[] },
  ) {
    return await this.secureMessagingService.replyToMessage(id, portalUserId, body);
  }

  @Get('messages/unread/count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Count retrieved successfully' })
  async getUnreadCount(@Query('portalUserId') portalUserId: string) {
    const count = await this.secureMessagingService.getUnreadCount(portalUserId);
    return { count };
  }

  // ==================== Document Sharing ====================

  @Get('documents')
  @ApiOperation({ summary: 'Get all shared documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async getDocuments(
    @Query('portalUserId') portalUserId: string,
    @Query('status') status?: string,
    @Query('matterId') matterId?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return await this.documentSharingService.getSharedDocuments(portalUserId, {
      status,
      matterId,
      category,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get a specific document' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  async getDocument(@Param('id') id: string, @Query('portalUserId') portalUserId: string) {
    return await this.documentSharingService.getDocument(id, portalUserId);
  }

  @Post('documents/:id/access')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Access a document (track access)' })
  @ApiResponse({ status: 200, description: 'Document accessed' })
  async accessDocument(@Param('id') id: string, @Query('portalUserId') portalUserId: string) {
    return await this.documentSharingService.accessDocument(id, portalUserId);
  }

  @Post('documents/:id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download a document' })
  @ApiResponse({ status: 200, description: 'Document downloaded' })
  async downloadDocument(@Param('id') id: string, @Query('portalUserId') portalUserId: string) {
    return await this.documentSharingService.downloadDocument(id, portalUserId);
  }

  @Post('documents/:id/sign')
  @ApiOperation({ summary: 'Sign a document' })
  @ApiResponse({ status: 200, description: 'Document signed successfully' })
  async signDocument(
    @Param('id') id: string,
    @Query('portalUserId') portalUserId: string,
    @Body() body: { signatureData: Record<string, unknown> },
  ) {
    return await this.documentSharingService.signDocument(id, portalUserId, body.signatureData);
  }

  @Get('documents/requiring-signature/list')
  @ApiOperation({ summary: 'Get documents requiring signature' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async getDocumentsRequiringSignature(@Query('portalUserId') portalUserId: string) {
    return await this.documentSharingService.getDocumentsRequiringSignature(portalUserId);
  }

  @Get('documents/statistics/summary')
  @ApiOperation({ summary: 'Get document statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getDocumentStatistics(@Query('portalUserId') portalUserId: string) {
    return await this.documentSharingService.getDocumentStatistics(portalUserId);
  }

  // ==================== Appointments ====================

  @Get('appointments')
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  async getAppointments(
    @Query('portalUserId') portalUserId: string,
    @Query('status') status?: string,
    @Query('appointmentType') appointmentType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return await this.appointmentSchedulingService.getAppointments(portalUserId, {
      status,
      appointmentType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('appointments/:id')
  @ApiOperation({ summary: 'Get a specific appointment' })
  @ApiResponse({ status: 200, description: 'Appointment retrieved successfully' })
  async getAppointment(@Param('id') id: string, @Query('portalUserId') portalUserId: string) {
    return await this.appointmentSchedulingService.getAppointment(id, portalUserId);
  }

  @Post('appointments')
  @ApiOperation({ summary: 'Schedule a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment scheduled successfully' })
  async scheduleAppointment(
    @Query('portalUserId') portalUserId: string,
    @Body() body: {
      attorneyId: string;
      attorneyName?: string;
      matterId?: string;
      datetime: string;
      durationMinutes?: number;
      appointmentType: string;
      meetingMethod: string;
      location?: string;
      notes?: string;
      clientNotes?: string;
      agenda?: string;
      phoneNumber?: string;
      timeZone?: string;
    },
  ) {
    return await this.appointmentSchedulingService.scheduleAppointment(portalUserId, {
      ...body,
      datetime: new Date(body.datetime),
    });
  }

  @Put('appointments/:id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  async updateAppointment(
    @Param('id') id: string,
    @Query('portalUserId') portalUserId: string,
    @Body() body: Partial<{
      datetime: string;
      durationMinutes: number;
      meetingMethod: string;
      location: string;
      clientNotes: string;
      phoneNumber: string;
    }>,
  ) {
    return await this.appointmentSchedulingService.updateAppointment(id, portalUserId, {
      ...body,
      datetime: body.datetime ? new Date(body.datetime) : undefined,
    });
  }

  @Delete('appointments/:id')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled successfully' })
  async cancelAppointment(
    @Param('id') id: string,
    @Query('portalUserId') portalUserId: string,
    @Body() body: { reason?: string },
  ) {
    return await this.appointmentSchedulingService.cancelAppointment(id, portalUserId, body.reason);
  }

  @Post('appointments/:id/confirm')
  @ApiOperation({ summary: 'Confirm an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment confirmed successfully' })
  async confirmAppointment(@Param('id') id: string, @Query('portalUserId') portalUserId: string) {
    return await this.appointmentSchedulingService.confirmAppointment(id, portalUserId);
  }

  @Get('appointments/upcoming/list')
  @ApiOperation({ summary: 'Get upcoming appointments' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  async getUpcomingAppointments(
    @Query('portalUserId') portalUserId: string,
    @Query('limit') limit?: string,
  ) {
    return await this.appointmentSchedulingService.getUpcomingAppointments(
      portalUserId,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('appointments/available-slots/:attorneyId')
  @ApiOperation({ summary: 'Get available time slots for an attorney' })
  @ApiResponse({ status: 200, description: 'Available slots retrieved successfully' })
  async getAvailableTimeSlots(
    @Param('attorneyId') attorneyId: string,
    @Query('date') date: string,
    @Query('durationMinutes') durationMinutes?: string,
  ) {
    return await this.appointmentSchedulingService.getAvailableTimeSlots(
      attorneyId,
      new Date(date),
      durationMinutes ? parseInt(durationMinutes) : undefined,
    );
  }

  @Get('appointments/statistics/summary')
  @ApiOperation({ summary: 'Get appointment statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getAppointmentStatistics(@Query('portalUserId') portalUserId: string) {
    return await this.appointmentSchedulingService.getAppointmentStatistics(portalUserId);
  }

  // ==================== Invoices ====================

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async getInvoices(
    @Query('portalUserId') portalUserId: string,
    @Query('status') status?: string,
    @Query('matterId') matterId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return await this.invoiceReviewService.getInvoices(portalUserId, {
      status,
      matterId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get a specific invoice' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  async getInvoice(@Param('id') id: string, @Query('portalUserId') portalUserId: string) {
    return await this.invoiceReviewService.getInvoice(id, portalUserId);
  }

  @Get('invoices/summary/overview')
  @ApiOperation({ summary: 'Get invoice summary' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  async getInvoiceSummary(@Query('portalUserId') portalUserId: string) {
    return await this.invoiceReviewService.getInvoiceSummary(portalUserId);
  }

  @Get('invoices/overdue/list')
  @ApiOperation({ summary: 'Get overdue invoices' })
  @ApiResponse({ status: 200, description: 'Overdue invoices retrieved successfully' })
  async getOverdueInvoices(@Query('portalUserId') portalUserId: string) {
    return await this.invoiceReviewService.getOverdueInvoices(portalUserId);
  }

  @Get('invoices/unpaid/list')
  @ApiOperation({ summary: 'Get unpaid invoices' })
  @ApiResponse({ status: 200, description: 'Unpaid invoices retrieved successfully' })
  async getUnpaidInvoices(@Query('portalUserId') portalUserId: string) {
    return await this.invoiceReviewService.getUnpaidInvoices(portalUserId);
  }

  @Get('invoices/:id/download')
  @ApiOperation({ summary: 'Download invoice PDF' })
  @ApiResponse({ status: 200, description: 'Invoice PDF retrieved successfully' })
  async downloadInvoice(@Param('id') id: string, @Query('portalUserId') portalUserId: string) {
    return await this.invoiceReviewService.downloadInvoice(id, portalUserId);
  }

  @Post('invoices/:id/clarification')
  @ApiOperation({ summary: 'Request invoice clarification' })
  @ApiResponse({ status: 201, description: 'Clarification request submitted' })
  async requestInvoiceClarification(
    @Param('id') id: string,
    @Query('portalUserId') portalUserId: string,
    @Body() body: {
      lineItems?: string[];
      message: string;
      requestType: 'clarification' | 'dispute' | 'adjustment';
    },
  ) {
    return await this.invoiceReviewService.requestInvoiceClarification(id, portalUserId, body);
  }

  @Get('invoices/statistics/summary')
  @ApiOperation({ summary: 'Get invoice statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getInvoiceStatistics(
    @Query('portalUserId') portalUserId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.invoiceReviewService.getInvoiceStatistics(portalUserId,
      startDate && endDate ? {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      } : undefined,
    );
  }
}
