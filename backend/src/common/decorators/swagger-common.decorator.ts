import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

/**
 * Common Swagger response decorators for consistent API documentation
 */
export function ApiCommonResponses() {
  return applyDecorators(
    ApiResponse({ 
      status: 400, 
      description: 'Bad Request - Invalid input data',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { 
            oneOf: [
              { type: 'string' },
              { type: 'array', items: { type: 'string' } }
            ],
            example: ['field1 should not be empty', 'field2 must be a valid email']
          },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Missing or invalid JWT token',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - Insufficient permissions',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Forbidden resource' },
          error: { type: 'string', example: 'Forbidden' },
        },
      },
    }),
    ApiResponse({ 
      status: 500, 
      description: 'Internal Server Error',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' },
          error: { type: 'string', example: 'Internal Server Error' },
        },
      },
    }),
  );
}

/**
 * Protected endpoint decorator - combines Bearer auth with common responses
 */
export function ApiProtectedEndpoint(summary: string, description?: string) {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary, description }),
    ApiCommonResponses(),
  );
}

/**
 * Public endpoint decorator - common responses without auth
 */
export function ApiPublicEndpoint(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({ 
      status: 400, 
      description: 'Bad Request - Invalid input data' 
    }),
    ApiResponse({ 
      status: 500, 
      description: 'Internal Server Error' 
    }),
  );
}
