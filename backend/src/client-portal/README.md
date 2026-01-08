# Client Portal Module

Self-service client portal for LexiFlow Legal SaaS with enterprise-grade security and comprehensive features.

## Features

### Authentication & Security
- **Secure Registration & Login**: Email/password authentication with JWT tokens
- **Email Verification**: New users must verify their email addresses
- **Multi-Factor Authentication (MFA)**: Optional TOTP-based 2FA
- **Password Management**: Reset, change password functionality
- **Account Security**:
  - Password hashing with bcrypt (12 rounds)
  - Account lockout after 5 failed login attempts (30-minute lockout)
  - Token-based session management with expiration
  - IP address and user agent tracking
  - Automatic token revocation on logout

### Core Functionalities

#### 1. Secure Messaging (`secure-messaging.service.ts`)
- End-to-end encrypted messaging between clients and attorneys
- Message threading and reply functionality
- File attachments support
- Read receipts
- Message archiving
- Search and filter capabilities
- Unread message counter

#### 2. Document Sharing (`document-sharing.service.ts`)
- Secure document vault with access control
- Granular permissions (view, download, print, comment)
- Document expiration and revocation
- Digital signature support
- Download tracking and limits
- Watermarking support
- Category-based organization
- Document search

#### 3. Appointment Scheduling (`appointment-scheduling.service.ts`)
- Schedule appointments with attorneys
- Multiple meeting methods (video, phone, in-person)
- Attorney availability checking
- Appointment confirmation and cancellation
- Automatic reminders
- Recurring appointments support
- Conflict detection
- Time zone support

#### 4. Invoice Review (`invoice-review.service.ts`)
- View all invoices and payment history
- Invoice summary and statistics
- PDF download
- Payment tracking
- Overdue invoice alerts
- Request clarifications or disputes
- Matter-based invoice filtering

#### 5. Notifications (`ClientNotification` entity)
- Real-time in-app notifications
- Email and SMS notification support
- Notification preferences management
- Multiple notification types:
  - New messages
  - Document shared
  - Appointment reminders
  - Invoice alerts
  - Case updates
  - Deadline approaching

## API Endpoints

### Authentication
```
POST   /client-portal/register              - Register new portal user
POST   /client-portal/verify-email          - Verify email address
POST   /client-portal/login                 - Login to portal
POST   /client-portal/logout                - Logout from portal
POST   /client-portal/refresh-token         - Refresh access token
POST   /client-portal/request-password-reset - Request password reset
POST   /client-portal/reset-password        - Reset password
```

### Profile Management
```
GET    /client-portal/profile               - Get user profile
PUT    /client-portal/profile               - Update profile
POST   /client-portal/change-password       - Change password
POST   /client-portal/mfa/enable            - Enable MFA
POST   /client-portal/mfa/disable           - Disable MFA
```

### Dashboard
```
GET    /client-portal/dashboard             - Get dashboard summary
```

### Secure Messaging
```
GET    /client-portal/messages              - Get all messages
GET    /client-portal/messages/:id          - Get specific message
POST   /client-portal/messages              - Send message
PUT    /client-portal/messages/:id/read     - Mark as read
PUT    /client-portal/messages/:id/archive  - Archive message
POST   /client-portal/messages/:id/reply    - Reply to message
GET    /client-portal/messages/unread/count - Get unread count
```

### Document Sharing
```
GET    /client-portal/documents             - Get all documents
GET    /client-portal/documents/:id         - Get specific document
POST   /client-portal/documents/:id/access  - Access document
POST   /client-portal/documents/:id/download - Download document
POST   /client-portal/documents/:id/sign    - Sign document
GET    /client-portal/documents/requiring-signature/list - Documents requiring signature
GET    /client-portal/documents/statistics/summary - Document statistics
```

### Appointments
```
GET    /client-portal/appointments          - Get all appointments
GET    /client-portal/appointments/:id      - Get specific appointment
POST   /client-portal/appointments          - Schedule appointment
PUT    /client-portal/appointments/:id      - Update appointment
DELETE /client-portal/appointments/:id      - Cancel appointment
POST   /client-portal/appointments/:id/confirm - Confirm appointment
GET    /client-portal/appointments/upcoming/list - Upcoming appointments
GET    /client-portal/appointments/available-slots/:attorneyId - Available time slots
GET    /client-portal/appointments/statistics/summary - Appointment statistics
```

