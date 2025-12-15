import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';

/**
 * Common Swagger response schemas
 */
export const SwaggerResponses = {
  unauthorized: {
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  },
  forbidden: {
    description: 'Forbidden - Insufficient permissions',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  },
  notFound: {
    description: 'Not Found - Resource does not exist',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Resource not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  },
  badRequest: {
    description: 'Bad Request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'array',
          items: { type: 'string' },
          example: ['title should not be empty', 'email must be a valid email']
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  },
  internalServerError: {
    description: 'Internal Server Error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  },
};

/**
 * Common Swagger query parameters
 */
export const SwaggerQueryParams = {
  pagination: [
    { name: 'page', required: false, type: Number, description: 'Page number (default: 1)' },
    { name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' },
  ],
  sorting: [
    { name: 'sortBy', required: false, type: String, description: 'Field to sort by' },
    { name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: ASC)' },
  ],
  search: [
    { name: 'q', required: false, type: String, description: 'Search query string' },
  ],
};

/**
 * Setup comprehensive Swagger documentation
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('LexiFlow Enterprise API')
    .setDescription(getApiDescription())
    .setVersion('1.0.0')
    .setContact(
      'LexiFlow Support',
      'https://lexiflow.com/support',
      'support@lexiflow.com'
    )
    .setLicense('Commercial', 'https://lexiflow.com/license')
    
    // Servers
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('http://localhost:8080', 'Local Production')
    .addServer('https://api-staging.lexiflow.com', 'Staging Environment')
    .addServer('https://api.lexiflow.com', 'Production Environment')
    
    // Tags
    .addTag('health', '❤️ Health check and system status')
    .addTag('auth', '🔐 Authentication and authorization')
    .addTag('users', '👥 User management')
    .addTag('cases', '⚖️ Case management')
    .addTag('parties', '👤 Party management')
    .addTag('case-teams', '👨‍💼 Case team management')
    .addTag('case-phases', '📊 Case phase tracking')
    .addTag('motions', '📋 Motion management')
    .addTag('docket', '📅 Docket entry management')
    .addTag('projects', '📁 Project management')
    .addTag('documents', '📄 Document management')
    .addTag('document-versions', '📝 Document version control')
    .addTag('clauses', '📑 Clause library')
    .addTag('pleadings', '📃 Pleading documents')
    .addTag('processing-jobs', '⚙️ Document processing')
    .addTag('discovery', '🔍 Discovery and e-discovery')
    .addTag('billing', '💰 Billing and finance')
    .addTag('time-entries', '⏱️ Time tracking')
    .addTag('invoices', '🧾 Invoice management')
    .addTag('compliance', '✅ Compliance and audit')
    .addTag('communications', '💬 Messaging')
    .addTag('notifications', '🔔 Notifications')
    .addTag('analytics', '📈 Analytics and reporting')
    .addTag('search', '🔎 Search')
    .addTag('graphql', '🌐 GraphQL API')
    .addTag('integrations', '🔗 External integrations')
    .addTag('webhooks', '📡 Webhook management')
    
    // Security
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token obtained from /api/v1/auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for service-to-service authentication',
      },
      'api-key',
    )
    .addCookieAuth('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refresh_token',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });

  // Add custom examples and schemas
  enhanceSwaggerDocument(document);

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'LexiFlow API Documentation',
    customfavIcon: 'https://lexiflow.com/favicon.ico',
    customCss: getCustomCss(),
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      docExpansion: 'list',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      tryItOutEnabled: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
  });
}

function getApiDescription(): string {
  return `
# LexiFlow Enterprise Legal OS API

## 🚀 Overview
Comprehensive REST API for enterprise legal practice management, covering case management, document processing, discovery, billing, compliance, and communications.

## 🔐 Authentication
All endpoints (except /health and /auth) require JWT Bearer token authentication.

**To authenticate:**
1. POST to \`/api/v1/auth/login\` with credentials
2. Copy the \`access_token\` from response
3. Click "Authorize" 🔓 button above and enter: \`Bearer <your_token>\`

**Test Credentials:**
- Email: \`admin@lexiflow.com\`
- Password: \`Admin123!\`

## ⚡ Rate Limiting
- **Default:** 100 requests per 15 minutes per IP
- **Authenticated:** 1000 requests per 15 minutes per user

## 📦 Response Format
All successful responses follow this structure:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
\`\`\`

## ❌ Error Handling
Errors return appropriate HTTP status codes with detailed messages:

| Status Code | Description |
|------------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

**Error Response Example:**
\`\`\`json
{
  "statusCode": 400,
  "message": ["title should not be empty"],
  "error": "Bad Request",
  "timestamp": "2025-12-15T10:30:00.000Z",
  "path": "/api/v1/cases"
}
\`\`\`

## 📄 Pagination
List endpoints support pagination via query parameters:
- \`page\` - Page number (default: 1)
- \`limit\` - Items per page (default: 20, max: 100)
- \`sortBy\` - Field to sort by (e.g., "createdAt", "title")
- \`order\` - Sort order: ASC or DESC (default: ASC)

**Example:** \`/api/v1/cases?page=2&limit=50&sortBy=createdAt&order=DESC\`

## 🔍 Filtering
Most list endpoints support filtering via query parameters matching entity fields.

**Example:** \`/api/v1/cases?status=active&type=civil&search=contract\`

## 📁 File Uploads
File upload endpoints accept \`multipart/form-data\`:
- **Max file size:** 100MB
- **Supported formats:** PDF, DOCX, DOC, TXT, JPG, PNG, etc.
- **Virus scanning:** Automatic on upload

## 🌐 API Versioning
Current version: **v1** (prefix: \`/api/v1\`)

Future versions will be accessible via \`/api/v2\`, etc. Version 1 will be maintained for backward compatibility.

## 🔄 WebSockets
Real-time features available via WebSocket at \`ws://localhost:3000\`
- Case updates
- Document processing status
- Live notifications

## 📊 GraphQL
Alternative GraphQL endpoint available at \`/graphql\`
- More flexible queries
- Reduced over-fetching
- Schema available via GraphQL Playground

## 📝 Best Practices
1. **Always include Authorization header** for authenticated endpoints
2. **Handle rate limits** gracefully with exponential backoff
3. **Validate input** on client side before sending
4. **Use pagination** for large datasets
5. **Cache responses** where appropriate (respect Cache-Control headers)
6. **Monitor response times** and report slow endpoints

## 🆘 Support
- **Documentation:** https://docs.lexiflow.com
- **Email:** support@lexiflow.com
- **Status Page:** https://status.lexiflow.com
- **GitHub Issues:** https://github.com/lexiflow/api/issues
`;
}

function getCustomCss(): string {
  return `
    .swagger-ui .topbar { 
      display: none; 
    }
    
    .swagger-ui {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    
    .swagger-ui .info {
      margin: 40px 0;
    }
    
    .swagger-ui .info .title { 
      font-size: 42px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 16px;
    }
    
    .swagger-ui .info .title small {
      font-size: 18px;
      color: #3b82f6;
      background: #eff6ff;
      padding: 4px 12px;
      border-radius: 6px;
      font-weight: 600;
    }
    
    .swagger-ui .info .description {
      font-size: 15px;
      line-height: 1.6;
    }
    
    .swagger-ui .scheme-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 32px;
    }
    
    .swagger-ui .scheme-container .schemes > label {
      color: white;
      font-weight: 600;
    }
    
    .swagger-ui .btn.authorize {
      background: white;
      color: #667eea;
      border: none;
      font-weight: 600;
      padding: 8px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .swagger-ui .btn.authorize svg {
      fill: #667eea;
    }
    
    .swagger-ui .opblock-tag {
      font-size: 22px;
      font-weight: 700;
      margin: 32px 0 16px 0;
      padding: 12px 0;
      border-bottom: 3px solid #e2e8f0;
    }
    
    .swagger-ui .opblock {
      border-radius: 10px;
      margin-bottom: 16px;
      border: 2px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
    }
    
    .swagger-ui .opblock:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }
    
    .swagger-ui .opblock.opblock-get {
      border-color: #3b82f6;
      background: #eff6ff;
    }
    
    .swagger-ui .opblock.opblock-get .opblock-summary {
      border-color: #3b82f6;
    }
    
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
      background: #3b82f6;
    }
    
    .swagger-ui .opblock.opblock-post {
      border-color: #10b981;
      background: #ecfdf5;
    }
    
    .swagger-ui .opblock.opblock-post .opblock-summary {
      border-color: #10b981;
    }
    
    .swagger-ui .opblock.opblock-post .opblock-summary-method {
      background: #10b981;
    }
    
    .swagger-ui .opblock.opblock-put {
      border-color: #f59e0b;
      background: #fffbeb;
    }
    
    .swagger-ui .opblock.opblock-put .opblock-summary {
      border-color: #f59e0b;
    }
    
    .swagger-ui .opblock.opblock-put .opblock-summary-method {
      background: #f59e0b;
    }
    
    .swagger-ui .opblock.opblock-delete {
      border-color: #ef4444;
      background: #fef2f2;
    }
    
    .swagger-ui .opblock.opblock-delete .opblock-summary {
      border-color: #ef4444;
    }
    
    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
      background: #ef4444;
    }
    
    .swagger-ui .opblock.opblock-patch {
      border-color: #8b5cf6;
      background: #faf5ff;
    }
    
    .swagger-ui .opblock.opblock-patch .opblock-summary {
      border-color: #8b5cf6;
    }
    
    .swagger-ui .opblock.opblock-patch .opblock-summary-method {
      background: #8b5cf6;
    }
    
    .swagger-ui .opblock-summary-method {
      font-weight: 700;
      min-width: 80px;
      text-align: center;
      border-radius: 6px;
    }
    
    .swagger-ui .opblock-summary-path {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 14px;
      font-weight: 600;
    }
    
    .swagger-ui .btn.execute {
      background: #3b82f6;
      border: none;
      font-weight: 600;
      padding: 10px 24px;
      border-radius: 8px;
    }
    
    .swagger-ui .btn.execute:hover {
      background: #2563eb;
    }
    
    .swagger-ui .response-col_status {
      font-weight: 700;
    }
    
    .swagger-ui .response-col_status.response-undocumented {
      color: #f59e0b;
    }
    
    .swagger-ui table thead tr th {
      font-weight: 700;
      color: #1e293b;
    }
    
    .swagger-ui .model-box {
      background: #f8fafc;
      border-radius: 8px;
      padding: 16px;
    }
    
    .swagger-ui .model-title {
      font-weight: 700;
      color: #1e293b;
    }
    
    .swagger-ui .parameter__name {
      font-weight: 600;
      color: #1e293b;
    }
    
    .swagger-ui .parameter__type {
      color: #3b82f6;
      font-weight: 600;
    }
    
    .swagger-ui .parameter__in {
      color: #6b7280;
      font-style: italic;
    }
    
    .swagger-ui .response-col_description {
      font-size: 14px;
    }
    
    /* Dark mode friendly */
    @media (prefers-color-scheme: dark) {
      .swagger-ui {
        color: #e2e8f0;
      }
      
      .swagger-ui .info .title {
        color: #f1f5f9;
      }
    }
  `;
}

function enhanceSwaggerDocument(document: OpenAPIObject): void {
  // Add common response schemas
  if (!document.components) {
    document.components = {};
  }
  
  if (!document.components.schemas) {
    document.components.schemas = {};
  }

  // Add common schemas
  document.components.schemas['ErrorResponse'] = {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 400 },
      message: { 
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } }
        ],
        example: 'Bad Request'
      },
      error: { type: 'string', example: 'Bad Request' },
      timestamp: { type: 'string', format: 'date-time' },
      path: { type: 'string', example: '/api/v1/resource' },
    },
  };

  document.components.schemas['PaginationMeta'] = {
    type: 'object',
    properties: {
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 20 },
      total: { type: 'number', example: 100 },
      totalPages: { type: 'number', example: 5 },
    },
  };

  document.components.schemas['SuccessResponse'] = {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Operation completed successfully' },
    },
  };
}

/**
 * Decorators for common Swagger responses
 */
export function ApiCommonResponses() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // This is a placeholder - actual implementation would use @ApiResponse decorators
    return descriptor;
  };
}
