import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { PortalUser } from './entities/portal-user.entity';
import { SecureMessage } from './entities/secure-message.entity';
import { SharedDocument } from './entities/shared-document.entity';
import { Appointment } from './entities/appointment.entity';
import { ClientNotification } from './entities/client-notification.entity';
import { Client } from '@clients/entities/client.entity';

// Controller
import { ClientPortalController } from './client-portal.controller';

// Services
import { ClientPortalService } from './client-portal.service';
import { SecureMessagingService } from './secure-messaging.service';
import { DocumentSharingService } from './document-sharing.service';
import { AppointmentSchedulingService } from './appointment-scheduling.service';
import { InvoiceReviewService } from './invoice-review.service';

/**
 * Client Portal Module
 * Self-service client portal with enterprise-grade security
 *
 * Features:
 * - Secure client authentication with JWT tokens
 * - Multi-factor authentication (MFA) support
 * - Encrypted secure messaging between clients and attorneys
 * - Document sharing with access control and expiration
 * - Appointment scheduling with attorney availability
 * - Invoice review and payment tracking
 * - Real-time notifications
 * - Client profile and preferences management
 *
 * Security Features:
 * - Token-based authentication (JWT)
 * - Password hashing with bcrypt
 * - Account lockout after failed login attempts
 * - Email verification for new accounts
 * - Password reset with secure tokens
 * - Session management
 * - MFA with TOTP
 * - IP address and user agent tracking
 *
 * Access Control:
 * - Portal users can only access their own data
 * - Document access permissions (view, download, print, comment)
 * - Document expiration and revocation
 * - Appointment scheduling with attorney availability checks
 * - Invoice access restricted to client's invoices only
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PortalUser,
      SecureMessage,
      SharedDocument,
      Appointment,
      ClientNotification,
      Client,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
        signOptions: {
          expiresIn: '1h',
          issuer: 'lexiflow-client-portal',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ClientPortalController],
  providers: [
    ClientPortalService,
    SecureMessagingService,
    DocumentSharingService,
    AppointmentSchedulingService,
    InvoiceReviewService,
  ],
  exports: [
    ClientPortalService,
    SecureMessagingService,
    DocumentSharingService,
    AppointmentSchedulingService,
    InvoiceReviewService,
  ],
})
export class ClientPortalModule {}
