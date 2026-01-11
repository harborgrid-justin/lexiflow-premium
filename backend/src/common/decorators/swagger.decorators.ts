import { applyDecorators } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

/**
 * Standard success responses for all endpoints
 */
export const ApiStandardResponses = () => {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input data',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'array',
            items: { type: 'string' },
            example: ['title should not be empty', 'email must be a valid email'],
          },
          error: { type: 'string', example: 'Bad Request' },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
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
};

/**
 * Common pagination query parameters
 */
export const ApiPaginationQuery = () => {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (default: 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page (default: 20, max: 100)',
      example: 20,
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (e.g., "createdAt", "title")',
      example: 'createdAt',
    }),
    ApiQuery({
      name: 'order',
      required: false,
      enum: ['ASC', 'DESC'],
      description: 'Sort order',
      example: 'DESC',
    }),
  );
};

/**
 * Create operation decorator (POST)
 */
export const ApiCreateOperation = (summary: string, type: (...args: unknown[]) => unknown) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('JWT-auth'),
    ApiResponse({
      status: 201,
      description: 'Resource created successfully',
      type,
    }),
    ApiStandardResponses(),
  );
};

/**
 * Read/List operation decorator (GET)
 */
export const ApiReadOperation = (summary: string, type: unknown, isPaginated = false) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('JWT-auth'),
    ApiResponse({
      status: 200,
      description: 'Success',
      type,
    }),
    isPaginated ? ApiPaginationQuery() : () => {},
    ApiStandardResponses(),
  );
};

/**
 * Update operation decorator (PUT/PATCH)
 */
export const ApiUpdateOperation = (summary: string, type: (...args: unknown[]) => unknown) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('JWT-auth'),
    ApiResponse({
      status: 200,
      description: 'Resource updated successfully',
      type,
    }),
    ApiResponse({
      status: 404,
      description: 'Resource not found',
    }),
    ApiStandardResponses(),
  );
};

/**
 * Delete operation decorator (DELETE)
 */
export const ApiDeleteOperation = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('JWT-auth'),
    ApiResponse({
      status: 200,
      description: 'Resource deleted successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Resource deleted successfully' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Resource not found',
    }),
    ApiStandardResponses(),
  );
};

/**
 * File upload operation decorator
 */
export const ApiFileUploadOperation = (summary: string, fieldName = 'file') => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('JWT-auth'),
    ApiBody({
      description: 'File to upload',
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
            description: 'File to upload (max 100MB)',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'File uploaded successfully',
    }),
    ApiResponse({
      status: 413,
      description: 'File too large',
    }),
    ApiStandardResponses(),
  );
};

/**
 * Search operation decorator
 */
export const ApiSearchOperation = (summary: string, type: (...args: unknown[]) => unknown) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('JWT-auth'),
    ApiQuery({
      name: 'q',
      required: true,
      type: String,
      description: 'Search query string',
      example: 'contract dispute',
    }),
    ApiPaginationQuery(),
    ApiResponse({
      status: 200,
      description: 'Search results',
      type,
    }),
    ApiStandardResponses(),
  );
};

/**
 * UUID param decorator
 */
export const ApiUuidParam = (name: string, description: string) => {
  return ApiParam({
    name,
    type: String,
    format: 'uuid',
    description,
    example: '550e8400-e29b-41d4-a716-446655440000',
  });
};

/**
 * Bulk operation decorator
 */
export const ApiBulkOperation = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('JWT-auth'),
    ApiResponse({
      status: 200,
      description: 'Bulk operation completed',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          processed: { type: 'number', example: 25 },
          failed: { type: 'number', example: 2 },
          results: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    }),
    ApiStandardResponses(),
  );
};

/**
 * Export/Download operation decorator
 */
export const ApiExportOperation = (summary: string, formats: string[] = ['csv', 'xlsx', 'pdf']) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('JWT-auth'),
    ApiQuery({
      name: 'format',
      required: false,
      enum: formats,
      description: 'Export format',
      example: formats[0],
    }),
    ApiResponse({
      status: 200,
      description: 'File downloaded successfully',
      content: {
        'application/octet-stream': {
          schema: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiStandardResponses(),
  );
};
