import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { API_VERSIONS, LATEST_API_VERSION } from '../api/api-versioning.config';

/**
 * Swagger/OpenAPI 3.0 Configuration for LexiFlow AI Legal Suite
 *
 * This configuration sets up comprehensive API documentation with:
 * - Multiple API versions (V1, V2)
 * - Authentication schemes
 * - Request/response examples
 * - Schema definitions
 * - Deprecation warnings
 */

export interface SwaggerOptions {
  title?: string;
  description?: string;
  version?: string;
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };
  license?: {
    name?: string;
    url?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  externalDocs?: {
    description?: string;
    url?: string;
  };
}

/**
 * Default Swagger configuration
 */
export const defaultSwaggerOptions: SwaggerOptions = {
  title: 'LexiFlow AI Legal Suite API',
  description: `
# LexiFlow AI Legal Suite API Documentation

## Overview
The LexiFlow API provides comprehensive access to legal case management, document processing, billing, compliance, and AI-powered analytics.

## API Versions
- **V2 (Current)**: Modern REST API with GraphQL support
- **V1 (Deprecated)**: Legacy REST API (sunset date: June 1, 2025)

## Authentication
All API endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

## Rate Limiting
API requests are rate-limited to:
- **Standard**: 1000 requests/hour
- **Premium**: 5000 requests/hour
- **Enterprise**: Custom limits

## Error Handling
The API uses standard HTTP status codes:
- \`200\`: Success
- \`201\`: Created
- \`204\`: No Content
- \`400\`: Bad Request
- \`401\`: Unauthorized
- \`403\`: Forbidden
- \`404\`: Not Found
- \`422\`: Unprocessable Entity
- \`429\`: Too Many Requests
- \`500\`: Internal Server Error

## Pagination
V2 API uses cursor-based pagination for efficient data fetching:

\`\`\`json
{
  "edges": [...],
  "pageInfo": {
    "hasNextPage": true,
    "endCursor": "cursor123"
  },
  "totalCount": 100
}
\`\`\`

## GraphQL API
For more flexible queries, use the GraphQL endpoint at \`/graphql\`.
GraphQL Playground is available at \`/graphql\` (development only).

## Webhooks
Configure webhooks to receive real-time notifications for:
- Case updates
- Document processing completion
- Billing events
- Compliance alerts

## Support
- Documentation: https://docs.lexiflow.ai
- Support: support@lexiflow.ai
- Status: https://status.lexiflow.ai
  `,
  version: '2.0.0',
  contact: {
    name: 'LexiFlow Support',
    email: 'support@lexiflow.ai',
    url: 'https://www.lexiflow.ai/support',
  },
  license: {
    name: 'Proprietary',
    url: 'https://www.lexiflow.ai/terms',
  },
  externalDocs: {
    description: 'Full API Documentation',
    url: 'https://docs.lexiflow.ai',
  },
};

/**
 * Create Swagger document for a specific API version
 */
