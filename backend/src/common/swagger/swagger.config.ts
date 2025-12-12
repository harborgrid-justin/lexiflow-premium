import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Comprehensive Swagger/OpenAPI Configuration for LexiFlow AI Legal Suite
 *
 * This configuration provides complete API documentation with detailed
 * descriptions, examples, and proper categorization of all endpoints.
 */
export class SwaggerConfig {
  /**
   * Setup Swagger documentation for the application
   * @param app NestJS application instance
   * @param path Path where Swagger UI will be available (default: 'api/docs')
   */
  static setup(app: INestApplication, path: string = 'api/docs'): void {
    const config = new DocumentBuilder()
      .setTitle('LexiFlow Enterprise API')
      .setDescription(`
# LexiFlow AI Legal Suite - Enterprise API Documentation

## Overview
LexiFlow is a comprehensive AI-powered legal practice management system designed for modern law firms and legal departments. This API provides complete access to all platform features including case management, document management, billing, discovery, compliance, and analytics.

## Authentication
All API endpoints require Bearer token authentication. Include your JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## API Versioning
The API uses URI versioning. Current version: **v1**
- Base URL: \`/api/v1\`
- All endpoints follow the pattern: \`/api/v1/{resource}\`

## Rate Limiting
- Standard tier: 1000 requests per hour
- Enterprise tier: 10000 requests per hour
- Rate limit headers are included in all responses

## Pagination
List endpoints support pagination with query parameters:
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 20, max: 100)

## Filtering & Sorting
Most list endpoints support:
- \`search\`: Full-text search across relevant fields
- \`sortBy\`: Field to sort by
- \`sortOrder\`: ASC or DESC
- Resource-specific filters

## Response Format
Success responses follow this structure:
\`\`\`json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
\`\`\`

Error responses:
\`\`\`json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
\`\`\`

## Webhooks
Configure webhooks to receive real-time notifications for events:
- Case status changes
- Document processing completion
- Billing events
- Compliance alerts

## Support
- Documentation: https://docs.lexiflow.com
- API Support: api-support@lexiflow.com
- Status Page: https://status.lexiflow.com
      `)
      .setVersion('1.0.0')
      .setContact(
        'LexiFlow API Support',
        'https://www.lexiflow.com',
        'api-support@lexiflow.com'
      )
      .setLicense(
        'Proprietary',
        'https://www.lexiflow.com/terms'
      )
      .setTermsOfService('https://www.lexiflow.com/terms')

      // Authentication
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for service-to-service authentication',
        },
        'API-Key'
      )

      // Tags with descriptions for grouping endpoints
      .addTag('health', 'Health check and system status endpoints')
      .addTag('auth', 'Authentication and authorization endpoints')
      .addTag('users', 'User management and profile endpoints')

      // Case Management
      .addTag('cases', 'Case management - CRUD, search, timeline, workflow')
      .addTag('parties', 'Party management for cases (plaintiffs, defendants, witnesses)')
      .addTag('case-teams', 'Case team assignment and collaboration')
      .addTag('case-phases', 'Case phase tracking and milestones')

      // Legal Documents
      .addTag('documents', 'Document management with OCR, versioning, and templates')
      .addTag('document-versions', 'Document version control and history')
      .addTag('clauses', 'Reusable clause library for legal documents')
      .addTag('pleadings', 'Pleading document management and generation')
      .addTag('motions', 'Motion filing and tracking')

      // Discovery & E-Discovery
      .addTag('discovery', 'Discovery and e-discovery management')
      .addTag('discovery-requests', 'Discovery request tracking and responses')
      .addTag('legal-holds', 'Legal hold management and custodian tracking')
      .addTag('productions', 'Document production and Bates numbering')
      .addTag('depositions', 'Deposition scheduling and transcript management')
      .addTag('custodians', 'Custodian management for e-discovery')
      .addTag('esi-sources', 'Electronically Stored Information source tracking')
      .addTag('privilege-log', 'Privilege log management and review')

      // Billing & Finance
      .addTag('billing', 'Billing and financial management')
      .addTag('time-entries', 'Time tracking with timer, approval, and billing')
      .addTag('expenses', 'Expense tracking and reimbursement')
      .addTag('invoices', 'Invoice generation, sending, and payment tracking')
      .addTag('rate-tables', 'Attorney rate management and billing rates')
      .addTag('trust-accounts', 'Client trust account management (IOLTA)')
      .addTag('fee-agreements', 'Fee agreement and engagement letter management')

      // Compliance & Security
      .addTag('compliance', 'Compliance, audit, and security endpoints')
      .addTag('audit-logs', 'Comprehensive audit trail for all system actions')
      .addTag('conflict-checks', 'Conflict of interest checking and resolution')
      .addTag('ethical-walls', 'Chinese wall / ethical wall management')
      .addTag('permissions', 'Role-based access control and permissions')

      // Communications
      .addTag('communications', 'Communication and messaging features')
      .addTag('notifications', 'System notifications and alerts')
      .addTag('correspondence', 'Email and letter correspondence tracking')
      .addTag('messaging', 'Internal team messaging and collaboration')
      .addTag('service-jobs', 'Service of process tracking')

      // Analytics & Reporting
      .addTag('analytics', 'Analytics, reporting, and business intelligence')
      .addTag('dashboard', 'Dashboard widgets and KPIs')
      .addTag('case-analytics', 'Case performance analytics and insights')
      .addTag('billing-analytics', 'Financial analytics and revenue tracking')
      .addTag('discovery-analytics', 'Discovery metrics and efficiency tracking')
      .addTag('outcome-predictions', 'AI-powered outcome prediction and risk assessment')
      .addTag('judge-stats', 'Judge statistics and historical rulings')
      .addTag('risk-assessment', 'Case risk assessment and analysis')

      // Document Processing
      .addTag('processing-jobs', 'Asynchronous document processing jobs')
      .addTag('ocr', 'OCR (Optical Character Recognition) processing')

      // Search & Discovery
      .addTag('search', 'Full-text search across all entities')
      .addTag('docket', 'Court docket management and tracking')
      .addTag('projects', 'Project and matter management')

      // Integrations
      .addTag('integrations', 'External system integrations')
      .addTag('webhooks', 'Webhook configuration and management')
      .addTag('api-keys', 'API key management for integrations')

      // Advanced
      .addTag('graphql', 'GraphQL API for complex queries')
      .addTag('reports', 'Custom report generation and templates')

      // Servers
      .addServer('http://localhost:3000', 'Local Development Server')
      .addServer('https://api-dev.lexiflow.com', 'Development Environment')
      .addServer('https://api-staging.lexiflow.com', 'Staging Environment')
      .addServer('https://api.lexiflow.com', 'Production Environment')

      .build();

    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
      ignoreGlobalPrefix: false,
      extraModels: [],
      operationIdFactory: (
        controllerKey: string,
        methodKey: string
      ) => `${controllerKey}_${methodKey}`,
    });

    // Customize Swagger UI
    SwaggerModule.setup(path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        docExpansion: 'list',
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
        tryItOutEnabled: true,
        requestSnippetsEnabled: true,
        syntaxHighlight: {
          activate: true,
          theme: 'monokai',
        },
      },
      customSiteTitle: 'LexiFlow API Documentation',
      customfavIcon: 'https://lexiflow.com/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 50px 0 }
        .swagger-ui .info .title { font-size: 36px }
        .swagger-ui .scheme-container {
          background: #fafafa;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
      `,
      customCssUrl: '',
      customJs: '',
    });

    console.log(`📚 Swagger documentation available at: /${path}`);
  }

  /**
   * Get Swagger JSON document without setting up UI
   * Useful for CI/CD, testing, or external documentation generation
   */
  static getDocument(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('LexiFlow Enterprise API')
      .setVersion('1.0.0')
      .build();

    return SwaggerModule.createDocument(app, config);
  }
}

/**
 * Helper function to generate API documentation in JSON format
 * Can be used to export OpenAPI spec for external tools
 */
export function generateOpenAPISpec(app: INestApplication): any {
  return SwaggerConfig.getDocument(app);
}