### Invoices
```
GET    /client-portal/invoices              - Get all invoices
GET    /client-portal/invoices/:id          - Get specific invoice
GET    /client-portal/invoices/summary/overview - Invoice summary
GET    /client-portal/invoices/overdue/list - Overdue invoices
GET    /client-portal/invoices/unpaid/list  - Unpaid invoices
GET    /client-portal/invoices/:id/download - Download invoice PDF
POST   /client-portal/invoices/:id/clarification - Request clarification
GET    /client-portal/invoices/statistics/summary - Invoice statistics
```

## Database Schema

### Entities

#### PortalUser
- User authentication and profile
- MFA settings
- Session management
- Security tracking (login attempts, IP, user agent)

#### SecureMessage
- Encrypted messages
- Attachments
- Read tracking
- Message threading

#### SharedDocument
- Document metadata
- Access permissions
- Download tracking
- Signature data

#### Appointment
- Schedule information
- Meeting details
- Status tracking
- Reminders

#### ClientNotification
- Notification content
- Delivery status
- Priority levels
- Action links

## Security Features

### Authentication
- JWT tokens with 1-hour expiration
- Refresh tokens with 7-day expiration
- Token revocation on logout
- Secure token storage in database

### Authorization
- Token-based access control
- Portal users can only access their own data
- Document access permissions enforced
- Appointment scheduling with availability checks

### Data Protection
- Password hashing with bcrypt (12 rounds)
- Encrypted message storage
- Secure document access URLs
- IP address and user agent tracking
- Session management

### Account Security
- Email verification required
- Account lockout after failed attempts
- MFA support (TOTP)
- Password strength requirements
- Password reset with secure tokens
- Last login tracking

## Frontend Components

### PortalDashboard.tsx
- Overview of all portal activities
- Quick stats (unread messages, appointments, documents, invoices)
- Recent activity feed
- Quick action buttons

### SecureInbox.tsx
- Message list with search and filters
- Message detail view with attachments
- Compose and reply functionality
- Read/unread tracking

### DocumentVault.tsx
- Document grid with categories
- Document preview and download
- Digital signature modal
- Access tracking

### InvoiceCenter.tsx
- Invoice list with filtering
- Payment status tracking
- Invoice download
- Payment statistics

### AppointmentScheduler.tsx
- Calendar view
- Schedule new appointments
- Appointment confirmation/cancellation
- Meeting details and links

### CaseStatusTracker.tsx
- Case list and details
- Progress milestones
- Recent activity
- Deadline tracking

### ClientProfileSettings.tsx
- Profile information
- Password change
- MFA settings
- Notification preferences

### NotificationCenter.tsx
- Notification list
- Mark as read/dismiss
- Priority indicators
- Action links

## Usage

### Backend Setup

1. Import the module in your main app module:
```typescript
import { ClientPortalModule } from './client-portal/client-portal.module';

@Module({
  imports: [
    // ... other modules
    ClientPortalModule,
  ],
})
export class AppModule {}
```

2. Ensure JWT_SECRET is set in your environment variables:
```bash
JWT_SECRET=your-secure-secret-key-here
```

3. Run database migrations to create the portal tables.

### Frontend Setup

1. Import components:
```typescript
import {
  PortalDashboard,
  SecureInbox,
  DocumentVault,
  InvoiceCenter,
  AppointmentScheduler,
  CaseStatusTracker,
  ClientProfileSettings,
  NotificationCenter,
} from '@features/client-portal';
```

2. Use in your routes:
```typescript
<Route path="/portal/dashboard" element={<PortalDashboard portalUserId={userId} />} />
<Route path="/portal/messages" element={<SecureInbox portalUserId={userId} />} />
// ... other routes
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Set secure JWT secrets** with sufficient entropy
3. **Enable MFA** for all users
4. **Implement rate limiting** on authentication endpoints
5. **Monitor failed login attempts** for suspicious activity
6. **Regularly rotate tokens** and force re-authentication
7. **Encrypt sensitive data** at rest and in transit
8. **Audit all portal access** and actions
9. **Implement IP whitelisting** for high-security clients
10. **Use CSP headers** to prevent XSS attacks

## Testing

Test authentication:
```bash
# Register
curl -X POST http://localhost:3000/api/client-portal/register \
  -H "Content-Type: application/json" \
  -d '{"clientId":"...","email":"client@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:3000/api/client-portal/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"SecurePass123!"}'
```

## Future Enhancements

- [ ] WebSocket support for real-time notifications
- [ ] Payment processing integration
- [ ] Mobile app support
- [ ] Biometric authentication
- [ ] Advanced document collaboration
- [ ] Video conferencing integration
- [ ] AI-powered chatbot for common queries
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1 AA)