export function createSwaggerDocument(
  app: INestApplication,
  version: string = LATEST_API_VERSION,
  customOptions: Partial<SwaggerOptions> = {},
) {
  const options = { ...defaultSwaggerOptions, ...customOptions };
  const apiVersion = API_VERSIONS[version];

  const config = new DocumentBuilder()
    .setTitle(options.title || 'LexiFlow API')
    .setDescription(options.description || 'LexiFlow API Documentation')
    .setVersion(apiVersion?.version || options.version || '1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for server-to-server authentication',
      },
      'API-Key',
    )
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://auth.lexiflow.ai/oauth/authorize',
            tokenUrl: 'https://auth.lexiflow.ai/oauth/token',
            scopes: {
              'read:cases': 'Read case information',
              'write:cases': 'Create and update cases',
              'delete:cases': 'Delete cases',
              'read:documents': 'Read documents',
              'write:documents': 'Upload and update documents',
              'read:billing': 'Read billing information',
              'write:billing': 'Create invoices and time entries',
              'read:analytics': 'Access analytics and reports',
              'read:compliance': 'Read compliance data',
              'write:compliance': 'Manage compliance policies',
              'admin': 'Full administrative access',
            },
          },
        },
      },
      'OAuth2',
    );

  // Add servers
  if (options.servers) {
    options.servers.forEach((server) => {
      config.addServer(server.url, server.description);
    });
  } else {
    // Default servers
    config
      .addServer('https://api.lexiflow.ai', 'Production')
      .addServer('https://staging-api.lexiflow.ai', 'Staging')
      .addServer('http://localhost:3000', 'Development');
  }

  // Add contact information
  if (options.contact) {
    config.setContact(
      options.contact.name,
      options.contact.url,
      options.contact.email,
    );
  }

  // Add license
  if (options.license) {
    config.setLicense(options.license.name, options.license.url);
  }

  // Add external documentation
  if (options.externalDocs) {
    config.setExternalDoc(
      options.externalDocs.description,
      options.externalDocs.url,
    );
  }

  // Add deprecation notice for V1
  if (version === '1') {
    config.setDescription(
      options.description +
        '\n\n⚠️ **DEPRECATED**: This API version is deprecated and will be sunset on June 1, 2025. Please migrate to V2.',
    );
  }

  return SwaggerModule.createDocument(app, config.build(), {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
    deepScanRoutes: true,
  });
}

/**
 * Setup Swagger UI for all API versions
 */
export function setupSwagger(app: INestApplication) {
  // V2 API Documentation (Latest)
  const documentV2 = createSwaggerDocument(app, '2');
  SwaggerModule.setup('api/docs/v2', app, documentV2, {
    customSiteTitle: 'LexiFlow API V2 - Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #1a73e8 }
    `,
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // V1 API Documentation (Deprecated)
  const documentV1 = createSwaggerDocument(app, '1', {
    description: defaultSwaggerOptions.description + '\n\n⚠️ **DEPRECATED API VERSION**',
  });
  SwaggerModule.setup('api/docs/v1', app, documentV1, {
    customSiteTitle: 'LexiFlow API V1 - Documentation (Deprecated)',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #f44336 }
      .swagger-ui .info::before {
        content: "⚠️ DEPRECATED - This API version will be sunset on June 1, 2025";
        display: block;
        padding: 10px;
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 4px;
        margin-bottom: 20px;
        color: #856404;
        font-weight: bold;
      }
    `,
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'list',
    },
  });

  // Main API Documentation (redirects to latest version)
  SwaggerModule.setup('api/docs', app, documentV2, {
    customSiteTitle: 'LexiFlow API - Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  });

  // JSON/YAML specifications
  app.getHttpAdapter().get('/api/docs/v2/json', (req, res) => {
    res.json(documentV2);
  });

  app.getHttpAdapter().get('/api/docs/v1/json', (req, res) => {
    res.json(documentV1);
  });

  console.log('📚 API Documentation:');
  console.log('   - V2 (Latest): http://localhost:3000/api/docs/v2');
  console.log('   - V1 (Deprecated): http://localhost:3000/api/docs/v1');
  console.log('   - Main: http://localhost:3000/api/docs');
  console.log('');
  console.log('📄 OpenAPI Specifications:');
  console.log('   - V2 JSON: http://localhost:3000/api/docs/v2/json');
  console.log('   - V1 JSON: http://localhost:3000/api/docs/v1/json');
}

/**
 * Export specifications as JSON/YAML files
 */
export function exportApiSpecifications(app: INestApplication, outputDir: string) {
  const fs = require('fs');
  const path = require('path');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Export V2 specification
  const documentV2 = createSwaggerDocument(app, '2');
  fs.writeFileSync(
    path.join(outputDir, 'openapi-v2.json'),
    JSON.stringify(documentV2, null, 2),
  );

  // Export V1 specification
  const documentV1 = createSwaggerDocument(app, '1');
  fs.writeFileSync(
    path.join(outputDir, 'openapi-v1.json'),
    JSON.stringify(documentV1, null, 2),
  );

  console.log(`✅ API specifications exported to ${outputDir}`);
}
